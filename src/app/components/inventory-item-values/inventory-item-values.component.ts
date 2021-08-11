/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { InventoryItem } from '../../shared/interfaces';


@Component({
  selector: 'app-inventory-item-values',
  templateUrl: './inventory-item-values.component.html',
  styleUrls: ['./inventory-item-values.component.scss'],
})
export class InventoryItemValuesComponent {
  @Input() item: InventoryItem;
}
