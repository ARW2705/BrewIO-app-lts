/* Module imports */
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';

/* Interface imports */
import { Image } from '../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, ImageService, LoadingService } from '../../../services/services';


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
    public errorReporter: ErrorReportingService,
    public imageService: ImageService,
    public loadingService: LoadingService,
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
   * @param: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Open device image gallery
   *
   * @param: none
   * @return: none
   */
  async openGallery(): Promise<void> {
    const loading: HTMLIonLoadingElement = await this.loadingService.createLoader();

    this.imageService.importImage()
      .pipe(finalize(() => loading.dismiss()))
      .subscribe(
        (imageData: Image): void => {
          this.image = imageData;
          this.cdRef.detectChanges();
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Call ModalController dismiss with image data
   *
   * @param: none
   * @return: none
   */
  selectPhoto(): void {
    this.modalCtrl.dismiss(this.image);
  }

}
