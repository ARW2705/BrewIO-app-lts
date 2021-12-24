/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { SortPipeModule } from '@pipes/public';

/* Component imports */
import { ProcessDescriptionComponentModule } from '@components/process/private/process-description/process-description.module';
import { ProcessCalendarAlertsComponent } from './process-calendar-alerts.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ProcessDescriptionComponentModule,
    SortPipeModule
  ],
  declarations: [
    ProcessCalendarAlertsComponent
  ],
  exports: [
    ProcessCalendarAlertsComponent
  ]
})
export class ProcessCalendarAlertsComponentModule {}
