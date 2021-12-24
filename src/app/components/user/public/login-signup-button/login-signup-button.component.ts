/* Module imports */
import { Component, Input } from '@angular/core';

/* Component imports */
import { LoginFormComponent } from '@components/user/public/login-form/login-form.component';
import { SignupFormComponent } from '@components/user/public/signup-form/signup-form.component';

/* Service Imports */
import { ActionSheetService, ErrorReportingService, ModalService, UserService } from '@services/public';


@Component({
  selector: 'app-login-signup-button',
  templateUrl: './login-signup-button.component.html',
  styleUrls: ['./login-signup-button.component.scss'],
})
export class LoginSignupButtonComponent {
  @Input() isIconButton: boolean;

  constructor(
    public actionService: ActionSheetService,
    public errorReporter: ErrorReportingService,
    public modalService: ModalService,
    public userService: UserService
  ) { }

  /**
   * Open login modal
   *
   * @param: none
   * @return: none
   */
  openLogin(): void {
    this.modalService.openModal<null>(LoginFormComponent, {})
      .subscribe(
        (): void => {},
        (error: Error) => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Open signup modal
   *
   * @param: none
   * @return: none
   */
   openSignup(): void {
    this.modalService.openModal<null>(SignupFormComponent, {})
      .subscribe(
        (): void => {},
        (error: Error) => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Action sheet to choose login or signup modal
   *
   * @param: none
   * @return: none
   */
  openActionSheet(): void {
    this.actionService.openActionSheet(
      'Log In or Sign Up',
      [
        {
          text: 'Log In',
          handler: (): void => { this.openLogin(); }
        },
        {
          text: 'Sign Up',
          handler: (): void => { this.openSignup(); }
        }
      ]
    );
  }

}
