/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { HeaderComponentModule } from '../../../shared/public';
import { InventoryItemDetailsFormComponentModule } from '../../private/inventory-item-details-form/inventory-item-details-form.module';
import { InventoryStockDetailsFormComponentModule } from '../../private/inventory-stock-details-form/inventory-stock-details-form.module';
import { InventorySupplierDetailsFormComponentModule } from '../../private/inventory-supplier-details-form/inventory-supplier-details-form.module';
import { QuantityHelperComponentModule } from '../../private/quantity-helper/quantity-helper.module';
import { InventoryFormComponent } from './inventory-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponentModule,
    InventoryItemDetailsFormComponentModule,
    InventoryStockDetailsFormComponentModule,
    InventorySupplierDetailsFormComponentModule,
    IonicModule,
    QuantityHelperComponentModule,
    ReactiveFormsModule
  ],
  declarations: [
    InventoryFormComponent
  ]
})
export class InventoryFormComponentModule {}
