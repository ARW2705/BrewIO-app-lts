/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { RatioPipeModule, UnitConversionPipeModule } from '../../../../pipes/pipes';

/* Component imports */
import { GrainBillItemComponent } from './grain-bill-item.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RatioPipeModule,
    UnitConversionPipeModule
  ],
  declarations: [
    GrainBillItemComponent
  ],
  exports: [
    GrainBillItemComponent
  ]
})
export class GrainBillItemComponentModule {}
