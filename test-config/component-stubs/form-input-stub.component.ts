/* Module imports */
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Mock imports */
import { FormAttributeServiceStub } from '../service-stubs';

/* Service imports */
import { FormAttributeService } from '../../src/app/services/services';

/* Component imports */
import { FormInputComponent } from '../../src/app/components/form-input/form-input.component';

@Component({
  selector: 'app-form-input',
  template: '',
  providers: [
    { provide: FormInputComponent, useClass: FormInputComponentStub },
    { provide: FormAttributeService, useClass: FormAttributeServiceStub }
  ]
})
export class FormInputComponentStub implements OnChanges {
  @Input() control: FormControl = null;
  @Input() controlName: string = null;
  @Input() formName: string = null;
  @Input() label: string = null;
  @Input() overrideTitleCase: boolean = false;
  @Input() shouldAutocapitalize: boolean = null;
  @Input() shouldAutocomplete: boolean = null;
  @Input() shouldAutocorrect: boolean = null;
  @Input() shouldRequire: boolean = null;
  @Input() shouldSpellcheck: boolean = null;
  @Input() type: string;
  @Output() ionBlurEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  @Output() ionChangeEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  controlErrors: object = null;
  showError: boolean = false;
  formAttributeService: FormAttributeService;

  // constructor(public formAttributeService: FormAttributeService) {}
  ngOnChanges(...options: any): void {}
  assignFormChanges(...options: any): any {}
  checkForErrors(): void {}
  onInputBlur(...options: any): any {}
  onInputChange(...options: any): any {}
  rectifyInputType(): void {}
}
