/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from '../../pipes/pipes.module';

/* Component imports */
import { DateButtonComponent } from './date-button.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PipesModule
  ],
  declarations: [
    DateButtonComponent
  ],
  exports: [
    DateButtonComponent
  ]
})
export class DateButtonComponentModule {}
