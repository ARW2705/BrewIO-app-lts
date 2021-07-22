/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { MomentPipeModule } from '../../pipes/pipes';

/* Component imports */
import { CalendarComponent } from './calendar.component';
import { DateButtonComponentModule } from '../date-button/date-button.module';


@NgModule({
  imports: [
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
