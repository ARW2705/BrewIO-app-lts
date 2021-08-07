import { FormFieldContext } from './form-field-context.interface';
import { FormSelectOption } from './form-select-option.interface';

export interface FormSelectContext extends FormFieldContext {
  options: FormSelectOption[];
  ionChangeEvent?: (event: any) => void;
  ionCancelEvent?: (event: any) => void;
  compareWithFn?: (o1: any, o2: any) => boolean;
}
