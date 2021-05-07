/* Interface imports */
import { BatchContext } from '../../src/app/shared/interfaces/batch';

/* Mock imports */
import { mockGrainBill } from './mock-grain-bill';
import { mockHopsSchedule } from './mock-hops-schedule';
import { mockYeastBatch } from './mock-yeast-batch';
import { mockOtherIngredients } from './mock-other-ingredients';
import { mockImage } from './mock-image';
import { mockRecipeMasterActive } from './mock-recipe-master-active';
import { mockRecipeVariantComplete } from './mock-recipe-variant-complete';

export const mockBatchContext: () => BatchContext = (): BatchContext => {
  const mock: BatchContext = {
    recipeMasterName: mockRecipeMasterActive().name,
    recipeVariantName: mockRecipeVariantComplete().variantName,
    recipeImage: mockImage(),
    boilVolume: 5,
    batchVolume: 5,
    grains: mockGrainBill(),
    hops: mockHopsSchedule(),
    yeast: mockYeastBatch(),
    otherIngredients: mockOtherIngredients()
  };
  return mock;
};
