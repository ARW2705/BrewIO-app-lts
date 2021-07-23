import { Grains } from './grains.interface';

export interface GrainBill {
  grainType: Grains;
  quantity: number; // lbs or kg
  mill: number; // 1/1000th in or mm
}
