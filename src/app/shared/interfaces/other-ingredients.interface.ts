import { Ingredient } from './ingredient.interface';

export interface OtherIngredients extends Ingredient {
  type: string;
  quantity: number;
  units: string;
}
