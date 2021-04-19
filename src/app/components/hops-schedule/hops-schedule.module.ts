/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { CalculatePipeModule } from '../../pipes/calculate/calculate.module';
import { UnitConversionPipeModule } from '../../pipes/unit-conversion/unit-conversion.module';

/* Component imports */
import { HopsScheduleComponent } from './hops-schedule.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    CalculatePipeModule,
    UnitConversionPipeModule
  ],
  declarations: [
    HopsScheduleComponent
  ],
  exports: [
    HopsScheduleComponent
  ]
})
export class HopsScheduleComponentModule {}
