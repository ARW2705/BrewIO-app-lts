/* Module imports */
import { Injectable, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Interface imports */
import { FormChanges, FormCommonAttributes, FormInputChanges, FormSelectChanges, FormTextAreaChanges } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Service imports */
import { ErrorReportingService } from '../error-reporting/error-reporting.service';


@Injectable({
  providedIn: 'root'
})
export class FormAttributeService {

  constructor(public errorReporter: ErrorReportingService) {}

  getDefaultFormChanges(): FormChanges {
    return {
      control: new FormControl(),
      shouldRequire: false
    };
  }

  getDefaultFormCommonAttributes(): FormCommonAttributes {
    return {
      shouldAutocapitalize: false,
      shouldAutocomplete: false,
      shouldAutocorrect: false,
      shouldSpellcheck: false
    };
  }

  getDefaultFormInputChanges(): FormInputChanges {
    const formChanges: FormChanges = this.getDefaultFormChanges();
    const formCommonAttributes: FormCommonAttributes = this.getDefaultFormCommonAttributes();
    const formInputChanges: object = { type: 'text' };
    return { ...formChanges, ...formCommonAttributes, ...formInputChanges } as FormInputChanges;
  }

  getDefaultFormSelectChanges(): FormSelectChanges {
    const formChanges: FormChanges = this.getDefaultFormChanges();
    const formSelectChanges: object = {
      compareWithFn: (c1: any, c2: any): boolean => c1 === c2,
      confirmText: 'Okay',
      dismissText: 'Dismiss',
      labelPosition: 'floating'
    };
    return { ...formChanges, ...formSelectChanges } as FormSelectChanges;
  }

  getDefaultFormTextAreaChanges(): FormTextAreaChanges {
    const formChanges: FormChanges = this.getDefaultFormChanges();
    const formCommonAttributes: FormCommonAttributes = this.getDefaultFormCommonAttributes();
    const formTextAreaChanges: object = { rows: 3 };
    return { ...formChanges, ...formCommonAttributes, ...formTextAreaChanges } as FormTextAreaChanges;
  }

  handleFormChange(formType: string, control: FormControl, changes: SimpleChanges): FormChanges {
    switch (formType) {
      case 'input':
        const formInputChanges: FormInputChanges = this.getDefaultFormInputChanges();
        this.applyFormAttributes(formInputChanges, control, changes);
        return formInputChanges;
      case 'select':
        const formSelectChanges: FormSelectChanges = this.getDefaultFormSelectChanges();
        this.applyFormAttributes(formSelectChanges, control, changes);
        return formSelectChanges;
      case 'textarea':
        const formTextAreaChanges: FormTextAreaChanges = this.getDefaultFormTextAreaChanges();
        this.applyFormAttributes(formTextAreaChanges, control, changes);
        return formTextAreaChanges;
      default:
        this.setInvalidFormTypeError(formType);
        const defaultForm: FormChanges = this.getDefaultFormChanges();
        Object.assign(defaultForm, { control });
        return defaultForm;
    }
  }

  applyFormAttributes(formChanges: FormChanges, control: FormControl, changes: SimpleChanges): void {
    for (const key in formChanges) {
      if (changes.hasOwnProperty(key) && changes[key] !== undefined && changes[key].currentValue !== undefined) {
        formChanges[key] = changes[key].currentValue;
      }
    }

    if (control && changes.hasOwnProperty('value') && changes.value.firstChange) {
      control.setValue(changes.value.currentValue);
    }
  }

  setInvalidFormTypeError(givenFormType: string): void {
    const message: string = `Error setting up form: given form type ${givenFormType} is not valid`;
    this.errorReporter.setErrorReportFromCustomError(
      new CustomError('FormError', message, this.errorReporter.moderateSeverity, message)
    );
  }
}
