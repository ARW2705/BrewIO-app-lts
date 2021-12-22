/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Constant imports */
import { MISSING_IMAGE_URL } from '../../src/app/shared/constants';

/* Interface imports */
import { Image } from '../../src/app/shared/interfaces';

/* Component imports */
import { FormImageComponent } from '../../src/app/components/form-elements/public/form-image/form-image.component';

@Component({
  selector: 'app-form-image',
  template: '',
  providers: [
    { provide: FormImageComponent, useClass: FormImageComponentStub }
  ]
})
export class FormImageComponentStub {
  @Input() label: string;
  @Input() image: Image;
  @Input() overrideTitleCase: boolean = false;
  @Output() imageModalEvent: EventEmitter<Image> = new EventEmitter<Image>();
  readonly missingImageURL: string = MISSING_IMAGE_URL;
}
