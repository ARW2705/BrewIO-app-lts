/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FriendsComponent } from './friends.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [
    FriendsComponent
  ],
  exports: [
    FriendsComponent
  ]
})
export class FriendsComponentModule {}
