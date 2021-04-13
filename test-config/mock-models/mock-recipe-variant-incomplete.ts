import { RecipeVariant } from '../../src/app/shared/interfaces/recipe-variant';

export const mockRecipeVariantIncomplete: () => RecipeVariant = (): RecipeVariant => {
  const mock: RecipeVariant = {
    _id: 'incomplete',
    cid: '1234567890124',
    variantName: 'incomplete',
    notes: [],
    isFavorite: false,
    isMaster: false,
    efficiency: 70,
    brewingType: 'None Selected',
    mashDuration: 60,
    boilDuration: 60,
    batchVolume: 5,
    boilVolume: 6,
    mashVolume: 6.5,
    originalGravity: 1.000,
    finalGravity: 1.000,
    ABV: 0,
    IBU: 0,
    SRM: 0,
    grains: [],
    hops: [],
    yeast: [],
    otherIngredients: [],
    processSchedule: []
  };
  return mock;
};
