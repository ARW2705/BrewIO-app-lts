/* Module imports */
import { Component } from '@angular/core';

/* Component imports */
import { LoginPage } from '../../src/app/pages/forms/login/login.page';

@Component({
  selector: 'page-login',
  template: '',
  providers: [
    { provide: LoginPage, useClass: LoginPageStub }
  ]
})
export class LoginPageStub {}
