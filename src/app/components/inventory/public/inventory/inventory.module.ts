/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormSelectComponentModule } from '../../../form-elements/public';
import { AccordionComponentModule, LoadingSpinnerComponentModule } from '../../../shared/public';
import { InventoryItemComponentModule } from '../../private/inventory-item/inventory-item.module';
import { InventorySliderComponentModule } from '../../private/inventory-slider/inventory-slider.module';
import { InventoryFormComponentModule } from '../inventory-form/inventory-form.module';
import { InventoryComponent } from './inventory.component';


@NgModule({
  imports: [
    AccordionComponentModule,
    CommonModule,
    FormSelectComponentModule,
    InventoryFormComponentModule,
    InventoryItemComponentModule,
    InventorySliderComponentModule,
    IonicModule,
    LoadingSpinnerComponentModule
  ],
  declarations: [
    InventoryComponent
  ],
  exports: [
    InventoryComponent
  ]
})
export class InventoryComponentModule {}
