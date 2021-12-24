/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormErrorComponentModule } from '@components/form-elements/private/form-error/form-error.module';
import { FormInputComponent } from './form-input.component';


@NgModule({
  imports: [
    CommonModule,
    FormErrorComponentModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    FormInputComponent
  ],
  exports: [
    FormInputComponent
  ]
})
export class FormInputComponentModule {}
