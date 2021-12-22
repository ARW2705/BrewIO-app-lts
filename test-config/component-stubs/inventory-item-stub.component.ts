/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { InventoryItem } from '../../src/app/shared/interfaces';

/* Component imports */
import { InventoryItemComponent } from '../../src/app/components/inventory/private/inventory-item/inventory-item.component';

@Component({
  selector: 'app-inventory-item',
  template: '',
  providers: [
    { provide: InventoryItemComponent, useClass: InventoryItemComponentStub }
  ]
})
export class InventoryItemComponentStub {
  @Input() item: InventoryItem;
  @Input() refreshPipes: boolean;
  @Output() imageErrorEvent: EventEmitter<{ imageType: string, event: CustomEvent }> = (
    new EventEmitter<{ imageType: string, event: CustomEvent }>()
  );
}
