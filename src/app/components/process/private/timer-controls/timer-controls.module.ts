/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { TimerControlsComponent } from './timer-controls.component';
import { TimerButtonComponentModule } from '../timer-button/timer-button.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TimerButtonComponentModule
  ],
  declarations: [
    TimerControlsComponent
  ],
  exports: [
    TimerControlsComponent
  ]
})
export class TimerControlsComponentModule {}
