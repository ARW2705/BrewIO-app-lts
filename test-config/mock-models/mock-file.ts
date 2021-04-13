import { IFile, FileError } from '@ionic-native/file/ngx';

import { mockBlob } from './mock-blob';
import { mockArrayBuffer } from './mock-array-buffer';

export const mockIFile: (type: string, bufferSize?: number) => IFile = (type: string, bufferSize?: number): IFile => {
  const _mockBlob: Blob = mockBlob([mockArrayBuffer(bufferSize || 0)], type);
  const mock: object = {
    name: 'name',
    lastModified: 0,
    lastModifiedDate: 0,
    size: 0,
    type: 'type',
    localURL: 'localURL',
    start: 0,
    end: 1
  };
  Object.assign(mock, _mockBlob);
  return <IFile>mock;
};

export const mockFileError: (message?: string, code?: number) => FileError = (message: string = 'test-error', code: number = 0): FileError => {
  const mock: FileError = {
    code: code,
    message: message
  };
  return mock;
};
