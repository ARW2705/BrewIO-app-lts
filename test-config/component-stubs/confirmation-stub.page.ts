/* Module imports */
import { Component, Input } from '@angular/core';

/* Component imports */
import { ConfirmationPage } from '../../src/app/pages/confirmation/confirmation.page';

@Component({
  selector: 'calendar',
  template: '',
  providers: [
    { provide: ConfirmationPage, useClass: ConfirmationPageStub }
  ]
})
export class ConfirmationPageStub {
  @Input() message: string = '';
  @Input() subMessage: string = null;
}
