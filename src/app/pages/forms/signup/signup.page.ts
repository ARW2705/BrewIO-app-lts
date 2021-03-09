/* Module imports */
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

/* Service imports */
import { FormValidationService } from '../../../services/form-validation/form-validation.service';
import { ToastService } from '../../../services/toast/toast.service';
import { UserService } from '../../../services/user/user.service';


@Component({
  selector: 'page-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss']
})
export class SignupPage implements OnInit, OnDestroy {
  @Input() rootURL: string;
  awaitingResponse: boolean = false;
  showPassword: boolean = false;
  signupForm: FormGroup = null;

  constructor(
    public formBuilder: FormBuilder,
    public formValidator: FormValidationService,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public toastService: ToastService,
    public userService: UserService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('signup page init');
    this.initForm();
  }

  ngOnDestroy() {
    console.log('signup page destroy');
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

  /**
   * Call modal dismiss method with no data
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
    this.signupForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.minLength(6),
          Validators.maxLength(20),
          Validators.required
        ]
      ],
      password: [
        '',
        [
          Validators.minLength(12),
          Validators.maxLength(30),
          Validators.required,
          this.formValidator.passwordPattern()
        ]
      ],
      passwordConfirmation: ['', [Validators.required]],
      email: ['', [Validators.email, Validators.required]],
      firstname: ['', [Validators.maxLength(50)]],
      lastname: ['', [Validators.maxLength(50)]]
    }, {
      validator: this.formValidator.passwordMatch()
    });
  }

  /**
   * Submit user signup form to user service, provide feedback on response
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

    this.userService.signUp(this.signupForm.value)
      .pipe(finalize(() => {
        loading.dismiss();
        this.awaitingResponse = false;
      }))
      .subscribe(
        (): void => {
          this.toastService.presentToast(
            'Sign up complete!',
            1500,
            'middle',
            'toast-bright'
          );
          this.dismiss();
        },
        (error: string): void => this.toastService.presentErrorToast(error, this.dismiss.bind(this))
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

}
