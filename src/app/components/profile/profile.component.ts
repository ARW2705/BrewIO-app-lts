/* Module imports */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subject, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Default imports */
import { defaultImage } from '../../shared/defaults';

/* Interface imports */
import { Image, User } from '../../shared/interfaces';

/* Page imports */
import { ImageFormPage } from '../../pages/forms/image-form/image-form.page';

/* Service imports */
import { ErrorReportingService, ImageService, ToastService, UserService } from '../../services/services';


@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  breweryLabelImage: Image;
  defaultImage: Image = defaultImage();
  destroy$: Subject<boolean> = new Subject<boolean>();
  editing: string = '';
  isLoggedIn: boolean = false;
  user: User = null;
  userForm: FormGroup = null;
  userImage: Image;

  constructor(
    public errorReporter: ErrorReportingService,
    public formBuilder: FormBuilder,
    public imageService: ImageService,
    public modalCtrl: ModalController,
    public toastService: ToastService,
    public userService: UserService
  ) {
    this.breweryLabelImage = this.defaultImage;
    this.userImage = this.defaultImage;
  }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('profile component init');
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (user: User): void => {
          this.user = user;
          this.isLoggedIn = this.userService.isLoggedIn();
          this.initForm(user);
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  ngOnDestroy() {
    console.log('profile component destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

  /**
   * Get image data to pass to modal
   *
   * @params: imageType - the type of image to add, either 'user' or 'brewery'
   *
   * @return: modal options object or null if image is the default image
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
   * Create form with profile values in form fields
   *
   * @params: user - user profile object
   *
   * @return: none
   */
  initForm(user: User): void {
    this.userForm = this.formBuilder.group({
      email: [
        (user && user.email ? user.email : ''),
        [Validators.email, Validators.required]
      ],
      firstname: [
        (user && user.firstname ? user.firstname : ''),
        [Validators.maxLength(50)]
      ],
      lastname: [
        (user && user.lastname ? user.lastname : ''),
        [Validators.maxLength(50)]
      ]
    });
    if (user.userImage) {
      this.userImage = user.userImage;
    }
    if (user.breweryLabelImage) {
      this.breweryLabelImage = user.breweryLabelImage;
    }
  }

  /**
   * Handle image modal error
   *
   * @params: none
   *
   * @return: modal error handling function
   */
  onImageModalError(): (error: string) => void {
    return (error: string): void => {
      console.log('modal dismiss error', error);
      this.toastService.presentErrorToast('Error selecting image');
    };
  }

  /**
   * Handle image modal success
   *
   * @params: imageType - the type of image, either 'user' or 'brewery'
   *
   * @return: modal success handling function
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
   * Submit updated user profile, update view on successful response or
   * display error message on error
   *
   * @params: none
   * @return: none
   */
  onUpdate(): void {
    const userUpdate: object = this.userForm.value;
    if (!this.imageService.hasDefaultImage(this.userImage)) {
      userUpdate['userImage'] = this.userImage;
    }
    if (!this.imageService.hasDefaultImage(this.breweryLabelImage)) {
      userUpdate['breweryLabelImage'] = this.breweryLabelImage;
    }

    this.userService.updateUserProfile(userUpdate)
      .subscribe(
        (): void => {
          this.toastService.presentToast('Profile Updated', 1000);
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Form Methods *****/

}
