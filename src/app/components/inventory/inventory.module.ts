/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { FormatStockPipeModule, RoundPipeModule, TruncatePipeModule } from '../../pipes/pipes';

/* Page imports */
import { QuantityHelperPageModule } from '../../pages/quantity-helper/quantity-helper.module';
import { ImageFormPageModule } from '../../pages/forms/image-form/image-form.module';

/* Component imports */
import { InventoryComponent } from './inventory.component';
import { AccordionComponentModule } from '../accordion/accordion.module';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormatStockPipeModule,
    RoundPipeModule,
    TruncatePipeModule,
    AccordionComponentModule,
    ImageFormPageModule,
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
