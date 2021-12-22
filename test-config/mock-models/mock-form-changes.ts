/* Module imports */
import { FormControl } from '@angular/forms';

/* Mock imports */
import { mockFormCommonAttributes } from './mock-form-common-attributes';

/* Inteface imports */
import { FormChanges, FormInputChanges, FormSelectChanges, FormTextAreaChanges } from '../../src/app/shared/interfaces';

export const mockFormChanges: (changeType?: string, options?: { [key: string]: any }) => FormChanges | FormInputChanges | FormSelectChanges | FormTextAreaChanges = (changeType: string = '', options: { [key: string]: any } = {}): FormChanges | FormInputChanges | FormSelectChanges | FormTextAreaChanges => {
  const mock: FormChanges = {
    control: new FormControl(),
    shouldRequire: false
  };

  if (changeType === 'input') {
    Object.assign(mock, { type: (options.type || 'text') });
    Object.assign(mock, mockFormCommonAttributes());
  } else if (changeType === 'textarea') {
    Object.assign(mock, { rows: (options.rows || 3) });
    Object.assign(mock, mockFormCommonAttributes());
  } else if (changeType === 'select') {
    Object.assign(
      mock,
      {
        compareWithFn: (options.compareWithFn || ((c1: any, c2: any): boolean => true)),
        confirmText: (options.confirmText || 'ok'),
        dismissText: (options.dismissText || 'dismiss'),
        labelPosition: (options.labelPosition || 'floating')
      }
    );
  }

  return mock;
};
