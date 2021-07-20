import { Grains } from './grains.interface';
import { Hops } from './hops.interface';
import { Style } from './style.interface';
import { Yeast } from './yeast.interface';

export interface LibraryStorage {
  grains: Grains[];
  hops: Hops[];
  yeast: Yeast[];
  style: Style[];
}
