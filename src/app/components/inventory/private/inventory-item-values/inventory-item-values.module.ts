/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { FormatStockPipeModule, RoundPipeModule, TruncatePipeModule } from '../../../../pipes/pipes';

/* Component imports */
import { InventoryItemValuesComponent } from './inventory-item-values.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormatStockPipeModule,
    RoundPipeModule,
    TruncatePipeModule
  ],
  declarations: [
    InventoryItemValuesComponent
  ],
  exports: [
    InventoryItemValuesComponent
  ]
})
export class InventoryItemValuesComponentModule {}
