/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { CalendarControlsChangeButtonComponent } from './calendar-controls-change-button.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    CalendarControlsChangeButtonComponent
  ],
  exports: [
    CalendarControlsChangeButtonComponent
  ]
})
export class CalendarControlsChangeButtonComponentModule {}
