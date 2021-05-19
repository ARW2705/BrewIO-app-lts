/* Module imports */
import { Component } from '@angular/core';

/* Page imports */
import { InventoryFormPage } from '../../src/app/pages/forms/inventory-form/inventory-form.page';

@Component({
  selector: 'page-inventory-form',
  template: '',
  providers: [
    { provide: InventoryFormPage, useClass: InventoryFormPageStub }
  ]
})
export class InventoryFormPageStub {}
