import { Batch, BatchAnnotations, BatchContext } from '../../src/app/shared/interfaces/batch';
import { RecipeMaster } from '../../src/app/shared/interfaces/recipe-master';
import { RecipeVariant } from '../../src/app/shared/interfaces/recipe-variant';
import { User } from '../../src/app/shared/interfaces/user';
import { Process } from '../../src/app/shared/interfaces/process';

import { mockGrainBill } from './mock-grain-bill';
import { mockHopsSchedule } from './mock-hops-schedule';
import { mockYeastBatch } from './mock-yeast-batch';
import { mockOtherIngredients } from './mock-other-ingredients';
import { mockImage } from './mock-image';
import { mockProcessSchedule } from './mock-process-schedule';
import { mockRecipeMasterActive } from './mock-recipe-master-active';
import { mockRecipeVariantComplete } from './mock-recipe-variant-complete';
import { mockStyles } from './mock-styles';
import { mockUser } from './mock-user';

export const mockBatch: () => Batch = (): Batch => {
  const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
  const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

  const mock: Batch = {
    _id: 'test-id',
    cid: '1234567890123',
    owner: 'user-id',
    createdAt: '2020-01-01T12:00:00.000Z',
    updatedAt: '2020-02-02T08:30:00.000Z',
    recipeMasterId: _mockRecipeMasterActive._id,
    recipeVariantId: _mockRecipeVariantComplete._id,
    isArchived: false,
    annotations: mockBatchAnnotations(),
    process: {
      currentStep: 4,
      schedule: mockProcessSchedule(),
      alerts: []
    },
    contextInfo: mockBatchContext()
  };
  return mock;
};

export const mockBatchAnnotations: () => BatchAnnotations = (): BatchAnnotations => {
  const mock: BatchAnnotations = {
    styleId: mockStyles()[0]._id,
    targetValues: {
      originalGravity: 1.050,
      finalGravity: 1.010,
      efficiency: 70,
      batchVolume: 5,
      ABV: 5.25,
      IBU: 30,
      SRM: 20
    },
    measuredValues: {
      originalGravity: 1.055,
      finalGravity: 1.012,
      efficiency: 70,
      batchVolume: 5,
      ABV: 5.64,
      IBU: 30,
      SRM: 20
    },
    notes: [],
    packagingDate: 'package-date'
  };
  return mock;
};

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
