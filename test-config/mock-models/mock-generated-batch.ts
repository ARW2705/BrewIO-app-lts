/* Interface imports */
import { Batch } from '../../src/app/shared/interfaces/batch';
import { RecipeMaster } from '../../src/app/shared/interfaces/recipe-master';
import { RecipeVariant } from '../../src/app/shared/interfaces/recipe-variant';
import { Process } from '../../src/app/shared/interfaces/process';
import { User } from '../../src/app/shared/interfaces/user';

/* Mock imports */
import { mockProcessSchedule } from './mock-process-schedule';
import { mockRecipeMasterActive } from './mock-recipe-master-active';
import { mockUser } from './mock-user';


export const mockGeneratedBatch: () => Batch = (): Batch => {
  const _mockUser: User = mockUser();
  const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
  const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];
  const _mockProcessSchedule: Process[] = mockProcessSchedule();
  _mockProcessSchedule.forEach((process: Process): void => {
    delete process._id;
  });

  const mock: Batch = {
    cid: '0123456789012',
    createdAt: '2020-01-01T00:00:00.000Z',
    owner: _mockUser._id,
    recipeMasterId: _mockRecipeMasterActive._id,
    recipeVariantId: _mockRecipeVariantComplete._id,
    isArchived: false,
    annotations: {
      styleId: _mockRecipeMasterActive.style._id,
      targetValues: {
        efficiency: _mockRecipeVariantComplete.efficiency,
        originalGravity: _mockRecipeVariantComplete.originalGravity,
        finalGravity: _mockRecipeVariantComplete.finalGravity,
        batchVolume: _mockRecipeVariantComplete.batchVolume,
        ABV: _mockRecipeVariantComplete.ABV,
        IBU: _mockRecipeVariantComplete.IBU,
        SRM: _mockRecipeVariantComplete.SRM
      },
      measuredValues: {
        efficiency: -1,
        originalGravity: -1,
        finalGravity: -1,
        batchVolume: -1,
        ABV: -1,
        IBU: -1,
        SRM: -1
      },
      notes: []
    },
    process: {
      currentStep: 0,
      alerts: [],
      schedule: _mockProcessSchedule
    },
    contextInfo: {
      recipeMasterName: _mockRecipeMasterActive.name,
      recipeVariantName: _mockRecipeVariantComplete.variantName,
      recipeImage: _mockRecipeMasterActive.labelImage,
      batchVolume: _mockRecipeVariantComplete.batchVolume,
      boilVolume: _mockRecipeVariantComplete.boilVolume,
      grains: _mockRecipeVariantComplete.grains,
      hops: _mockRecipeVariantComplete.hops,
      yeast: _mockRecipeVariantComplete.yeast,
      otherIngredients: _mockRecipeVariantComplete.otherIngredients
    }
  };
  return mock;
};
