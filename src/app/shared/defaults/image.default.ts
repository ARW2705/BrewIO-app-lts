import { MISSING_IMAGE_URL } from '../constants';

import { Image } from '../interfaces';

export const defaultImage: () => Image = () => {
  const _default: Image = {
    cid: '0',
    hasPending: false,
    localURL: MISSING_IMAGE_URL,
    url: MISSING_IMAGE_URL,
    serverFilename: 'missing'
  };
  return _default;
};
