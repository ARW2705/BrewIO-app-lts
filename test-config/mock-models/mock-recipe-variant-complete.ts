import { RecipeVariant } from '../../src/app/shared/interfaces/recipe-variant';
import { mockGrainBill } from './mock-grain-bill';
import { mockHopsSchedule } from './mock-hops-schedule';
import { mockYeastGroup } from './mock-yeast-group';
import { mockProcessSchedule } from './mock-process-schedule';

export const mockRecipeVariantComplete = () => {
  const mock: RecipeVariant = {
    _id: 'complete',
    cid: '1234567890123',
    variantName: 'complete',
    notes: [],
    isFavorite: false,
    isMaster: true,
    efficiency: 70,
    brewingType: 'Extract',
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
    grains: mockGrainBill(),
    hops: mockHopsSchedule(),
    yeast: mockYeastGroup(),
    otherIngredients: [],
    processSchedule: mockProcessSchedule()
  };
  return mock;
};
