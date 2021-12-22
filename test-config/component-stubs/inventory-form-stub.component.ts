/* Module imports */
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

/* Default imports */
import { defaultImage } from '../../src/app/shared/defaults';

/* Interface imports */
import { Author, Batch, FormSelectOption, Image, InventoryItem, Style } from '../../src/app/shared/interfaces';

/* Page imports */
import { InventoryFormComponent } from '../../src/app/components/inventory/public/inventory-form/inventory-form.component';

@Component({
  selector: 'app-inventory-form',
  template: '',
  providers: [
    { provide: InventoryFormComponent, useClass: InventoryFormComponentStub }
  ]
})
export class InventoryFormComponentStub {
  @Input() isRequired: boolean = false;
  @Input() options: { item?: InventoryItem, batch?: Batch };
  _defaultImage: Image = defaultImage();
  author: Author = null;
  batch: Batch = null;
  inventoryForm: FormGroup = null;
  isFormValid: boolean = false;
  itemDetailControls: { [key: string]: FormControl } = null;
  itemLabelImage: Image = this._defaultImage;
  onBackClick: () => void;
  selectedSource: string = null;
  selectedStockTypeName: string = null;
  selectedStyle: Style = null;
  stockDetailControls: { [key: string]: FormControl } = null;
  styleOptions: FormSelectOption[] = [];
  styles: Style[] = null;
  supplierDetailControls: { [key: string]: FormControl } = null;
  supplierLabelImage: Image = this._defaultImage;
  title: string = '';
}
