/* Module imports */
import { Component } from '@angular/core';

/* Component imports */
import { ProfileComponent } from '../../src/app/components/user/private/profile/profile.component';

@Component({
  selector: 'calendar',
  template: '',
  providers: [
    { provide: ProfileComponent, useClass: ProfileComponentStub }
  ]
})
export class ProfileComponentStub {}
