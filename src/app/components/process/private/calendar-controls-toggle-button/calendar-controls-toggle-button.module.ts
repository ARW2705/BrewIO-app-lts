/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { CalendarControlsToggleButtonComponent } from './calendar-controls-toggle-button.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    CalendarControlsToggleButtonComponent
  ],
  exports: [
    CalendarControlsToggleButtonComponent
  ]
})
export class CalendarControlsToggleButtonComponentModule {}
