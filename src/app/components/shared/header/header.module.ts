/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { LoginSignupButtonComponentModule } from '../../user/public/login-signup-button/login-signup-button.module';
import { HeaderComponent } from './header.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    LoginSignupButtonComponentModule
  ],
  declarations: [
    HeaderComponent
  ],
  exports: [
    HeaderComponent
  ]
})
export class HeaderComponentModule {}
