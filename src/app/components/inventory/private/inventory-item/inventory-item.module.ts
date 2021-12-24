/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { InventoryItemDescriptionComponentModule } from '@components/inventory/private/inventory-item-description/inventory-item-description.module';
import { InventoryItemImagesComponentModule } from '@components/inventory/private/inventory-item-images/inventory-item-images.module';
import { InventoryItemValuesComponentModule } from '@components/inventory/private/inventory-item-values/inventory-item-values.module';
import { InventoryItemComponent } from './inventory-item.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    InventoryItemDescriptionComponentModule,
    InventoryItemImagesComponentModule,
    InventoryItemValuesComponentModule
  ],
  declarations: [
    InventoryItemComponent
  ],
  exports: [
    InventoryItemComponent
  ]
})
export class InventoryItemComponentModule {}
