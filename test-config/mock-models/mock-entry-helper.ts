/* Module imports */
import { Entry, FileEntry } from '@ionic-native/file/ngx';

export const _mockEntryHelper: (overrides: object) => Entry | FileEntry = (overrides: object): Entry | FileEntry => {
  const mock: Entry | FileEntry = {
    createWriter: () => {},
    isFile: true,
    isDirectory: false,
    file: () => {},
    getMetadata: () => {},
    setMetadata: () => {},
    name: null,
    fullPath: null,
    filesystem: null,
    nativeURL: null,
    moveTo: () => {},
    copyTo: () => {},
    toURL: () => null,
    toInternalURL: () => null,
    remove: () => {},
    getParent: () => {}
  };
  Object.assign(mock, overrides);
  return mock;
};
