/* Module imports */
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

/* Mock imports */
import { FormAttributeServiceStub } from '../service-stubs';

/* Service imports */
import { FormAttributeService } from '../../src/app/services/public';

/* Component imports */
import { FormInputComponent } from '../../src/app/components/form-elements/public/form-input/form-input.component';

@Component({
  selector: 'app-form-input',
  template: '',
  providers: [
    { provide: FormInputComponent, useClass: FormInputComponentStub },
    { provide: FormAttributeService, useClass: FormAttributeServiceStub }
  ]
})
export class FormInputComponentStub implements OnChanges, OnDestroy, OnInit {
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
  destroy$: Subject<boolean> = new Subject<boolean>();
  controlErrors: object = null;
  showError: boolean = false;
  formAttributeService: FormAttributeService;

  // constructor(public formAttributeService: FormAttributeService) {}
  ngOnInit(): void {}
  ngOnChanges(...options: any): void {}
  ngOnDestroy(): void {}
  assignFormChanges(...options: any): any {}
  checkForErrors(): void {}
  onInputBlur(...options: any): any {}
  onInputChange(...options: any): any {}
  rectifyInputType(): void {}
}
