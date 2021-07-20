/* Interface imports */
import { ImageRequestMetadata } from '../../src/app/shared/interfaces';

export const mockImageRequestMetadata: (options?: { name?: string, blob?: Blob, filename?: string }) => ImageRequestMetadata = (options?: { name?: string, blob?: Blob, filename?: string }): ImageRequestMetadata => {
  const mock: ImageRequestMetadata = {
    name: options && options.name ? options.name : 'test-img',
    blob: options && options.blob ? options.blob : new Blob(),
    filename: options && options.filename ? options.filename : 'test-filename'
  };
  return mock;
};
