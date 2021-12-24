/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { TimerButtonComponentModule } from '@components/process/private/timer-button/timer-button.module';
import { TimerControlsComponent } from './timer-controls.component';

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
