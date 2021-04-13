import { Metadata } from '@ionic-native/file/ngx';

export const mockFileMetadata: () => Metadata = (): Metadata => {
  const mock: Metadata = {
    size: 500,
    modificationTime: new Date()
  };
  return mock;
};
