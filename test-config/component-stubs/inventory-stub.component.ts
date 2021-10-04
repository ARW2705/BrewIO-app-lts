/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { Batch } from '../../src/app/shared/interfaces';

/* Page imports */
import { InventoryComponent } from '../../src/app/components/inventory/public/inventory/inventory.component';

@Component({
  selector: 'inventory',
  template: '',
  providers: [
    { provide: InventoryComponent, useClass: InventoryComponentStub }
  ]
})
export class InventoryComponentStub {
  @Input() enterDuration: number;
  @Input() optionalData: Batch;
}
