/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { InventoryItemImagesComponent } from './inventory-item-images.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [
    InventoryItemImagesComponent
  ],
  exports: [
    InventoryItemImagesComponent
  ]
})
export class InventoryItemImagesComponentModule {}
