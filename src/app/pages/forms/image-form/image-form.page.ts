/* Module imports */
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Interface imports */
import { Image } from '../../../shared/interfaces/image';

/* Service imports */
import { ImageService } from '../../../services/image/image.service';


@Component({
  selector: 'image-form',
  templateUrl: './image-form.page.html',
  styleUrls: ['./image-form.page.scss'],
})
export class ImageFormPage implements OnInit {
  @Input() options: { image: Image };
  image: Image = null;
  onBackClick: () => void;

  constructor(
    public cdRef: ChangeDetectorRef,
    public imageService: ImageService,
    public modalCtrl: ModalController
  ) {
    this.onBackClick = this.dismiss.bind(this);
  }

  ngOnInit() {
    if (this.options) {
      this.image = this.options.image;
    }
  }

  /**
   * Call ModalController dismiss with no return data
   *
   * @params: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Open device image gallery
   *
   * @params: none
   * @return: none
   */
  openGallery(): void {
    this.imageService.importImage()
      .subscribe(
        (imageData: Image): void => {
          console.log('got image', imageData);
          this.image = imageData;
          this.cdRef.detectChanges();
        },
        (error: string): void => console.log('gallery error', error)
      );
  }

  /**
   * Call ModalController dismiss with image data
   *
   * @params: none
   * @return: none
   */
  submitPhoto(): void {
    this.modalCtrl.dismiss(this.image);
  }

}
