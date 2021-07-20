/* Interface imports */
import { ImageRequestFormData } from '../../src/app/shared/interfaces';

/* Mock imports */
import { mockImage } from './mock-image';

export const mockImageRequestFormData: () => ImageRequestFormData = (): ImageRequestFormData => {
  const mock: ImageRequestFormData = {
    name: 'test-img',
    image: mockImage()
  };
  return mock;
};
