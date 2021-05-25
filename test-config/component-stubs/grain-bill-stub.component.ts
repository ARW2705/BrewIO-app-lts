/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { GrainBill } from '../../src/app/shared/interfaces/grain-bill';

/* Component imports */
import { GrainBillComponent } from '../../src/app/components/grain-bill/grain-bill.component';

@Component({
  selector: 'grain-bill',
  template: '',
  providers: [
    { provide: GrainBillComponent, useClass: GrainBillComponentStub }
  ]
})
export class GrainBillComponentStub {
  @Input() grainBill: GrainBill[];
  @Input() onRecipeAction: (actionName: string, options?: any[]) => void;
  @Input() refreshPipes: boolean;
}
