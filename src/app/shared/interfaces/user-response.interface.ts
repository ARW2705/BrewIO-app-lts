import { User } from './user.interface';

export interface UserResponse {
  status: string;
  success: boolean;
  user?: User;
  error?: object;
}
