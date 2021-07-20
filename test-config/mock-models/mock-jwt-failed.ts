/* Interface imports */
import { UserResponse } from '../../src/app/shared/interfaces';

export const mockJWTFailed: () => UserResponse = (): UserResponse => {
  const mock: UserResponse = {
    status: 'JWT invalid',
    success: false,
    error: {
      name: 'JsonWebToken',
      message: 'jwt invalid'
    }
  };
  return mock;
};
