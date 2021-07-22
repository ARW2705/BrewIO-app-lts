/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { RatioPipeModule, UnitConversionPipeModule } from '../../pipes/pipes';

/* Component imports */
import { GrainBillComponent } from './grain-bill.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RatioPipeModule,
    UnitConversionPipeModule
  ],
  declarations: [
    GrainBillComponent
  ],
  exports: [
    GrainBillComponent
  ]
})
export class GrainBillComponentModule {}
