/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { LoginSignupButtonComponent } from './login-signup-button.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    LoginSignupButtonComponent
  ],
  exports: [
    LoginSignupButtonComponent
  ]
})
export class LoginSignupButtonComponentModule {}
