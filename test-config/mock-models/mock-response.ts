import { HttpErrorResponse } from '@angular/common/http';

import { UserResponse } from '../../src/app/shared/interfaces/user-response';

import { mockUser } from './mock-user';

export const mockErrorResponse: (status: number, statusText: string, error?: object) => HttpErrorResponse = (status: number, statusText: string, error?: object): HttpErrorResponse => {
  const mock = {
    status: status,
    statusText: statusText
  };

  if (error) {
    mock['error'] = error;
  }

  return new HttpErrorResponse(mock);
};

export const mockJWTSuccess: () => UserResponse = (): UserResponse => {
  const mock: UserResponse = {
    status: 'JWT valid',
    success: true,
    user: mockUser()
  };
  return mock;
};

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

export const mockLoginResponse: () => UserResponse = (): UserResponse => {
  const mock: UserResponse = {
    success: true,
    status: 'authed',
    user: mockUser()
  };
  return mock;
};
