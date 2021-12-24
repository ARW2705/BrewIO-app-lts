/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { InventoryItem } from '@shared/interfaces';


@Component({
  selector: 'app-inventory-item-description',
  templateUrl: './inventory-item-description.component.html',
  styleUrls: ['./inventory-item-description.component.scss'],
})
export class InventoryItemDescriptionComponent {
  @Input() item: InventoryItem;
}
