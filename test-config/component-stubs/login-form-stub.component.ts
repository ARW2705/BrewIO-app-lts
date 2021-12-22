/* Module imports */
import { Component } from '@angular/core';

/* Component imports */
import { LoginFormComponent } from '../../src/app/components/user/public/login-form/login-form.component';

@Component({
  selector: 'app-login-form',
  template: '',
  providers: [
    { provide: LoginFormComponent, useClass: LoginFormComponentStub }
  ]
})
export class LoginFormComponentStub {}
