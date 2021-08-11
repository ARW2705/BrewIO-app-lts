/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Constant imports */
import { MISSING_IMAGE_URL } from '../../shared/constants';

/* Interface imports */
import { InventoryItem } from '../../shared/interfaces';


@Component({
  selector: 'app-inventory-item-images',
  templateUrl: './inventory-item-images.component.html',
  styleUrls: ['./inventory-item-images.component.scss'],
})
export class InventoryItemImagesComponent {
  @Input() item: InventoryItem;
  @Output() imageErrorEvent: EventEmitter<{ imageType: string, event: CustomEvent}> = (
    new EventEmitter<{ imageType: string, event: CustomEvent}>()
  );
  missingImageURL: string = MISSING_IMAGE_URL;

  /**
   * Emit image error event
   *
   * @param: imageType - the image property name: either 'itemLabelImage' or 'supplierLabelImage'
   * @param: event - the triggered event
   *
   * @return: none
   */
  onImageError(imageType: string, event: CustomEvent): void {
    this.imageErrorEvent.emit({ imageType, event });
  }
}
