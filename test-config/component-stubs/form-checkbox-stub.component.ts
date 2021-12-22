/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Component imports */
import { FormCheckboxComponent } from '../../src/app/components/form-elements/public/form-checkbox/form-checkbox.component';

@Component({
  selector: 'app-form-checkbox',
  template: '',
  providers: [
    { provide: FormCheckboxComponent, useClass: FormCheckboxComponentStub }
  ]
})
export class FormCheckboxComponentStub {
  @Input() control: FormControl;
  @Input() label: string = null;
  @Input() overrideTitleCase: boolean = false;
  @Output() ionCheckboxEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
}
