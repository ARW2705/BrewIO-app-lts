/* Module imports */
import { Component, Input } from '@angular/core';

/* Component imports */
import { QuantityHelperComponent } from '../../src/app/components/quantity-helper/quantity-helper.component';

@Component({
  selector: 'about',
  template: '',
  providers: [
    { provide: QuantityHelperComponent, useClass: QuantityHelperComponentStub }
  ]
})
export class QuantityHelperComponentStub {
  @Input() headerText: string;
  @Input() quantity: number;
}
