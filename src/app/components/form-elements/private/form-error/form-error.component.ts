/* Module imports */
import { Component, Input, OnChanges } from '@angular/core';

/* Constant imports */
import { FORM_ERROR_MESSAGES } from '../../../../shared/constants';


@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.scss']
})
export class FormErrorComponent implements OnChanges {
  @Input() controlErrors: object;
  @Input() controlName: string;
  @Input() formName: string;
  errors: string[] = [];

  ngOnChanges(): void {
    this.errors = [];
    for (const key in this.controlErrors) {
      if (this.controlErrors.hasOwnProperty(key)) {
        this.errors.push(FORM_ERROR_MESSAGES[this.formName][this.controlName][key]);
      }
    }
  }

}
