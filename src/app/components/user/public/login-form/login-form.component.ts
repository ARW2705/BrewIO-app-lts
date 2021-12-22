/* Module imports */
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';

/* Interface imports */
import { User } from '../../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, LoadingService, ToastService, UserService } from '../../../../services/services';


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  awaitingResponse: boolean = false;
  loginForm: FormGroup = null;
  passwordType: string = 'password';

  constructor(
    public errorReporter: ErrorReportingService,
    public formBuilder: FormBuilder,
    public loadingService: LoadingService,
    public modalCtrl: ModalController,
    public toastService: ToastService,
    public userService: UserService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  /**
   * Call ModalController dismiss method
   *
   * @params: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Create the form
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    this.loginForm = this.formBuilder.group({
      password: ['', Validators.required],
      username: ['', Validators.required],
      remember: false
    });
  }

  /**
   * Submit log in form and provide feedback toast on response
   *
   * @params: none
   * @return: none
   */
  async onSubmit(): Promise<void> {
    this.awaitingResponse = true;
    const loading: HTMLIonLoadingElement = await this.loadingService.createLoader();
    this.userService.logIn(this.loginForm.value, false)
      .pipe(finalize((): void => {
        loading.dismiss();
        this.awaitingResponse = false;
      }))
      .subscribe(
        (user: User): void => {
          this.toastService.presentToast(
            `Welcome ${user.username}`,
            this.toastService.mediumDuration,
            'middle',
            'toast-bright'
          );
          this.modalCtrl.dismiss(user);
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Toggle whether password is in plain text or hidden
   *
   * @params: showPassword - true if password input type should be 'text'; false for 'password'
   * @return: none
   */
  togglePasswordVisible(showPassword: boolean): void {
    if (showPassword) {
      this.passwordType = 'text';
    } else {
      this.passwordType = 'password';
    }
  }

}
