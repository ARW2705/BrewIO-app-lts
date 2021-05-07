/* Module imports */
import { FileEntry } from '@ionic-native/file/ngx';

/* Utility imports */
import { _mockEntryHelper } from './mock-entry-helper';

export const mockFileEntry: (overrides: object) => FileEntry = (overrides: object): FileEntry => {
  return <FileEntry>_mockEntryHelper(overrides);
};
