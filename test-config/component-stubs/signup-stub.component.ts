/* Module imports */
import { Component } from '@angular/core';

/* Component imports */
import { SignupPage } from '../../src/app/pages/forms/signup/signup.page';

@Component({
  selector: 'page-signup',
  template: '',
  providers: [
    { provide: SignupPage, useClass: SignupPageStub }
  ]
})
export class SignupPageStub {}
