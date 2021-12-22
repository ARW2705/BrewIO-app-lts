/* Module imports */
import { Component, Input } from '@angular/core';

/* Component imports */
import { FormErrorComponent } from '../../src/app/components/form-elements/private/form-error/form-error.component';

@Component({
  selector: 'app-form-error',
  template: '',
  providers: [
    { provide: FormErrorComponent, useClass: FormErrorComponentStub }
  ]
})
export class FormErrorComponentStub {
  @Input() controlErrors: object;
  @Input() controlName: string;
  @Input() formName: string;
  errors: string[] = [];
}
