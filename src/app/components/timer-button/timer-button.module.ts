/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { TimerButtonComponent } from './timer-button.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    TimerButtonComponent
  ],
  exports: [
    TimerButtonComponent
  ]
})
export class TimerButtonComponentModule {}
