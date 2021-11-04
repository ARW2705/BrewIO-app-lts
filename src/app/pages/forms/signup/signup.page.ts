/* Module imports */
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';

/* Constant imports */
import { NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '../../../shared/constants';

/* Default imports */
import { defaultImage } from '../../../shared/defaults';

/* Interface imports */
import { Image, User } from '../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, FormValidationService, LoadingService, ToastService, UserService } from '../../../services/services';


@Component({
  selector: 'page-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss']
})
export class SignupPage implements OnInit {
  @Input() rootURL: string;
  awaitingResponse: boolean = false;
  defaultImage: Image = defaultImage();
  breweryLabelImage: Image = this.defaultImage;
  passwordType: string = 'password';
  signupForm: FormGroup = null;
  userImage: Image = this.defaultImage;

  constructor(
    public formBuilder: FormBuilder,
    public errorReporter: ErrorReportingService,
    public formValidator: FormValidationService,
    public loadingService: LoadingService,
    public modalCtrl: ModalController,
    public toastService: ToastService,
    public userService: UserService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('signup page init');
    this.initForm();
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
      username            : ['', [Validators.minLength(USERNAME_MIN_LENGTH), Validators.maxLength(USERNAME_MAX_LENGTH), Validators.required]                                      ],
      password            : ['', [Validators.minLength(PASSWORD_MIN_LENGTH), Validators.maxLength(PASSWORD_MAX_LENGTH), Validators.required, this.formValidator.passwordPattern()]],
      passwordConfirmation: ['', [Validators.required]                                                                                                                            ],
      email               : ['', [Validators.email, Validators.required]                                                                                                          ],
      firstname           : ['', [Validators.maxLength(NAME_MAX_LENGTH)]                                                                                                          ],
      lastname            : ['', [Validators.maxLength(NAME_MAX_LENGTH)]                                                                                                          ]
    }, {
      validator: this.formValidator.passwordMatch()
    });
  }

  /**
   * Handle result from form-image modal
   *
   * @param: image - the returned image
   * @param: imageType - identifier to determine which image should be updated
   * @return: none
   */
  imageModalDismiss(image: Image, imageType: string): void {
    if (imageType === 'userImage' && image) {
      this.userImage = image;
    } else if (imageType === 'breweryLabelImage' && image) {
      this.breweryLabelImage = image;
    }
  }

  /**
   * Submit user signup form to user service, provide feedback on response
   *
   * @params: none
   * @return: none
   */
  async onSubmit(): Promise<void> {
    this.awaitingResponse = true;

    const loading: HTMLIonLoadingElement = await this.loadingService.createLoader();
    const newUser: object = this.signupForm.value;
    newUser['userImage'] = this.userImage;
    newUser['breweryLabelImage'] = this.breweryLabelImage;

    this.userService.signUp(<User>newUser)
      .pipe(finalize(() => {
        loading.dismiss();
        this.awaitingResponse = false;
      }))
      .subscribe(
        (): void => {
          this.toastService.presentToast(
            'Sign up complete!',
            this.toastService.mediumDuration,
            'middle',
            'toast-bright'
          );
          this.dismiss();
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
