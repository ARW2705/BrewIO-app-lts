/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CalendarComponentModule } from '../calendar/calendar.module';

/* Pipe imports */
import { SortPipeModule } from '../../pipes/sort/sort.module';

/* Component imports */
import { ProcessCalendarComponent } from './process-calendar.component';

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
