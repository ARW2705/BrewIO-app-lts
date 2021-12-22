/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Component imports */
import { FormButtonsComponent } from '../../src/app/components/form-elements/public/form-buttons/form-buttons.component';

@Component({
  selector: 'app-form-buttons',
  template: '',
  providers: [
    { provide: FormButtonsComponent, useClass: FormButtonsComponentStub }
  ]
})
export class FormButtonsComponentStub {
  @Input() isSubmitDisabled: boolean;
  @Input() shouldCautionSubmit: boolean;
  @Output() cancelEvent: EventEmitter<null> = new EventEmitter<null>();
  @Output() submitEvent: EventEmitter<null> = new EventEmitter<null>();
}
