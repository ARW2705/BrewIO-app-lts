import { LoginCredentials } from '../../src/app/shared/interfaces/login-credentials';
import { User } from '../../src/app/shared/interfaces/user';

import { defaultEnglish, defaultMetric } from '../../src/app/shared/defaults/default-units';
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

export const mockUserLogin: () => LoginCredentials = (): LoginCredentials => {
  const mock: LoginCredentials = {
    username: 'mockUser',
    password: 'mockPass',
    remember: false
  };
  return mock;
};
