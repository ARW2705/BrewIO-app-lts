/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { InventoryItemDescriptionComponent } from './inventory-item-description.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [
    InventoryItemDescriptionComponent
  ],
  exports: [
    InventoryItemDescriptionComponent
  ]
})
export class InventoryItemDescriptionComponentModule {}
