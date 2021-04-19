/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ProgressCircleComponentModule } from '../progress-circle/progress-circle.module';
import { UnitConversionPipeModule } from '../../pipes/unit-conversion/unit-conversion.module';

/* Component imports */
import { TimerComponent } from './timer.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ProgressCircleComponentModule,
    UnitConversionPipeModule
  ],
  declarations: [
    TimerComponent
  ],
  exports: [
    TimerComponent
  ]
})
export class TimerComponentModule {}
