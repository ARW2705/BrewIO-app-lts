/* Module imports */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subject, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Default imports */
import { defaultImage } from '../../shared/defaults/default-image';

/* Interface imports */
import { Image } from '../../shared/interfaces/image';
import { User } from '../../shared/interfaces/user';

/* Page imports */
import { ImageFormPage } from '../../pages/forms/image-form/image-form.page';

/* Service imports */
import { ImageService } from '../../services/image/image.service';
import { UserService } from '../../services/user/user.service';
import { ToastService } from '../../services/toast/toast.service';


@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  defaultImage: Image = defaultImage();
  breweryLabelImage: Image = this.defaultImage;
  userImage: Image = this.defaultImage;
  destroy$: Subject<boolean> = new Subject<boolean>();
  editing: string = '';
  isLoggedIn: boolean = false;
  user: User = null;
  userForm: FormGroup = null;

  constructor(
    public formBuilder: FormBuilder,
    public imageService: ImageService,
    public modalCtrl: ModalController,
    public toastService: ToastService,
    public userService: UserService
  ) { }

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
        (error: string): void => {
          console.log(`Error getting user: ${error}`);
          this.toastService.presentErrorToast('Error getting profile');
        }
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
   * Open image selection modal
   *
   * @params: imageType - identifies image as either userImage or breweryLabelImage
   *
   * @return: none
   */
  async openImageModal(imageType: string): Promise<void> {
    let options: { image: Image } = null;
    if (imageType === 'user' && !this.imageService.hasDefaultImage(this.userImage)) {
      options = { image: this.userImage };
    } else if (imageType === 'brewery' && !this.imageService.hasDefaultImage(this.breweryLabelImage)) {
      options = { image: this.breweryLabelImage };
    }

    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: ImageFormPage,
      componentProps: options
    });

    from(modal.onDidDismiss())
      .subscribe(
        (data: object): void => {
          const _data: Image = data['data'];
          if (imageType === 'user' && _data) {
            this.userImage = _data;
          } else if (imageType === 'brewery' && _data) {
            this.breweryLabelImage = _data;
          }
        },
        (error: string): void => {
          console.log('modal dismiss error', error);
          this.toastService.presentErrorToast('Error selecting image');
        }
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
        (error: string): void => {
          console.log('profile update error', error);
          this.toastService.presentToast('Error updating profile');
        }
      );
  }

  /***** End Form Methods *****/

}
