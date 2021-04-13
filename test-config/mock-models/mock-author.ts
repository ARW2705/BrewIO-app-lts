import { Author } from '../../src/app/shared/interfaces/author';

import { mockImage } from './mock-image';

export const mockAuthor: () => Author = (): Author => {
  const mock: Author = {
    username: 'Mock Author',
    userImage: mockImage(),
    breweryLabelImage: mockImage()
  };
  return mock;
};
