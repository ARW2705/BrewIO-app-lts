/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Constant imports */
import { MISSING_IMAGE_URL } from '@shared/constants';

/* Interface imports */
import { Image } from '@shared/interfaces';

/* Component imports */
import { ImageSelectionComponent } from '@components/form-elements/private/image-selection/image-selection.component';

/* Service imports */
import { ErrorReportingService, ImageService, ModalService } from '@services/public';


@Component({
  selector: 'app-form-image',
  templateUrl: './form-image.component.html',
  styleUrls: ['./form-image.component.scss'],
})
export class FormImageComponent {
  @Input() label: string;
  @Input() image: Image;
  @Input() overrideTitleCase: boolean = false;
  @Output() imageModalEvent: EventEmitter<Image> = new EventEmitter<Image>();
  readonly missingImageURL: string = MISSING_IMAGE_URL;

  constructor(
    public errorReporter: ErrorReportingService,
    public imageService: ImageService,
    public modalService: ModalService
  ) { }

  /**
   * Get Image Modal component options
   *
   * @param: none
   * @return: options object
   */
  getImageModalOptions(): object {
    const options: object = {
      overrideTitleCase: this.overrideTitleCase,
      label: this.label
    };
    if (!this.imageService.hasDefaultImage(this.image)) {
      Object.assign(options, { image: this.image });
    }

    return options;
  }

  /**
   * Open image modal
   *
   * @params: none
   * @return: none
   */
  openImageModal(): void {
    this.modalService.openModal<Image>(
      ImageSelectionComponent,
      this.getImageModalOptions()
    )
    .subscribe(
      (image: Image): void => {
        if (image) { // a cancelled event will return as null; only perform actions if there is an image
          let previousServerFilename: string;
          if (this.image && this.image.serverFilename) {
            previousServerFilename = this.image.serverFilename;
          }
          image.serverFilename = previousServerFilename;
          this.imageModalEvent.emit(image);
        }
      },
      (error: Error): void => this.errorReporter.handleUnhandledError(error)
    );
  }

}
