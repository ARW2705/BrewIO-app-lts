/* Module imports */
import { Component, Input } from '@angular/core';

/* Component imports */
import { ImageSelectionComponent } from '../../src/app/components/form-elements/private/image-selection/image-selection.component';

@Component({
  selector: 'app-image-selection',
  template: '',
  providers: [
    { provide: ImageSelectionComponent, useClass: ImageSelectionComponentStub }
  ]
})
export class ImageSelectionComponentStub {
  @Input() controlErrors: object;
  @Input() controlName: string;
  @Input() formName: string;
  errors: string[] = [];
}
