import { mockGrains } from './mock-grains';
import { mockHops } from './mock-hops';
import { mockYeast } from './mock-yeast';
import { mockStyles } from './mock-styles';

import { LibraryStorage } from '../../src/app/shared/interfaces/library';

export const mockLibraryStorage: () => LibraryStorage = (): LibraryStorage => {
  const mock: LibraryStorage = {
    grains: mockGrains(),
    hops: mockHops(),
    yeast: mockYeast(),
    style: mockStyles()
  };
  return mock;
};
