/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { InventoryItemDetailsFormComponentModule } from '@components/inventory/private/inventory-item-details-form/inventory-item-details-form.module';
import { InventoryStockDetailsFormComponentModule } from '@components/inventory/private/inventory-stock-details-form/inventory-stock-details-form.module';
import { InventorySupplierDetailsFormComponentModule } from '@components/inventory/private/inventory-supplier-details-form/inventory-supplier-details-form.module';
import { QuantityHelperComponentModule } from '@components/inventory/private/quantity-helper/quantity-helper.module';
import { HeaderComponentModule } from '@components/shared/public';
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
