import { Image } from './image';
import { RecipeVariant } from './recipe-variant';
import { Style } from './library';

export interface RecipeMaster {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  cid: string;
  name: string;
  style: Style;
  notes: string[];
  master: string; // variant id to be used as master of recipe
  owner: string; // user id of recipe author
  isPublic: boolean;
  isFriendsOnly: boolean;
  variants: RecipeVariant[];
  labelImage?: Image;
}
