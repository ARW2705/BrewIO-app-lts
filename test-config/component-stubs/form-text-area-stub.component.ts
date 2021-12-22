/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Component imports */
import { FormTextAreaComponent } from '../../src/app/components/form-elements/public/form-text-area/form-text-area.component';

@Component({
  selector: 'app-form-text-area',
  template: '',
  providers: [
    { provide: FormTextAreaComponent, useClass: FormTextAreaComponentStub }
  ]
})
export class FormTextAreaComponentStub {
  @Input() control: FormControl = null;
  @Input() controlName: string = null;
  @Input() formName: string = null;
  @Input() label: string = null;
  @Input() overrideTitleCase: boolean = false;
  @Input() rows: number = null;
  @Input() shouldAutocapitalize: boolean = null;
  @Input() shouldRequire: boolean = null;
  @Input() shouldSpellcheck: boolean = null;
  @Output() ionBlurEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  @Output() ionChangeEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  controlErrors: object = null;
  showError: boolean = false;
}
