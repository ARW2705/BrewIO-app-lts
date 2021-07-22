/* Module imports */
import { Component, Input, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { from } from 'rxjs';
import { finalize } from 'rxjs/operators';

/* Default imports */
import { defaultImage } from '../../../shared/defaults';

/* Interface imports */
import { Image, User } from '../../../shared/interfaces';

/* Page */
import { ImageFormPage } from '../image-form/image-form.page';

/* Service imports */
import { ErrorReportingService, FormValidationService, ImageService, ToastService, UserService } from '../../../services/services';


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
  userImage: Image = this.defaultImage;
  showPassword: boolean = false;
  signupForm: FormGroup = null;

  constructor(
    public formBuilder: FormBuilder,
    public errorReporter: ErrorReportingService,
    public formValidator: FormValidationService,
    public imageService: ImageService,
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
   * Generate options for image modal
   *
   * @params: imageType - the image type as either 'user' or 'brewery'
   *
   * @return: options object
   */
  getImageModalOptions(imageType: string): object {
    let options: { image: Image } = null;
    if (imageType === 'user' && !this.imageService.hasDefaultImage(this.userImage)) {
      options = { image: this.userImage };
    } else if (imageType === 'brewery' && !this.imageService.hasDefaultImage(this.breweryLabelImage)) {
      options = { image: this.breweryLabelImage };
    }
    return options;
  }

  /**
   * Get image modal error handler
   *
   * @params: none
   *
   * @return: error handler function
   */
  onImageModalError(): (error: string) => void {
    return (error: string): void => {
      console.log('modal dismiss error', error);
      this.toastService.presentErrorToast('Error selecting image');
    };
  }

  /**
   * Get image modal error handler
   *
   * @params: none
   *
   * @return: error handler function
   */
  onImageModalSuccess(imageType: string): (data: object) => void {
    return (data: object): void => {
      const _data: Image = data['data'];
      if (imageType === 'user' && _data) {
        this.userImage = _data;
      } else if (imageType === 'brewery' && _data) {
        this.breweryLabelImage = _data;
      }
    };
  }

  /**
   * Open image selection modal
   *
   * @params: imageType - identifies image as either userImage or breweryLabelImage
   *
   * @return: none
   */
  async openImageModal(imageType: string): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: ImageFormPage,
      componentProps: this.getImageModalOptions(imageType)
    });

    from(modal.onDidDismiss())
      .subscribe(
        this.onImageModalSuccess(imageType),
        this.onImageModalError()
      );

    await modal.present();
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
          this.toastService.presentToast('Sign up complete!', 1500, 'middle', 'toast-bright');
          this.dismiss();
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

}
