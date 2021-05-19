/* Module imports */
import { Component } from '@angular/core';

/* Component imports */
import { UserComponent } from '../../src/app/components/user/user.component';

@Component({
  selector: 'user',
  template: '',
  providers: [
    { provide: UserComponent, useClass: UserComponentStub }
  ]
})
export class UserComponentStub {}
