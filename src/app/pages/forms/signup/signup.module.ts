/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponentModule } from '../../../components/header/header.module';
import { FormErrorComponentModule } from '../../../components/form-error/form-error.module';

/* Page imports */
import { SignupPage } from './signup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponentModule,
    FormErrorComponentModule
  ],
  declarations: [
    SignupPage
  ]
})
export class SignupPageModule {}
