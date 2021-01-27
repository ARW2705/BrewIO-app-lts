import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { UserComponent } from './user.component';
import { AccordionComponentModule } from '../accordion/accordion.module';
import { FriendsComponentModule } from '../friends/friends.module';
import { ProfileComponentModule } from '../profile/profile.module';

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
