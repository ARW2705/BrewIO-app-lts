/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ProgressCircleComponentModule } from '../progress-circle/progress-circle.module';
import { PipesModule } from '../../pipes/pipes.module';

/* Component imports */
import { TimerComponent } from './timer.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ProgressCircleComponentModule,
    PipesModule
  ],
  declarations: [
    TimerComponent
  ],
  exports: [
    TimerComponent
  ]
})
export class TimerComponentModule {}
