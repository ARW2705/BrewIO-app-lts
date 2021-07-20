import { Image } from './image.interface';
import { SelectedUnits } from './selected-units.interface';

export interface User {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  cid?: string;
  username: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  friendList?: string[];
  token: string;
  preferredUnitSystem: string;
  units: SelectedUnits;
  breweryLabelImage?: Image;
  userImage?: Image;
}
