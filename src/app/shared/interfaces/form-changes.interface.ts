import { FormControl } from '@angular/forms';

export interface FormChanges {
  control: FormControl;
  shouldRequire: boolean;
}
