/* Module imports */
import { Component } from '@angular/core';

/* Component imports */
import { SignupFormComponent } from '../../src/app/components/user/public/signup-form/signup-form.component';

@Component({
  selector: 'app-signup-form',
  template: '',
  providers: [
    { provide: SignupFormComponent, useClass: SignupFormComponentStub }
  ]
})
export class SignupFormComponentStub {}
