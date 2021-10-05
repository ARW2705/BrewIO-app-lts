/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { InventoryItemDetailsFormComponentModule, InventoryStockDetailsFormComponentModule, InventorySupplierDetailsFormComponentModule } from '../../../components/inventory/public';
import { HeaderComponentModule } from '../../../components/shared/public';

/* Page imports */
import { QuantityHelperPageModule } from '../../quantity-helper/quantity-helper.module';
import { InventoryFormPage } from './inventory-form.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponentModule,
    InventoryItemDetailsFormComponentModule,
    InventoryStockDetailsFormComponentModule,
    InventorySupplierDetailsFormComponentModule,
    IonicModule,
    QuantityHelperPageModule,
    ReactiveFormsModule
  ],
  declarations: [
    InventoryFormPage
  ]
})
export class InventoryFormPageModule {}
