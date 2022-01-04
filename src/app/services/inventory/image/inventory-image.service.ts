/* Module imports */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/* Interface imports*/
import { Image, ImageRequestFormData, ImageRequestMetadata, InventoryItem } from '@shared/interfaces';

/* Service imports */
import { ImageService } from '@services/image/image.service';


@Injectable({
  providedIn: 'root'
})
export class InventoryImageService {

  constructor(public imageService: ImageService) { }

  /**
   * Set up image storage function calls to persistently store image
   * If an existing persistent image is to be overridden, provide new path
   *
   * @param: item - item that contains the image(s)
   * @param: replacementPaths - object with original paths for overriding persistent image
   * @return: array of persistent image observables
   */
  composeImageStoreRequests(item: InventoryItem, replacementPaths: object = {}): Observable<Image>[] {
    const storeImages: Observable<Image>[] = [];
    let imageName: string = 'itemLabelImage';
    let image: Image = item.optionalItemData[imageName];
    if (image && image.hasPending) {
      storeImages.push(this.imageService.storeImageToLocalDir(image, replacementPaths[imageName]));
    }

    imageName = 'supplierLabelImage';
    image = item.optionalItemData[imageName];
    if (image && image.hasPending) {
      storeImages.push(this.imageService.storeImageToLocalDir(image, replacementPaths[imageName]));
    }

    return storeImages;
  }

  /**
   * Set up image upload request data
   *
   * @param: item - parent item to images
   * @return: array of objects with image and its formdata name
   */
  composeImageUploadRequests(item: InventoryItem): ImageRequestFormData[] {
    const imageRequests: ImageRequestFormData[] = [];
    let imageName: string = 'itemLabelImage';
    let image: Image = item.optionalItemData[imageName];
    console.log('compose image upload request', item);
    if (image && image.hasPending) {
      imageRequests.push({ image: item.optionalItemData[imageName], name: imageName });
    }

    imageName = 'supplierLabelImage';
    image = item.optionalItemData[imageName];
    if (image && image.hasPending) {
      imageRequests.push({ image: item.optionalItemData[imageName], name: imageName });
    }

    return imageRequests;
  }

  /**
   * Get image upload requests for a given item
   *
   * @param: item - the inventory item to use as request base
   * @return: observable of image request data
   */
  getImageRequest(item: InventoryItem): Observable<ImageRequestMetadata[]> {
    const imageRequests: ImageRequestFormData[] = this.composeImageUploadRequests(item);
    return this.imageService.blobbifyImages(imageRequests);
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
}
