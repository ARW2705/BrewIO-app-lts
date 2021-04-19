/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormatTimePipeModule } from '../../pipes/format-time/format-time.module';
import { UnitConversionPipeModule } from '../../pipes/unit-conversion/unit-conversion.module';
import { TimerComponentModule } from '../timer/timer.module';

/* Component imports */
import { ProcessTimerComponent } from './process-timer.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormatTimePipeModule,
    UnitConversionPipeModule,
    TimerComponentModule
  ],
  declarations: [
    ProcessTimerComponent
  ],
  exports: [
    ProcessTimerComponent
  ]
})
export class ProcessTimerComponentModule {}
