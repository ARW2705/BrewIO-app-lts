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

export const mockImageRequestMetadata: (options?: { name?: string, blob?: Blob, filename?: string }) => ImageRequestMetadata = (options?: { name?: string, blob?: Blob, filename?: string }): ImageRequestMetadata => {
  const mock: ImageRequestMetadata = {
    name: options && options.name ? options.name : 'test-img',
    blob: options && options.blob ? options.blob : new Blob(),
    filename: options && options.filename ? options.filename : 'test-filename'
  };
  return mock;
};
