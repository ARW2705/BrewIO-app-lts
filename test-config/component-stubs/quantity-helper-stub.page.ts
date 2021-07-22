/* Module imports */
import { Component, Input } from '@angular/core';

/* Component imports */
import { QuantityHelperPage } from '../../src/app/pages/quantity-helper/quantity-helper.page';

@Component({
  selector: 'about',
  template: '',
  providers: [
    { provide: QuantityHelperPage, useClass: QuantityHelperPageStub }
  ]
})
export class QuantityHelperPageStub {
  @Input() headerText: string;
  @Input() quantity: number;
}
