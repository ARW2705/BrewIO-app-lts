/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule, FormCheckboxComponentModule, FormImageComponentModule, FormInputComponentModule } from '../../../form-elements/public';

/* Page imports */
import { SignupFormComponent } from './signup-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormButtonsComponentModule,
    FormCheckboxComponentModule,
    FormImageComponentModule,
    FormInputComponentModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [
    SignupFormComponent
  ]
})
export class SignupFormComponentModule {}
