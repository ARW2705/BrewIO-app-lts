/* Interface imports */
import { Image } from '../../src/app/shared/interfaces/image';

export const mockImage: () => Image = (): Image => {
  const mock: Image = {
    cid: '0',
    filePath: 'file-path',
    fileSize: 500,
    hasPending: false,
    localURL: 'local-url',
    serverFilename: 'filename',
    url: 'url'
  };
  return mock;
};
