import { Style } from './style.interface';

export interface Hops {
  _id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  alphaAcid: number;
  type: string;
  description: string;
  usedFor: Style[];
  alternatives: Hops[];
}
