/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Component imports */
import { FormToggleComponent } from '../../src/app/components/form-elements/public/form-toggle/form-toggle.component';

@Component({
  selector: 'app-form-toggle',
  template: '',
  providers: [
    { provide: FormToggleComponent, useClass: FormToggleComponentStub }
  ]
})
export class FormToggleComponentStub {
  @Input() control: FormControl;
  @Input() overrideNameTitleCase: boolean = false;
  @Input() overrideAdditionalNameTitleCase: boolean = false;
  @Input() toggleName: string;
  @Input() toggleAdditionalName?: string;
  @Output() toggleEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
}
