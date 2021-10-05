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

  /***** Default FormChange Factories *****/

  /**
   * Get FormChanges object with default values
   *
   * @param: none
   * @return: a new FormChanges object
   */
  getDefaultFormChanges(): FormChanges {
    return { control: new FormControl(), shouldRequire: false };
  }

  /**
   * Get FormCommonAttributes object with default values
   *
   * @param: none
   * @return: a new FormCommonAttributes object
   */
  getDefaultFormCommonAttributes(): FormCommonAttributes {
    return {
      shouldAutocapitalize: false,
      shouldAutocomplete: false,
      shouldAutocorrect: false,
      shouldSpellcheck: false
    };
  }

  /**
   * Get FormInputChanges object with default values
   *
   * @param: none
   * @return: a new FormInputChanges object
   */
  getDefaultFormInputChanges(): FormInputChanges {
    const formChanges: FormChanges = this.getDefaultFormChanges();
    const formCommonAttributes: FormCommonAttributes = this.getDefaultFormCommonAttributes();
    const formInputChanges: object = { type: 'text' };
    return { ...formChanges, ...formCommonAttributes, ...formInputChanges } as FormInputChanges;
  }

  /**
   * Get FormSelectChanges object with default values
   *
   * @param: none
   * @return: a new FormSelectChanges object
   */
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

  /**
   * Get FormTextAreaChanges object with default values
   *
   * @param: none
   * @return: a new FormTextAreaChanges object
   */
  getDefaultFormTextAreaChanges(): FormTextAreaChanges {
    const formChanges: FormChanges = this.getDefaultFormChanges();
    const formCommonAttributes: FormCommonAttributes = this.getDefaultFormCommonAttributes();
    const formTextAreaChanges: object = { rows: 3 };
    return { ...formChanges, ...formCommonAttributes, ...formTextAreaChanges } as FormTextAreaChanges;
  }

  /***** End Default FormChange Factories *****/


  /***** Form Attributes Handling *****/

  /**
   * Apply given simple changes to a FormChanges object
   *
   * @param: formChanges - the FormChanges object to update
   * @param: control - the FormControl associated with the change
   * @param: changes - the SimpleChanges potentially containing new form values
   * @return: none
   */
  applyFormAttributes(formChanges: FormChanges, control: FormControl, changes: SimpleChanges): void {
    for (const key in formChanges) {
      if (changes.hasOwnProperty(key) && changes[key] !== undefined && changes[key].currentValue !== undefined) {
        formChanges[key] = changes[key].currentValue;
      }
    }

    if (control) {
      formChanges.control = control;
      if (changes.hasOwnProperty('value') && changes.value.firstChange) {
        control.setValue(changes.value.currentValue);
      }
    }
  }

  /**
   * Handle form simple changes
   *
   * @param: formType - the type of form element (e.g. 'input' or 'select')
   * @param: control - the FormControl associated with the change
   * @param: changes - the SimpleChanges potentially containing new form values
   *
   * @return: a FormChanges object with values appropriately set based on their formType
   */
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

  /**
   * Report an error on invalid form change formType
   *
   * @param: givenFormType - the invalid formType passed to handler
   * @return: none
   */
  setInvalidFormTypeError(givenFormType: string): void {
    const message: string = `Error setting up form: given form type ${givenFormType} is not valid`;
    this.errorReporter.setErrorReportFromCustomError(
      new CustomError('FormError', message, this.errorReporter.moderateSeverity, message)
    );
  }

  /***** End Form Attributes Handling *****/
}
