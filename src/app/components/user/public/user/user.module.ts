/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { AccordionComponentModule } from '@components/shared/accordion/accordion.module';
import { FriendsComponentModule } from '@components/user/private/friends/friends.module';
import { ProfileComponentModule } from '@components/user/private/profile/profile.module';
import { LoginSignupButtonComponentModule } from '../login-signup-button/login-signup-button.module';
import { UserComponent } from './user.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AccordionComponentModule,
    FriendsComponentModule,
    LoginSignupButtonComponentModule,
    ProfileComponentModule
  ],
  declarations: [
    UserComponent
  ],
  exports: [
    UserComponent
  ]
})
export class UserComponentModule {}
