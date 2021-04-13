import { Entry, FileEntry } from '@ionic-native/file/ngx';

export const _mock: (overrides: object) => Entry | FileEntry = (overrides: object): Entry | FileEntry => {
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

export const mockFileEntry: (overrides: object) => FileEntry = (overrides: object): FileEntry => {
  return <FileEntry>_mock(overrides);
};

export const mockEntry: (overrides: object) => Entry = (overrides: object): Entry => {
  return <Entry>_mock(overrides);
};
