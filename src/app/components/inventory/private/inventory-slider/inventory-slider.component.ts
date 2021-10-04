/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interace imports */
import { InventoryItem } from '../../../../shared/interfaces';


@Component({
  selector: 'app-inventory-slider',
  templateUrl: './inventory-slider.component.html',
  styleUrls: ['./inventory-slider.component.scss'],
})
export class InventorySliderComponent {
  @Input() item: InventoryItem;
  @Output() inventoryFormEvent: EventEmitter<null> = new EventEmitter<null>();
  @Output() expandItemEvent: EventEmitter<null> = new EventEmitter<null>();
  @Output() decrementCountEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Emit inventory form event
   *
   * @param: none
   * @return: none
   */
  openInventoryFormModal(): void {
    this.inventoryFormEvent.emit();
  }

  /**
   * Emit expand item event
   *
   * @param: none
   * @return: none
   */
  expandItem(): void {
    this.expandItemEvent.emit();
  }

  /**
   * Emit decrement item count event
   *
   * @param: none
   * @return: none
   */
  decrementCount(): void {
    this.decrementCountEvent.emit();
  }

}
