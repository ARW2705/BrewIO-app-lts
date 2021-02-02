import { MISSING_IMAGE_URL } from '../constants/missing-image-url';

import { Image } from '../interfaces/image';

export const defaultImage: () => Image = () => {
  const def: Image = {
    cid: '0',
    localURL: MISSING_IMAGE_URL,
    url: MISSING_IMAGE_URL,
    serverFilename: 'missing'
  };
  return def;
};
