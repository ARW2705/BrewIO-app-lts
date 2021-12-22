/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule, FormCheckboxComponentModule, FormInputComponentModule } from '../../../form-elements/public';

/* Page imports */
import { LoginFormComponent } from './login-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormButtonsComponentModule,
    FormCheckboxComponentModule,
    FormInputComponentModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [
    LoginFormComponent
  ],
  exports: [
    LoginFormComponent
  ]
})
export class LoginFormComponentModule {}
