/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { DateButtonComponentModule } from '../date-button/date-button.module';
import { CalendarInteractiveDisplayComponent } from './calendar-interactive-display.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    DateButtonComponentModule
  ],
  declarations: [
    CalendarInteractiveDisplayComponent
  ],
  exports: [
    CalendarInteractiveDisplayComponent
  ]
})
export class CalendarInteractiveDisplayComponentModule {}
