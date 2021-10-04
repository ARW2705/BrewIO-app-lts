/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { FormatTimePipeModule, UnitConversionPipeModule } from '../../../../pipes/pipes';

/* Component imports */
import { ProcessDescriptionComponentModule } from '../../private/process-description/process-description.module';
import { ProcessHeaderComponentModule } from '../../private/process-header/process-header.module';
import { ProcessPreviewContentComponentModule } from '../../private/process-preview-content/process-preview-content.module';
import { TimerControlsComponentModule } from '../../private/timer-controls/timer-controls.module';
import { TimerComponentModule } from '../../private/timer/timer.module';
import { ProcessTimerComponent } from './process-timer.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormatTimePipeModule,
    ProcessDescriptionComponentModule,
    ProcessHeaderComponentModule,
    ProcessPreviewContentComponentModule,
    TimerComponentModule,
    TimerControlsComponentModule,
    UnitConversionPipeModule
  ],
  declarations: [
    ProcessTimerComponent
  ],
  exports: [
    ProcessTimerComponent
  ]
})
export class ProcessTimerComponentModule {}
