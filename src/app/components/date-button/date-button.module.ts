/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { MomentPipeModule } from '../../pipes/pipes';

/* Component imports */
import { DateButtonComponent } from './date-button.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    MomentPipeModule
  ],
  declarations: [
    DateButtonComponent
  ],
  exports: [
    DateButtonComponent
  ]
})
export class DateButtonComponentModule {}
