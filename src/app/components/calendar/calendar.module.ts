/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DateButtonComponentModule } from '../date-button/date-button.module';

/* Pipe imports */
import { MomentPipeModule } from '../../pipes/moment/moment.module';

/* Component imports */
import { CalendarComponent } from './calendar.component';

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
