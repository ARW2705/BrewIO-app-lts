/* Interface imports */
import { LoginCredentials } from '../../src/app/shared/interfaces';

export const mockUserLogin: () => LoginCredentials = (): LoginCredentials => {
  const mock: LoginCredentials = {
    username: 'mockUser',
    password: 'mockPass',
    remember: false
  };
  return mock;
};
