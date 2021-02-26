import { Image } from './image';
import { SelectedUnits } from './units';

export interface User {
  _id?: string;
  cid: string;
  createdAt?: string;
  updatedAt?: string;
  username: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  friendList?: Array<string>;
  token: string;
  preferredUnitSystem: string;
  units: SelectedUnits;
  breweryLabelImage?: Image;
  userImage?: Image;
}
