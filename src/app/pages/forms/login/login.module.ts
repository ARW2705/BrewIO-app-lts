/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Component imports */
import { HeaderComponentModule } from '../../../components/header/header.module';

/* Page imports */
import { LoginPage } from './login.page';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponentModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    LoginPage
  ]
})
export class LoginPageModule {}
