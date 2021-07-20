import { Style } from './style.interface';

export interface Yeast {
  _id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  brand: string;
  form: string;
  description: string;
  attenuation: number[];
  flocculation: string;
  optimumTemperature: number[];
  alcoholTolerance: number[];
  recommendedStyles: Style[];
}
