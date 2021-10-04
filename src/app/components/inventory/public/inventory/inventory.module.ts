/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { ImageFormPageModule } from '../../../../pages/forms/image-form/image-form.module';
import { QuantityHelperPageModule } from '../../../../pages/quantity-helper/quantity-helper.module';

/* Component imports */
import { FormSelectComponentModule } from '../../../form-elements/public';
import { AccordionComponentModule, LoadingSpinnerComponentModule } from '../../../shared/public';
import { InventoryItemComponentModule } from '../../private/inventory-item/inventory-item.module';
import { InventorySliderComponentModule } from '../../private/inventory-slider/inventory-slider.module';
import { InventoryComponent } from './inventory.component';


@NgModule({
  imports: [
    AccordionComponentModule,
    CommonModule,
    FormSelectComponentModule,
    ImageFormPageModule,
    InventoryItemComponentModule,
    InventorySliderComponentModule,
    IonicModule,
    LoadingSpinnerComponentModule,
    QuantityHelperPageModule
  ],
  declarations: [
    InventoryComponent
  ],
  exports: [
    InventoryComponent
  ]
})
export class InventoryComponentModule {}
