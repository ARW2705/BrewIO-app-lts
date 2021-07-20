/* Interface imports */
import { User } from '../../src/app/shared/interfaces';

/* Default imports */
import { defaultEnglishUnits } from '../../src/app/shared/defaults';

/* Mock imports */
import { mockImage } from './mock-image';

export const mockUser: () => User = (): User => {
  const mock: User =  {
    _id: 'test-id',
    cid: 'offline',
    createdAt: '',
    updatedAt: '',
    username: 'mockUser',
    firstname: 'test',
    lastname: 'user',
    email: 'test@user.com',
    friendList: ['userId1', 'userId2'],
    token: 'testtoken',
    preferredUnitSystem: 'english standard',
    units: defaultEnglishUnits(),
    breweryLabelImage: mockImage(),
    userImage: mockImage()
  };
  return mock;
};
