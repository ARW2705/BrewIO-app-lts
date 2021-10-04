/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { UnitConversionPipeModule } from '../../../../pipes/pipes';

/* Component imports */
import { AccordionComponentModule } from '../../../shared/public';
import { ProcessDescriptionComponentModule } from '../process-description/process-description.module';
import { ProcessHeaderComponentModule } from '../process-header/process-header.module';
import { ProgressCircleComponentModule } from '../progress-circle/progress-circle.module';
import { TimerControlsComponentModule } from '../timer-controls/timer-controls.module';
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
