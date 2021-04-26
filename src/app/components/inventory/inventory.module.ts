/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AccordionComponentModule } from '../accordion/accordion.module';
import { ImageFormPageModule } from '../../pages/forms/image-form/image-form.module';

/* Pipe imports */
import { FormatStockPipeModule } from '../../pipes/format-stock/format-stock.module';
import { RoundPipeModule } from '../../pipes/round/round.module';
import { TruncatePipeModule } from '../../pipes/truncate/truncate.module';

/* Component imports */
import { InventoryComponent } from './inventory.component';
import { QuantityHelperComponentModule } from '../quantity-helper/quantity-helper.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormatStockPipeModule,
    RoundPipeModule,
    TruncatePipeModule,
    AccordionComponentModule,
    ImageFormPageModule,
    QuantityHelperComponentModule
  ],
  declarations: [
    InventoryComponent
  ],
  exports: [
    InventoryComponent
  ]
})
export class InventoryComponentModule {}
