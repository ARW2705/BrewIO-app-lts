/* Module imports */
import { FileError } from '@ionic-native/file/ngx';

export const mockFileError: (message?: string, code?: number) => FileError = (message: string = 'test-error', code: number = 0): FileError => {
  const mock: FileError = {
    code: code,
    message: message
  };
  return mock;
};
