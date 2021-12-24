/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { UnitConversionPipeModule } from '@pipes/public';

/* Component imports */
import { ProcessDescriptionComponentModule } from '@components/process/private/process-description/process-description.module';
import { ProcessHeaderComponentModule } from '@components/process/private/process-header/process-header.module';
import { ProgressCircleComponentModule } from '@components/process/private/progress-circle/progress-circle.module';
import { TimerControlsComponentModule } from '@components/process/private/timer-controls/timer-controls.module';
import { AccordionComponentModule } from '@components/shared/public';
import { TimerComponent } from './timer.component';

@NgModule({
  imports: [
    AccordionComponentModule,
    CommonModule,
    IonicModule,
    ProcessDescriptionComponentModule,
    ProcessHeaderComponentModule,
    ProgressCircleComponentModule,
    TimerControlsComponentModule,
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
