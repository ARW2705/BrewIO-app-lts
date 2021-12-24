/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { UnitConversionPipeModule } from '@pipes/public';

/* Component imports */
import { HopsScheduleItemComponent } from './hops-schedule-item.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    UnitConversionPipeModule
  ],
  declarations: [
    HopsScheduleItemComponent
  ],
  exports: [
    HopsScheduleItemComponent
  ]
})
export class HopsScheduleItemComponentModule {}
