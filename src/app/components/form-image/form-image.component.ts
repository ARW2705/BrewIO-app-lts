/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { from } from 'rxjs';

/* Constant imports */
import { MISSING_IMAGE_URL } from '../../shared/constants';

/* Interface imports */
import { Image } from '../../shared/interfaces';

/* Component imports */
import { ImageFormPage } from '../../pages/forms/image-form/image-form.page';

/* Service imports */
import { ImageService, ToastService } from '../../services/services';


@Component({
  selector: 'app-form-image',
  templateUrl: './form-image.component.html',
  styleUrls: ['./form-image.component.scss'],
})
export class FormImageComponent {
  @Input() label: string;
  @Input() image: Image;
  @Output() imageModalEvent: EventEmitter<Image> = new EventEmitter<Image>();
  missingImageURL: string = MISSING_IMAGE_URL;

  constructor(
    public imageService: ImageService,
    public modalCtrl: ModalController,
    public toastService: ToastService
  ) { }

  /**
   * Get image data to pass to modal
   *
   * @params: imageType - the type of image to add, either 'user' or 'brewery'
   *
   * @return: modal options object or null if image is the default image
   */
  getImageModalOptions(): object {
    return this.imageService.hasDefaultImage(this.image) ? null : { image: this.image };
  }

  /**
   * Get image modal error handler
   *
   * @params: none
   *
   * @return: modal error handler function
   */
  onImageModalError(): (error: string) => void {
    return (error: string): void => {
      console.log('modal dismiss error', error);
      this.toastService.presentErrorToast('Error selecting image');
    };
  }

  /**
   * Get image modal success handler
   *
   * @params: none
   *
   * @return: modal success handler function
   */
  onImageModalSuccess(): (data: object) => void {
    return (data: object): void => {
      const _data: Image = data['data'];
      if (_data) {
        let previousServerFilename: string;
        if (this.image && this.image.serverFilename) {
          previousServerFilename = this.image.serverFilename;
        }
        _data.serverFilename = previousServerFilename;
        this.imageModalEvent.emit(_data);
      }
    };
  }

  /**
   * Open image modal
   *
   * @params: none
   * @return: none
   */
  async openImageModal(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: ImageFormPage,
      componentProps: this.getImageModalOptions()
    });

    from(modal.onDidDismiss())
      .subscribe(
        this.onImageModalSuccess(),
        this.onImageModalError()
      );

    await modal.present();
  }

}
