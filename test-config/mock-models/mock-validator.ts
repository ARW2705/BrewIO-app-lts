/* Module imports */
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';

export const mockValidator: (error?: any, errorField?: string) => ValidatorFn = (error?: any, errorField?: string): ValidatorFn => {
  return (input: AbstractControl | FormGroup): {[key: string]: any} | null => {
    if (error) {
      const validationError: object = {};
      validationError[errorField] = true;
      if (input instanceof AbstractControl) {
        return validationError;
      } else {
        const control: AbstractControl = (<FormGroup>input).get(errorField);
        control.setErrors(validationError);
      }
    }
    return null;
  };
};
