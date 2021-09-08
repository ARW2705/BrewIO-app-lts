import { Ingredient } from './ingredient.interface';
import { Style } from './style.interface';

export interface Yeast extends Ingredient {
  brand: string;
  form: string;
  attenuation: number[];
  flocculation: string;
  optimumTemperature: number[];
  alcoholTolerance: number[];
  recommendedStyles: Style[];
}
