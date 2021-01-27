/* Module imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File, FileEntry, Entry, IFile, FileError, Metadata } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer/ngx';
import { Observable, Observer, forkJoin, from, of, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

/* Constant imports */
import { BASE_URL } from '../../shared/constants/base-url';
import { API_VERSION } from '../../shared/constants/api-version';
import { IMAGE_SIZE_LIMIT } from '../../shared/constants/image-size-limit';

/* Interface imports */
import { Image } from '../../shared/interfaces/image';

/* Service imports */
import { ClientIdService } from '../client-id/client-id.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { StorageService } from '../storage/storage.service';


@Injectable({
  providedIn: 'root'
})
export class ImageService {
  images: Image[] = [];

  constructor(
    public camera: Camera,
    public clientIdService: ClientIdService,
    public crop: Crop,
    public file: File,
    public filePath: FilePath,
    public http: HttpClient,
    public imageResizer: ImageResizer,
    public processHttpError: HttpErrorService,
    public storage: StorageService,
    public webview: WebView
  ) { }

  /***** Device Actions *** */

  /**
   * Get file entry metadata
   *
   * @params: entry - file entry to query
   *
   * @return: observable of metadata
   */
  getMetadata(entry: Entry): Observable<Metadata> {
    return new Observable((observer: Observer<Metadata>): void => {
      entry.getMetadata(
        (data: Metadata): void => {
          observer.next(data);
          observer.complete();
        },
        (error: any): void => {
          observer.error(error);
          observer.complete();
        }
      );
    });
  }

  /**
   * Copy image file from device image gallery to local temporary directory
   *
   * @params: path - local directory path
   * @params: fileName - gallery image file name
   *
   * @return: observable of temporary Image
   */
  copyFileToLocalTmpDir(path: string, fileName: string): Observable<Image> {
    const cid: string = this.clientIdService.getNewId();

    return from(
      this.file.copyFile(path, fileName, this.file.cacheDirectory, cid + '.jpg')
    )
    .pipe(
      mergeMap((entry: Entry): Observable<[Entry, Metadata]> => {
        return forkJoin(of(entry), this.getMetadata(entry));
      }),
      map(([entry, metadata]: [Entry, Metadata]): Image => {
        const filePath: string = entry.nativeURL;
        const localURL: string = this.webview.convertFileSrc(filePath);

        return {
          cid: cid,
          filePath: filePath,
          fileSize: metadata.size,
          localURL: localURL,
          url: localURL
        };
      })
    );
  }


  /**
   * Delete an image at the given file path
   *
   * @params: filePath - full path of image file
   *
   * @return: observable of error message or null on success; inner Observable
   * does not throw an error, rather just passes on the message
   */
  deleteLocalImage(filePath: string): Observable<string> {
    console.log('deleting image file', filePath);
    if (!filePath) {
      return throwError(`Deletion error: invalid file path: ${filePath}`);
    }

    return from(this.file.resolveLocalFilesystemUrl(filePath))
      .pipe(
        mergeMap((entry: FileEntry): Observable<string> => {
          return new Observable((observer: Observer<string>): void => {
            entry.remove(
              (): void => {
                observer.next(null);
                observer.complete();
              },
              (error: FileError): void => {
                console.log('file deletion error', error);
                observer.next(error.message);
                observer.complete();
              }
            );
          });
        })
      );
  }

  /**
   * Get a device file
   *
   * @params: path - file path to load
   *
   * @return: file buffer or error message
   */
  getLocalFile(path: string): Observable<string | ArrayBuffer> {
    return from(this.file.resolveLocalFilesystemUrl(path))
      .pipe(
        mergeMap((fileEntry: FileEntry): Observable<IFile | FileError> => {
          return this.convertFileEntrytoCordovaFile(fileEntry);
        }),
        mergeMap((file: IFile): Observable<string | ArrayBuffer> => {
          return this.convertCordovaFileToJSFile(file);
        })
      );
  }

  /**
   * Import an image from device
   *
   * @params: none
   *
   * @return: observable of Image
   */
  importImage(): Observable<Image> {
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    return from(this.camera.getPicture(options))
      .pipe(
        mergeMap((imagePath: string): Observable<string> => {
          return from(this.crop.crop(imagePath));
        }),
        mergeMap((imagePath: string): Observable<string[]> => {
          return forkJoin(
            from(this.filePath.resolveNativePath(imagePath)),
            of<string>(imagePath)
          );
        }),
        mergeMap(([filePath, imagePath]: string[]): Observable<Image> => {
          const path: string = filePath.substring(0, filePath.lastIndexOf('/') + 1);
          const originalName: string = imagePath
            .substring(
              imagePath.lastIndexOf('/') + 1,
              imagePath.lastIndexOf('?')
            );
          return this.copyFileToLocalTmpDir(path, originalName);
        })
      );
  }

  /**
   * Move image file locally from temporary to persistent directory
   * and update stored image file metadata
   *
   * @params: image - Image data containing file path
   * @params: [replaceImagePath] - path of persistent image that is being replaced
   *
   * @return: observable of persistent Image
   */
  storeFileToLocalDir(image: Image, replaceImagePath?: string): Observable<Image> {
    if (!this.isTempImage(image)) {
      return of(image);
    }

    return this.resizeImage(image)
      .pipe(
        map((resizedImagePath: string): void => {
          image.filePath = resizedImagePath;
          image.localURL = this.webview.convertFileSrc(resizedImagePath);
          image.url = image.localURL;
        }),
        mergeMap((): Observable<string> => {
          const tempPath: string = `${this.file.cacheDirectory}/${image.cid}.jpg`;
          return this.deleteLocalImage(tempPath);
        }),
        mergeMap((): Observable<string> => {
          return !!replaceImagePath ? this.deleteLocalImage(replaceImagePath) : of(null);
        }),
        map((): Image => image)
      );
  }

  /***** End Device Actions *** */


  /***** File Conversions *** */

  /**
   * Convert a cordova file to a js file
   *
   * @params: file - input cordova file to convert
   *
   * @return: observable of js file buffer or error message
   */
  convertCordovaFileToJSFile(file: IFile): Observable<string | ArrayBuffer> {
    const reader: FileReader = new FileReader();
    const reader$: Observable<string | ArrayBuffer> = new Observable(
      (observer: Observer<string | ArrayBuffer>): void => {
        reader.onload = (): void => {
          console.log('file', file);
          observer.next(reader.result);
          observer.complete();
        };
        reader.onerror = (): void => {
          observer.error(`file reader error: ${reader.error}`);
          observer.complete();
        };
      }
    );
    reader.readAsArrayBuffer(file);
    return reader$;
  }

  /**
   * Convert a file entry to a cordova file
   *
   * @params: file - input device file to convert
   *
   * @return: observable of cordova input file or file error
   */
  convertFileEntrytoCordovaFile(fileEntry: FileEntry): Observable<IFile | FileError> {
    return new Observable((observer: Observer<IFile | FileError>): void => {
      fileEntry.file(
        (file: IFile): void => {
          observer.next(file);
          observer.complete();
        },
        (error: FileError): void => {
          observer.error(error.message);
          observer.complete();
        }
      );
    });
  }

  /**
   * Resize an image
   *
   * @params: image - image metadata for image to resize
   *
   * @return: observable of resized image filepath
   */
  resizeImage(image: Image): Observable<string> {
    if (!image.fileSize) {
      return of(image.filePath);
    }

    // Reduce image quality so that it fits image size limit
    // rounded down to nearest tens place
    const reductionFactor: number = Math.min(
      100,
      Math.round((IMAGE_SIZE_LIMIT / image.fileSize) * 10) * 10
    );

    const options: ImageResizerOptions = {
      uri: image.filePath,
      folderName: this.file.dataDirectory,
      fileName: image.filePath.substring(image.filePath.lastIndexOf('/') + 1),
      quality: reductionFactor,
      width: 300,
      height: 300,
      base64: false
    };

    return from(this.imageResizer.resize(options));
  }

  /***** End File Conversions *** */


  /***** Server Upload Methods *** */

  /**
   * HTTP post image to server
   *
   * @params: formData - form data with image file
   * @params: route - the route extension for the request
   *
   * @return: observable of server response
   */
  postImage<T>(formData: FormData, route: string): Observable<T> {
    return this.http.post<T>(`${BASE_URL}/${API_VERSION}/images/${route}`, formData)
      .pipe(
          catchError((error: HttpErrorResponse): Observable<never> => {
          return this.processHttpError.handleError(error);
        })
      );
  }

  /**
   * Upload an array of images
   *
   * @params: imageData - array of objects containing
   * the image and name of image type
   * @params: route - the route extension for the request
   *
   * @return: observable of server response
   */
  uploadImages<T>(
    imageData: { image: Image, name: string }[],
    route: string
  ): Observable<T> {
    const files: Observable<string | ArrayBuffer>[] = imageData
      .map((_imageData: { image: Image, name: string }): Observable<string | ArrayBuffer> => {
        return this.getLocalFile(_imageData.image.filePath);
      });

    return forkJoin(files)
      .pipe(
        mergeMap((buffers: ArrayBuffer[]): Observable<T> => {
          const formData: FormData = new FormData();
          buffers.forEach((buffer: ArrayBuffer, index: number): void => {
            const imageBlob: Blob = new Blob([buffer], { type: 'image/jpeg' });
            formData.append(
              imageData[index].name,
              imageBlob,
              `${imageData[index].image.cid}.jpg`
            );
          });

          return this.postImage<T>(formData, route);
        })
      );
  }

  /***** End Server Upload Methods *** */


  /***** Other Methods *****/

  /**
   * Check if image has a filepath to the temporary directory
   *
   * @params: image - image with metadata to check
   *
   * @return: true if filepath is to temporary directory
   */
  isTempImage(image: Image): boolean {
    if (!image || !image.filePath) {
      return false;
    }
    return this.file.cacheDirectory
      === image.filePath.substring(0, image.filePath.lastIndexOf('/') + 1);
  }

  /**
   * Load images from storage
   *
   * @params: none
   * @return: none
   */
  loadImagesFromStorage(): void {
    this.storage.getImages()
      .subscribe(
        (images: Image[]): void => {
          this.images = images;
        },
        (error: string): void => {
          console.log(`${error}: awaiting data from server`);
        }
      );
  }

  /***** End Other Methods *****/

}
