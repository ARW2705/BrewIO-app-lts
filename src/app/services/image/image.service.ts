/* Module imports */
import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Entry, Metadata } from '@ionic-native/file/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer/ngx';
import { Observable, forkJoin, from, of, throwError } from 'rxjs';
import { catchError, defaultIfEmpty, map, mergeMap, tap } from 'rxjs/operators';

/* Constant imports */
import {
  API_VERSION,
  BASE_URL,
  IMAGE_FILE_EXTENSION,
  IMAGE_SIZE_LIMIT
} from '../../shared/constants';

/* Default imports */
import { defaultImage } from '../../shared/defaults';

/* Interface imports */
import { Image, ImageRequestFormData, ImageRequestMetadata } from '../../shared/interfaces';

/* Type guard imports */
import { ImageGuardMetadata } from '../../shared/type-guard-metadata/image.guard';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Service imports */
import { ClientIdService } from '../client-id/client-id.service';
import { ErrorReportingService } from '../error-reporting/error-reporting.service';
import { FileService } from '../file/file.service';
import { TypeGuardService } from '../type-guard/type-guard.service';


@Injectable({
  providedIn: 'root'
})
export class ImageService {
  _defaultImage: Image = defaultImage();

  constructor(
    public camera: Camera,
    public clientIdService: ClientIdService,
    public crop: Crop,
    public errorReporter: ErrorReportingService,
    public fileService: FileService,
    public imageResizer: ImageResizer,
    public typeGuard: TypeGuardService
  ) { }

  /***** Device Actions *** */

  /**
   * Copy image file from device image gallery to local temporary directory
   *
   * @params: path - local directory path
   * @params: fileName - gallery image file name
   *
   * @return: observable of temporary Image
   */
  copyImageToLocalTmpDir(path: string, fileName: string): Observable<Image> {
    const cid: string = this.clientIdService.getNewId();

    return this.fileService.copyFileToLocalTmpDir(cid, path, fileName, IMAGE_FILE_EXTENSION)
      .pipe(
        map(([entry, metadata]: [Entry, Metadata]): Image => {
          const filePath: string = entry.nativeURL;
          const localURL: string = this.fileService.getLocalUrl(filePath);

          return {
            cid: cid,
            filePath: filePath,
            fileSize: metadata.size,
            hasPending: true,
            localURL: localURL,
            url: localURL
          };
        }),
        catchError(this.errorReporter.handleGenericCatchError())
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
    if (!filePath) {
      const message: string = `Deletion error: invalid file path: ${filePath}`;
      return throwError(new CustomError('ImageError', message, 2, message));
    }

    return this.fileService.deleteLocalFile(filePath);
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
            this.fileService.resolveNativePath(imagePath),
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
          return this.copyImageToLocalTmpDir(path, originalName);
        }),
        catchError(this.errorReporter.handleGenericCatchError())
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
  storeImageToLocalDir(image: Image, replaceImagePath?: string): Observable<Image> {
    if (!this.isTempImage(image)) {
      return of(image);
    }

    return this.resizeImage(image)
      .pipe(
        tap((resizedImagePath: string): void => {
          image.filePath = resizedImagePath;
          image.localURL = this.fileService.getLocalUrl(resizedImagePath);
          image.url = image.localURL;
        }),
        mergeMap((): Observable<string> => {
          const tempPath: string = `${this.fileService.getTmpDirPath()}${image.cid}${IMAGE_FILE_EXTENSION}`;
          console.log('moving to persistent from', tempPath);
          return this.deleteLocalImage(tempPath);
        }),
        mergeMap((): Observable<string> => {
          console.log('deleting old file', replaceImagePath);
          return !!replaceImagePath ? this.deleteLocalImage(replaceImagePath) : of(null);
        }),
        map((): Image => image),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /***** End Device Actions *** */


  /***** File Conversions *** */

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
      folderName: this.fileService.getPersistentDirPath(),
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
        files.push(this.fileService.getLocalFile(imageDatum.image.filePath));
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
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
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
      image.url = this._defaultImage.url;
    }
  }

  /**
   * Check if an image is the default image
   *
   * @params: image - image to check
   *
   * @return: true if image has the same id as the default image
   */
  hasDefaultImage(image: Image): boolean {
    return image.cid === this._defaultImage.cid;
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
    return this.fileService.getTmpDirPath()
      === image.filePath.substring(0, image.filePath.lastIndexOf('/') + 1);
  }

  /**
   * Check if given image object is valid by correctly implementing the Image interface
   *
   * @param: image - expects a Image at runtime
   *
   * @return: true if given image correctly implements Image interface
   */
  isSafeImage(image: any): boolean {
    return this.typeGuard.hasValidProperties(image, ImageGuardMetadata);
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

}
