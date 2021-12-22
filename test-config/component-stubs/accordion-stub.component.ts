/* Module imports */
import { Component, Input } from '@angular/core';

/* Component imports */
import { AccordionComponent } from '../../src/app/components/shared/accordion/accordion.component';

@Component({
  selector: 'app-accordion',
  template: '',
  providers: [
    { provide: AccordionComponent, useClass: AccordionComponentStub }
  ]
})
export class AccordionComponentStub {
  @Input() animationDuration: number;
  @Input() expanded: any;
}
