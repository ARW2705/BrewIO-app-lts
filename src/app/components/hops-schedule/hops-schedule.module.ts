/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from '../../pipes/pipes.module';

/* Component imports */
import { HopsScheduleComponent } from './hops-schedule.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PipesModule
  ],
  declarations: [
    HopsScheduleComponent
  ],
  exports: [
    HopsScheduleComponent
  ]
})
export class HopsScheduleComponentModule {}
