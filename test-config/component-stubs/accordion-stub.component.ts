/* Module imports */
import { Component, Input } from '@angular/core';

/* Component imports */
import { AccordionComponent } from '../../src/app/components/accordion/accordion.component';

@Component({
  selector: 'accordion',
  template: '',
  providers: [
    { provide: AccordionComponent, useClass: AccordionComponentStub }
  ]
})
export class AccordionComponentStub {
  @Input() animationDuration: number;
  @Input() expanded: any;
}
