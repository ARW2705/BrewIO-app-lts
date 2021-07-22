/* Module imports */
import { Component, Input, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

/* Interface imports */
import { User } from '../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, ToastService, UserService } from '../../../services/services';


@Component({
  selector: 'page-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  @Input() rootURL: string = '';
  awaitingResponse: boolean = false;
  loginForm: FormGroup = null;
  showPassword: boolean = false;

  constructor(
    public errorReporter: ErrorReportingService,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public toastService: ToastService,
    public userService: UserService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    this.initForm();
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

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
      remember: false,
      username: ['', Validators.required]
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

    const loading: HTMLIonLoadingElement = await this.loadingCtrl.create({
      cssClass: 'loading-custom',
      spinner: 'lines'
    });

    await loading.present();

    this.userService.logIn(this.loginForm.value, false)
      .pipe(finalize(() => {
        loading.dismiss();
        this.awaitingResponse = false;
      }))
      .subscribe(
        (user: User): void => {
          this.toastService.presentToast(
            `Welcome ${user.username}!`,
            1500,
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
   * @params: none
   * @return: none
   */
  togglePasswordVisible(): void {
    this.showPassword = !this.showPassword;
  }

  /***** End Form Methods *****/

}
