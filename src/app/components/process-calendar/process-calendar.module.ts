/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from '../../pipes/pipes.module';
import { CalendarComponentModule } from '../calendar/calendar.module';

/* Component imports */
import { ProcessCalendarComponent } from './process-calendar.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PipesModule,
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
