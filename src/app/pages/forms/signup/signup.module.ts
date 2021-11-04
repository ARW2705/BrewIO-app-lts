/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule, FormCheckboxComponentModule, FormImageComponentModule, FormInputComponentModule } from '../../../components/form-elements/public';
import { HeaderComponentModule } from '../../../components/shared/public';

/* Page imports */
import { SignupPage } from './signup.page';


@NgModule({
  imports: [
    CommonModule,
    FormButtonsComponentModule,
    FormCheckboxComponentModule,
    FormImageComponentModule,
    FormInputComponentModule,
    FormsModule,
    HeaderComponentModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [
    SignupPage
  ]
})
export class SignupPageModule {}
