/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { FormatTimePipeModule, UnitConversionPipeModule } from '@pipes/public';

/* Component imports */
import { ProcessDescriptionComponentModule } from '@components/process/private/process-description/process-description.module';
import { ProcessHeaderComponentModule } from '@components/process/private/process-header/process-header.module';
import { ProcessPreviewContentComponentModule } from '@components/process/private/process-preview-content/process-preview-content.module';
import { TimerControlsComponentModule } from '@components/process/private/timer-controls/timer-controls.module';
import { TimerComponentModule } from '@components/process/private/timer/timer.module';
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
