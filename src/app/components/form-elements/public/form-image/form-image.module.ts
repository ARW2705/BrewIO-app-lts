/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormImageComponent } from './form-image.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    FormImageComponent
  ],
  exports: [
    FormImageComponent
  ]
})
export class FormImageComponentModule {}
