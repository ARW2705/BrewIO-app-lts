/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { CalendarComponentModule } from '../calendar/calendar.module';
import { ProcessCalendarAlertsComponentModule } from '../process-calendar-alerts/process-calendar-alerts.module';
import { ProcessDescriptionComponentModule } from '../process-description/process-description.module';
import { ProcessCalendarComponent } from './process-calendar.component';


@NgModule({
  imports: [
    CalendarComponentModule,
    CommonModule,
    IonicModule,
    ProcessCalendarAlertsComponentModule,
    ProcessDescriptionComponentModule
  ],
  declarations: [
    ProcessCalendarComponent
  ],
  exports: [
    ProcessCalendarComponent
  ]
})
export class ProcessCalendarComponentModule {}
