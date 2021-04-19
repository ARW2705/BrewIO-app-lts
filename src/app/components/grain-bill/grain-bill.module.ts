/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { RatioPipeModule } from '../../pipes/ratio/ratio.module';
import { UnitConversionPipeModule } from '../../pipes/unit-conversion/unit-conversion.module';

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
