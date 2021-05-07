/* Module imports */
import { Component, Input } from '@angular/core';

/* Component imports */
import { ConfirmationComponent } from '../../src/app/components/confirmation/confirmation.component';

@Component({
  selector: 'calendar',
  template: '',
  providers: [
    { provide: ConfirmationComponent, useClass: ConfirmationComponentStub }
  ]
})
export class ConfirmationComponentStub {
  @Input() message: string = '';
  @Input() subMessage: string = null;
}
