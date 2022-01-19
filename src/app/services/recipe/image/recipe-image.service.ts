/* Module imports */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/* Interface imports*/
import { Image, ImageRequestFormData, ImageRequestMetadata, RecipeMaster } from '@shared/interfaces';

/* Service imports */
import { ImageService } from '@services/image/image.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeImageService {

  constructor(public imageService: ImageService) { }

  /**
   * Store a new image to the device
   *
   * @param: image - the image to store
   * @return: observable of updated image after storage has been performed or of null if an image
   * should not be stored
   */
  storeNewImage(image: Image): Observable<Image> {
    if (image && image.hasPending) {
      return this.storeImageToLocalDir(image);
    }
    return of(null);
  }

  /**
   * Delete an image from the device if it is not the default image
   *
   * @param: image - the image to delete
   * @return: none
   */
  deleteImage(image: Image): void {
    if (image && !this.imageService.hasDefaultImage(image)) {
      this.imageService.deleteLocalImage(image.filePath)
        .subscribe((errMsg: string): void => console.log('image deletion', errMsg));
    }
  }

  /**
   * Get image upload requests for a given item
   *
   * @param: recipe - the recipe that contains an image
   * @param: isMaster - true if for a recipe request; variant request will not upload an image
   * @return: observable of image request data
   */
  getImageRequest(recipe: RecipeMaster, isMaster: boolean): Observable<ImageRequestMetadata[]> {
    const imageRequest: ImageRequestFormData[] = [];
    if (isMaster && recipe.labelImage.hasPending) {
      imageRequest.push({ image: recipe.labelImage, name: 'labelImage'});
    }
    return this.imageService.blobbifyImages(imageRequest);
  }

  /**
   * Check if image has a filepath to the temporary directory
   *
   * @param: image - the image to check
   * @return: true if filepath is to the temporary directory
   */
  isTempImage(image: Image): boolean {
    return this.imageService.isTempImage(image);
  }

  /**
   * Store an image to the device
   *
   * @param: image - the image to store
   * @param: [replacementPath] - optional path of persistent image that is being replaced
   * @return: observable of updated image after storage has been performed
   */
  storeImageToLocalDir(image: Image, replacementPath: string = ''): Observable<Image> {
    return this.imageService.storeImageToLocalDir(image, replacementPath);
  }
}
