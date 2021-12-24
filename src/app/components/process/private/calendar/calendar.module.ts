/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { MomentPipeModule } from '@pipes/public';

/* Component imports */
import { CalendarControlsComponentModule } from '@components/process/private/calendar-controls/calendar-controls.module';
import { CalendarInteractiveDisplayComponentModule } from '@components/process/private/calendar-interactive-display/calendar-interactive-display.module';
import { DateButtonComponentModule } from '@components/process/private/date-button/date-button.module';
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
