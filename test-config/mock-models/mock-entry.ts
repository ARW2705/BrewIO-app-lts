/* Module imports */
import { Entry } from '@ionic-native/file/ngx';

/* Utility imports */
import { _mockEntryHelper } from './mock-entry-helper';

export const mockEntry: (overrides: object) => Entry = (overrides: object): Entry => {
  return <Entry>_mockEntryHelper(overrides);
};
