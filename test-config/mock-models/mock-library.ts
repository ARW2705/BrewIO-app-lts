/* Interface imports */
import { LibraryStorage } from '../../src/app/shared/interfaces/library';

/* Mock imports */
import { mockGrains } from './mock-grains';
import { mockHops } from './mock-hops';
import { mockYeast } from './mock-yeast';
import { mockStyles } from './mock-styles';

export const mockLibraryStorage: () => LibraryStorage = (): LibraryStorage => {
  const mock: LibraryStorage = {
    grains: mockGrains(),
    hops: mockHops(),
    yeast: mockYeast(),
    style: mockStyles()
  };
  return mock;
};
