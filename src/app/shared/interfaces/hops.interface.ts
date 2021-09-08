import { Ingredient } from './ingredient.interface';

export interface Hops extends Ingredient {
  alphaAcid: number;
  type: string;
  usedFor: string[]; // Style server ids
  alternatives: string[]; // Hops server ids
}
