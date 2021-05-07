/* Interface imports */
import { LoginCredentials } from '../../src/app/shared/interfaces/login-credentials';

export const mockUserLogin: () => LoginCredentials = (): LoginCredentials => {
  const mock: LoginCredentials = {
    username: 'mockUser',
    password: 'mockPass',
    remember: false
  };
  return mock;
};
