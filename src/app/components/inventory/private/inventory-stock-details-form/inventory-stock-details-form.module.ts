/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormInputComponentModule } from '../../../form-elements/public/form-input/form-input.module';
import { FormSelectComponentModule } from '../../../form-elements/public/form-select/form-select.module';
import { QuantityHelperComponentModule } from '../quantity-helper/quantity-helper.module';
import { InventoryStockDetailsFormComponent } from './inventory-stock-details-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormInputComponentModule,
    FormSelectComponentModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    QuantityHelperComponentModule
  ],
  declarations: [ InventoryStockDetailsFormComponent ],
  exports: [ InventoryStockDetailsFormComponent ]
})
export class InventoryStockDetailsFormComponentModule {}
