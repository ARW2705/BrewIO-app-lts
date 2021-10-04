/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponent } from './form-buttons.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [
    FormButtonsComponent
  ],
  exports: [
    FormButtonsComponent
  ]
})
export class FormButtonsComponentModule {}
