/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { InventoryItem } from '../../shared/interfaces';


@Component({
  selector: 'app-inventory-item',
  templateUrl: './inventory-item.component.html',
  styleUrls: ['./inventory-item.component.scss'],
})
export class InventoryItemComponent {
  @Input() item: InventoryItem;
  @Output() imageErrorEvent: EventEmitter<{ imageType: string, event: CustomEvent }> = (
    new EventEmitter<{ imageType: string, event: CustomEvent }>()
  );

  /**
   * Re-emit image error event to parent component
   *
   * @param: event - image error event emitted from child component
   *
   * @return: none
   */
  onImageError(event: { imageType: string, event: CustomEvent }): void {
    this.imageErrorEvent.emit(event);
  }
}
