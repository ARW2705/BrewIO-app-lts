import { FormChanges } from './form-changes.interface';

export interface FormSelectChanges extends FormChanges {
  compareWithFn: (c1: any, c2: any) => boolean;
  confirmText: string;
  dismissText: string;
  labelPosition: string;
}
