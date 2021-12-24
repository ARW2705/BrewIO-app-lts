/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { CalendarComponentModule } from '@components/process/private/calendar/calendar.module';
import { ProcessCalendarAlertsComponentModule } from '@components/process/private/process-calendar-alerts/process-calendar-alerts.module';
import { ProcessDescriptionComponentModule } from '@components/process/private/process-description/process-description.module';
import { ProcessHeaderComponentModule } from '@components/process/private/process-header/process-header.module';
import { ProcessPreviewContentComponentModule } from '@components/process/private/process-preview-content/process-preview-content.module';
import { ProcessCalendarComponent } from './process-calendar.component';


@NgModule({
  imports: [
    CalendarComponentModule,
    CommonModule,
    IonicModule,
    ProcessCalendarAlertsComponentModule,
    ProcessDescriptionComponentModule,
    ProcessHeaderComponentModule,
    ProcessPreviewContentComponentModule
  ],
  declarations: [
    ProcessCalendarComponent
  ],
  exports: [
    ProcessCalendarComponent
  ]
})
export class ProcessCalendarComponentModule {}
