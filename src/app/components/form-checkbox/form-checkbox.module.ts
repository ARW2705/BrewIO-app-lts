/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormErrorComponentModule } from '../form-error/form-error.module';
import { FormCheckboxComponent } from './form-checkbox.component';


@NgModule({
  imports: [
    CommonModule,
    FormErrorComponentModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    FormCheckboxComponent
  ],
  exports: [
    FormCheckboxComponent
  ]
})
export class FormCheckboxComponentModule {}
