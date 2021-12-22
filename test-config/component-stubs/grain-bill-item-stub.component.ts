/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { GrainBill } from '../../src/app/shared/interfaces';

/* Component imports */
import { GrainBillItemComponent } from '../../src/app/components/ingredient/private/grain-bill-item/grain-bill-item.component';

@Component({
  selector: 'app-grain-bill-item',
  template: '',
  providers: [
    { provide: GrainBillItemComponent, useClass: GrainBillItemComponentStub }
  ]
})
export class GrainBillItemComponentStub {
  @Input() grains: GrainBill;
  @Input() isLast: boolean;
  @Input() ratio: string;
  @Output() openIngredientFormButtonEvent: EventEmitter<null> = new EventEmitter<null>();
}
