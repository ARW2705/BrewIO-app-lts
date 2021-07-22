/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { SortPipeModule } from '../../pipes/pipes';

/* Component imports */
import { ProcessCalendarComponent } from './process-calendar.component';
import { CalendarComponentModule } from '../calendar/calendar.module';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SortPipeModule,
    CalendarComponentModule
  ],
  declarations: [
    ProcessCalendarComponent
  ],
  exports: [
    ProcessCalendarComponent
  ]
})
export class ProcessCalendarComponentModule {}
