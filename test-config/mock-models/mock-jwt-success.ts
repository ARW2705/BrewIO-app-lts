/* Interface imports */
import { UserResponse } from '../../src/app/shared/interfaces';

/* Mock imports */
import { mockUser } from './mock-user';

export const mockJWTSuccess: () => UserResponse = (): UserResponse => {
  const mock: UserResponse = {
    status: 'JWT valid',
    success: true,
    user: mockUser()
  };
  return mock;
};
