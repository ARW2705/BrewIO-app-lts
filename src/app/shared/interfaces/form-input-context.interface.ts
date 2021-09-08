import { FormFieldContext } from './form-field-context.interface';

export interface FormInputContext extends FormFieldContext {
  inputType: string;
  required: boolean;
}
