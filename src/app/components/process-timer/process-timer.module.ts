/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { FormatTimePipeModule, UnitConversionPipeModule } from '../../pipes/pipes';

/* Component imports */
import { ProcessDescriptionComponentModule } from '../process-description/process-description.module';
import { ProcessHeaderComponentModule } from '../process-header/process-header.module';
import { ProcessPreviewContentComponentModule } from '../process-preview-content/process-preview-content.module';
import { TimerControlsComponentModule } from '../timer-controls/timer-controls.module';
import { TimerComponentModule } from '../timer/timer.module';
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
