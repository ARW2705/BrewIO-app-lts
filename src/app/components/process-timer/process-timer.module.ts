/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from '../../pipes/pipes.module';
import { TimerComponentModule } from '../timer/timer.module';

/* Component imports */
import { ProcessTimerComponent } from './process-timer.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PipesModule,
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
