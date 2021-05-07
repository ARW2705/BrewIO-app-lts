/* Interface imports */
import { User } from '../../src/app/shared/interfaces/user';

/* Default imports */
import { defaultMetric } from '../../src/app/shared/defaults/default-units';

/* Mock imports */
import { mockImage } from './mock-image';

export const mockUserUpdate: () => User = (): User => {
  const mock: User = {
    _id: 'update-id',
    cid: '12345',
    createdAt: '2020-01-01',
    updatedAt: '2020-02-02',
    username: 'updated user',
    firstname: 'first',
    lastname: 'last',
    email: 'email@email',
    friendList: [],
    token: 'updated-token',
    preferredUnitSystem: 'metric',
    units: defaultMetric(),
    breweryLabelImage: mockImage(),
    userImage: mockImage()
  };
  mock.breweryLabelImage.url = 'updated-url';
  mock.userImage.url = 'updated-url';
  return mock;
};