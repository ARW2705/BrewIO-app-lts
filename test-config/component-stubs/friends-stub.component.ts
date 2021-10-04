/* Module imports */
import { Component } from '@angular/core';

/* Component imports */
import { FriendsComponent } from '../../src/app/components/user/private/friends/friends.component';

@Component({
  selector: 'calendar',
  template: '',
  providers: [
    { provide: FriendsComponent, useClass: FriendsComponentStub }
  ]
})
export class FriendsComponentStub {}
