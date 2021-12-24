/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormSelectComponentModule } from '@components/form-elements/public';
import { InventoryItemComponentModule } from '@components/inventory/private/inventory-item/inventory-item.module';
import { InventorySliderComponentModule } from '@components/inventory/private/inventory-slider/inventory-slider.module';
import { InventoryFormComponentModule } from '@components/inventory/public/inventory-form/inventory-form.module';
import { AccordionComponentModule, LoadingSpinnerComponentModule } from '@components/shared/public';
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
