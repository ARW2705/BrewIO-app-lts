/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { HopsScheduleItemComponentModule } from '../hops-schedule-item/hops-schedule-item.module';
import { HopsScheduleComponent } from './hops-schedule.component';


@NgModule({
  imports: [
    CommonModule,
    HopsScheduleItemComponentModule,
    IonicModule
  ],
  declarations: [
    HopsScheduleComponent
  ],
  exports: [
    HopsScheduleComponent
  ]
})
export class HopsScheduleComponentModule {}
