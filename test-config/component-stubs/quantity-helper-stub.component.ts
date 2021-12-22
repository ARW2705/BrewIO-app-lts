/* Module imports */
import { Component, Input } from '@angular/core';

/* Constants imports */
import { COMMON_CONTAINERS } from '../../src/app/shared/constants';

/* Interface imports */
import { Container } from '../../src/app/shared/interfaces';

/* Component imports */
import { QuantityHelperComponent } from '../../src/app/components/inventory/private/quantity-helper/quantity-helper.component';

@Component({
  selector: 'app-quantity-helper',
  template: '',
  providers: [
    { provide: QuantityHelperComponent, useClass: QuantityHelperComponentStub }
  ]
})
export class QuantityHelperComponentStub {
  @Input() headerText: string = '';
  @Input() quantity: number;
  commonContainers: Container[] = COMMON_CONTAINERS;
  onBackClick: () => void;
  quantityCentiliters: number;
  quantityOunces: number;
  quantityPints: number;
  selectOptions: object = { cssClass: 'select-popover' };
  showCommonContainers: boolean = true;
}
