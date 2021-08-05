/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { MomentPipeModule } from '../../pipes/pipes';

/* Component imports */
import { CalendarControlsChangeButtonComponentModule } from '../calendar-controls-change-button/calendar-controls-change-button.module';
import { CalendarControlsToggleButtonComponentModule } from '../calendar-controls-toggle-button/calendar-controls-toggle-button.module';
import { CalendarControlsComponent } from './calendar-controls.component';


@NgModule({
  imports: [
    CalendarControlsChangeButtonComponentModule,
    CalendarControlsToggleButtonComponentModule,
    CommonModule,
    IonicModule,
    MomentPipeModule
  ],
  declarations: [
    CalendarControlsComponent
  ],
  exports: [
    CalendarControlsComponent
  ]
})
export class CalendarControlsComponentModule {}
