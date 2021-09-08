/* Module imports */
import { FormChanges } from './form-changes.interface';
import { FormCommonAttributes } from './form-common-attributes.interface';

export interface FormInputChanges extends FormChanges, FormCommonAttributes {
  type: string; // e.g. 'text', 'number', etc
}
