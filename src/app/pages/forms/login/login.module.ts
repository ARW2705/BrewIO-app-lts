/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule, FormCheckboxComponentModule, FormInputComponentModule } from '../../../components/form-elements/public';
import { HeaderComponentModule } from '../../../components/shared/public';

/* Page imports */
import { LoginPage } from './login.page';


@NgModule({
  imports: [
    CommonModule,
    FormButtonsComponentModule,
    FormCheckboxComponentModule,
    FormInputComponentModule,
    FormsModule,
    HeaderComponentModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [
    LoginPage
  ]
})
export class LoginPageModule {}
