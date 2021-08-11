/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { InventorySliderComponent } from './inventory-slider.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    InventorySliderComponent
  ],
  exports: [
    InventorySliderComponent
  ]
})
export class InventorySliderComponentModule {}
