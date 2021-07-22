/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { UnitConversionPipeModule } from '../../pipes/pipes';

/* Component imports */
import { TimerComponent } from './timer.component';
import { ProgressCircleComponentModule } from '../progress-circle/progress-circle.module';


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
