/* Module imports */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File, FileEntry, Entry, IFile, FileError, Metadata } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer/ngx';
import { Observable, Observer, forkJoin, from, of, throwError } from 'rxjs';
import { defaultIfEmpty, map, mergeMap } from 'rxjs/operators';

/* Constant imports */
import { BASE_URL } from '../../shared/constants/base-url';
import { API_VERSION } from '../../shared/constants/api-version';
import { IMAGE_FILE_EXTENSION } from '../../shared/constants/image-extension';
import { IMAGE_SIZE_LIMIT } from '../../shared/constants/image-size-limit';

/* Default imports */
import { defaultImage } from '../../shared/defaults/default-image';

/* Interface imports */
import { Image, ImageRequestFormData, ImageRequestMetadata, PendingImageFlag } from '../../shared/interfaces/image';

/* Service imports */
import { ClientIdService } from '../client-id/client-id.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { StorageService } from '../storage/storage.service';


@Injectable({
  providedIn: 'root'
})
export class ImageService {
  _defaultImage: Image = defaultImage();
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
      this.file.copyFile(path, fileName, this.file.cacheDirectory, cid + IMAGE_FILE_EXTENSION)
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
    console.log('deleting image', filePath);
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

    console.log('storing image...');
    return this.resizeImage(image)
      .pipe(
        map((resizedImagePath: string): void => {
          image.filePath = resizedImagePath;
          image.localURL = this.webview.convertFileSrc(resizedImagePath);
          image.url = image.localURL;
          console.log('resizing', resizedImagePath, image.localURL);
        }),
        mergeMap((): Observable<string> => {
          const tempPath: string = `${this.file.cacheDirectory}/${image.cid}${IMAGE_FILE_EXTENSION}`;
          console.log('moving to persistent from', tempPath);
          return this.deleteLocalImage(tempPath);
        }),
        mergeMap((): Observable<string> => {
          console.log('deleting old file', replaceImagePath);
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
   * Prepare images to be uploaded to server
   *
   * @params: imageData - initial image request data
   *
   * @return: observable of image request metadata
   */
  blobbifyImages(imageData: ImageRequestFormData[]): Observable<ImageRequestMetadata[]> {
    const files: Observable<string | ArrayBuffer>[] = [];

    for (const imageDatum of imageData) {
      if (!this.isTempImage(imageDatum.image)) {
        files.push(this.getLocalFile(imageDatum.image.filePath));
      }
    }

    return forkJoin(files)
      .pipe(
        defaultIfEmpty([]),
        map((buffers: ArrayBuffer[]): ImageRequestMetadata[] => {
          return buffers
            .map((buffer: ArrayBuffer, index: number): ImageRequestMetadata => {
              return {
                name: imageData[index].name,
                blob: new Blob([buffer], { type: 'image/jpeg' }),
                filename: `${imageData[index].image.cid}${IMAGE_FILE_EXTENSION}`
              };
            });
        })
      );
  }

  /**
   * Compose image storage request if given image should be stored
   *
   * @params: image - the image data on which to base request
   * @params: pendingImages - array of image upload flags
   * @params: [overridePaths] - array of image file paths that will be overwritten
   *
   * @return: observable of stored images
   */
  composeImageStoreRequest(
    image: Image,
    pendingImages: PendingImageFlag[],
    overridePaths: { name: string, path: string }[] = []
  ): Observable<Image>[] {
    const storeImages: Observable<Image>[] = [];

    pendingImages.forEach((pending: PendingImageFlag): void => {
      if (pending.hasTemp) {
        const overridePath: { name: string, path: string } = overridePaths
          .find((pathData: { name: string, path: string }): boolean => {
            return pathData.name === pending.name;
          });
        const replacedPath: string = overridePath ? overridePath.path : null;
        storeImages.push(
          this.storeFileToLocalDir(
            image[pending.name],
            replacedPath
          )
        );
      }
    });

    return storeImages;
  }

  /***** End Server Upload Methods *** */


  /***** Other Methods *****/

  /**
   * Get complete server url for image filename
   *
   * @params: filename - string of server filename
   *
   * @return: complete url for image on server
   */
  getServerURL(filename: string): string {
    return `${BASE_URL}/${API_VERSION}/images/${filename}${IMAGE_FILE_EXTENSION}`;
  }

  /**
   * Handle image display error; attempt to change url to other sources or
   * assign to default image if no other option
   *
   * @params: image - the erroring image
   *
   * @return: none
   */
  handleImageError(image: Image): void {
    if (image.url === image.localURL) {
      image.url = this.getServerURL(image.serverFilename);
    } else {
      image.url = this._defaultImage.filePath;
    }
  }

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

  /**
   * Set the display url of an image with the following priority ->
   * localURL -> serverURL -> not-foundURL
   *
   * @params: image - image to modify
   *
   * @return: none
   */
  setInitialURL(image: Image): void {
    if (image) {
      if (image.localURL) {
        image.url = image.localURL;
      } else if (image.serverFilename) {
        image.url = this.getServerURL(image.serverFilename);
      } else {
        image.url = this._defaultImage.localURL;
      }
    }
  }

  /***** End Other Methods *****/

  hasDefaultImage(image: Image): boolean {
    return image.cid === this._defaultImage.cid;
  }

  /**
   * Check if new image should be uploaded to server
   * Images should be uploaded if they do not match the default image and if
   * image is a new compared to current image
   *
   * @params: currentData - the current doc that is pending addition or update
   * @params: newData - object containing new doc optional data
   * @params: imageKey - the particular image name to check
   *
   * @return: true if image should be uploaded to server
   */
  hasPendingImage(currentData: object, newData: object, imageKey: string): boolean {
    const hasNonDefaultImage: boolean = newData[imageKey] && newData[imageKey]['cid'] !== this._defaultImage['cid'];
    const hasDifferentNewImage: boolean = !!currentData[imageKey] && currentData[imageKey]['cid'] !== newData[imageKey]['cid'];

    return (
      (!currentData[imageKey] && hasNonDefaultImage)
      || (currentData[imageKey] && hasNonDefaultImage && hasDifferentNewImage)
    );
  }

}
