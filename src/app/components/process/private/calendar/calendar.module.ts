/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { MomentPipeModule } from '../../../../pipes/pipes';

/* Component imports */
import { CalendarControlsComponentModule } from '../calendar-controls/calendar-controls.module';
import { CalendarInteractiveDisplayComponentModule } from '../calendar-interactive-display/calendar-interactive-display.module';
import { DateButtonComponentModule } from '../date-button/date-button.module';
import { CalendarComponent } from './calendar.component';


@NgModule({
  imports: [
    CalendarControlsComponentModule,
    CalendarInteractiveDisplayComponentModule,
    CommonModule,
    IonicModule,
    DateButtonComponentModule,
    MomentPipeModule
  ],
  declarations: [
    CalendarComponent
  ],
  exports: [
    CalendarComponent
  ]
})
export class CalendarComponentModule {}
