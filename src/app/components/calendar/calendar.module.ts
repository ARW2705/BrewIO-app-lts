/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from '../../pipes/pipes.module';
import { DateButtonComponentModule } from '../date-button/date-button.module';

/* Component imports */
import { CalendarComponent } from './calendar.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    DateButtonComponentModule,
    PipesModule
  ],
  declarations: [
    CalendarComponent
  ],
  exports: [
    CalendarComponent
  ]
})
export class CalendarComponentModule {}
