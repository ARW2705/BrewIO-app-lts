/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { AccordionComponentModule } from '../../../shared/accordion/accordion.module';
import { FriendsComponentModule } from '../../private/friends/friends.module';
import { ProfileComponentModule } from '../../private/profile/profile.module';
import { UserComponent } from './user.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AccordionComponentModule,
    FriendsComponentModule,
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
