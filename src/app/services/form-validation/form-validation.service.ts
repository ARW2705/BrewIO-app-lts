/* Module imports */
import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';


@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  /**
   * Check if at least one control from supplied controls has a value
   *
   * @param: controls - control names to check
   * @return: ValidatorFn
   */
  eitherOr(controls: string[], additionalValidators?: object): ValidatorFn {
    return (group: FormGroup): { [key: string]: any } | null => {
      const controlNames: string[] = controls;
      const hasValid: boolean = controlNames.some((controlName: string): boolean => {
        const control: AbstractControl = group.get(controlName);
        return !isNaN(parseFloat(control.value));
      });
      controlNames.forEach((controlName: string): void => {
        const control: AbstractControl = group.get(controlName);
        control.setErrors(hasValid ? null : { eitherOr: true });
        if (hasValid && additionalValidators) {
          for (const key in additionalValidators) {
            if (additionalValidators.hasOwnProperty(key)) {
              switch (key) {
                case 'min':
                  if (control.value) {
                    const min: number = additionalValidators[key];
                    const actual: number = parseFloat(control.value);
                    if (isNaN(actual) || actual < min) {
                      control.setErrors({ min: { min, actual }, eitherOr: true });
                    } else {
                      control.setErrors(null);
                    }
                  }
                  break;
                default:
                  break;
              }
            }
          }
        }
      });
      return null;
    };
  }

  /**
   * Password and password confirmation matching validator
   *
   * @param: none
   * @return: ValidatorFn - @param group to pull password and confirmation strings
   */
  passwordMatch(): ValidatorFn {
    return (group: FormGroup): {[key: string]: any} | null => {
      const password: AbstractControl = group.get('password');
      const confirmation: AbstractControl = group.get('passwordConfirmation');
      if (!confirmation.value) {
        confirmation.setErrors({required: true});
      } else if (password.value !== confirmation.value) {
        confirmation.setErrors({mismatch: true});
      }

      return null;
    };
  }

  /**
   * Password pattern checking
   *
   * @param: none
   * @return: ValidatorFn - @param control to pull password string
   */
  passwordPattern(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      return RegExp(/(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])/g).test(control.value)
        ? null
        : { passwordInvalid: true };
    };
  }

  /**
   * Conditionally set required validator
   *
   * @param: isRequired - true if control should be required
   * @return: ValidatorFn - @param control to attach validator
   */
  requiredIfValidator(isRequired: boolean): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (isRequired && !control.value) {
        return { required: true };
      }

      return null;
    };
  }

}
