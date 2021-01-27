import { Image } from '../interfaces/image';

export const defaultImage: () => Image = () => {
  const def: Image = {
    cid: '0',
    localURL: 'assets/imgs/no-label-image-240.png',
    url: 'assets/imgs/no-label-image-240.png',
    serverFilename: 'missing'
  };
  return def;
};
