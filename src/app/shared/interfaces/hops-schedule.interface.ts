import { Hops } from './hops.interface';

export interface HopsSchedule {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  hopsType: Hops;
  quantity: number; // oz or gz
  duration: number; // minutes
  dryHop: boolean;
}
