/* Interface imports */
import { UserResponse } from '../../src/app/shared/interfaces';

/* Mock imports */
import { mockUser } from './mock-user';

export const mockLoginResponse: () => UserResponse = (): UserResponse => {
  const mock: UserResponse = {
    success: true,
    status: 'authed',
    user: mockUser()
  };
  return mock;
};
