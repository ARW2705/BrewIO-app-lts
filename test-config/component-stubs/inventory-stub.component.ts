/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { Batch } from '../../src/app/shared/interfaces/batch';

/* Page imports */
import { InventoryComponent } from '../../src/app/components/inventory/inventory.component';

@Component({
  selector: 'inventory',
  template: '',
  providers: [
    { provide: InventoryComponent, useClass: InventoryComponentStub }
  ]
})
export class InventoryComponentStub {
  @Input() optionalData: Batch;
}
