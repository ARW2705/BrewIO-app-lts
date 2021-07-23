import { Hops } from './hops.interface';

export interface HopsSchedule {
  hopsType: Hops;
  quantity: number; // oz or gz
  duration: number; // minutes
  dryHop: boolean;
}
