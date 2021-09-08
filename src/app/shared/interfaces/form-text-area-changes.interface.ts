import { FormChanges } from './form-changes.interface';
import { FormCommonAttributes } from './form-common-attributes.interface';

export interface FormTextAreaChanges extends FormChanges, FormCommonAttributes {
  rows: number;
}
