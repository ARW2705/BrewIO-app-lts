import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { DateButtonComponent } from './date-button.component';

import { PipesModule } from '../../pipes/pipes.module';

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
