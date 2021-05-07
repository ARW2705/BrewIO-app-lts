/* Interface imports */
import { User } from '../../src/app/shared/interfaces/user';

/* Default imports */
import { defaultEnglish } from '../../src/app/shared/defaults/default-units';

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
    units: defaultEnglish(),
    breweryLabelImage: mockImage(),
    userImage: mockImage()
  };
  return mock;
};
