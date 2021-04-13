import { Image, ImageRequestFormData, ImageRequestMetadata } from '../../src/app/shared/interfaces/image';

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

export const mockImageRequestFormData: () => ImageRequestFormData = (): ImageRequestFormData => {
  const mock: ImageRequestFormData = {
    name: 'test-img',
    image: mockImage()
  };
  return mock;
};

export const mockImageRequestMetadata: () => ImageRequestMetadata = (): ImageRequestMetadata => {
  const mock: ImageRequestMetadata = {
    name: 'test-img',
    blob: new Blob(),
    filename: 'test-filename'
  };
  return mock;
};
