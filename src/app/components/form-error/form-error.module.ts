/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormErrorComponent } from './form-error.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [
    FormErrorComponent
  ],
  exports: [
    FormErrorComponent
  ]
})
export class FormErrorComponentModule {}
