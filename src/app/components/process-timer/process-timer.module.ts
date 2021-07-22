/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { FormatTimePipeModule, UnitConversionPipeModule } from '../../pipes/pipes';

/* Component imports */
import { ProcessTimerComponent } from './process-timer.component';
import { TimerComponentModule } from '../timer/timer.module';


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
