/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Constant imports */
import { SELECT_OPTIONS } from '../../src/app/shared/constants';

/* Interface imports */
import { FormChanges, FormSelectOption } from '../../src/app/shared/interfaces';

/* Component imports */
import { FormSelectComponent } from '../../src/app/components/form-elements/public/form-select/form-select.component';

@Component({
  selector: 'app-form-select',
  template: '',
  providers: [
    { provide: FormSelectComponent, useClass: FormSelectComponentStub }
  ]
})
export class FormSelectComponentStub {
  @Input() confirmText: string = null;
  @Input() control: FormControl = null;
  @Input() controlName: string = null;
  @Input() dismissText: string = null;
  @Input() formName: string = null;
  @Input() label: string = null;
  @Input() labelPosition: string = null;
  @Input() compareWithFn: (...options: any) => any = null;
  @Input() options: FormSelectOption[] = null;
  @Input() overrideTitleCase: boolean = false;
  @Input() shouldRequire: boolean = null;
  @Input() value: any;
  @Output() ionCancelEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  @Output() ionChangeEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  controlErrors: object = null;
  selectOptions: object = SELECT_OPTIONS;
  showError: boolean = false;
}
