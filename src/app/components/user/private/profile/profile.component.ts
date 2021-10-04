/* Module imports */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Default imports */
import { defaultImage } from '../../../../shared/defaults';

/* Interface imports */
import { Image, User } from '../../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, ImageService, ToastService, UserService } from '../../../../services/services';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  _defaultImage: Image = defaultImage();
  breweryLabelImage: Image;
  destroy$: Subject<boolean> = new Subject<boolean>();
  editing: string = '';
  isLoggedIn: boolean = false;
  maxCharLimit: number = 50;
  user: User = null;
  userForm: FormGroup = null;
  userImage: Image;

  constructor(
    public errorReporter: ErrorReportingService,
    public formBuilder: FormBuilder,
    public imageService: ImageService,
    public toastService: ToastService,
    public userService: UserService
  ) {
    this.breweryLabelImage = this._defaultImage;
    this.userImage = this._defaultImage;
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
        [Validators.maxLength(this.maxCharLimit)]
      ],
      lastname: [
        (user && user.lastname ? user.lastname : ''),
        [Validators.maxLength(this.maxCharLimit)]
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
   * Replace a particular image with a new image
   *
   * @param: imageType - identifier of which image should be replaced
   * @param: image - the new image to apply
   *
   * @return: none
   */
  onImageSelection(imageType: string, image: Image): void {
    if (imageType === 'userImage') {
      this.userImage = image;
    } else if (imageType === 'breweryLabelImage') {
      this.breweryLabelImage = image;
    }
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
          const oneSecond: number = 1000;
          this.toastService.presentToast('Profile Updated', oneSecond);
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Form Methods *****/

}
