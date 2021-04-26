import { RecipeMaster } from '../../src/app/shared/interfaces/recipe-master';
import { RecipeVariant } from '../../src/app/shared/interfaces/recipe-variant';

import { mockImage } from './mock-image';
import { mockGrainBill } from './mock-grains';
import { mockHopsSchedule } from './mock-hops';
import { mockYeastBatch } from './mock-yeast';
import { mockOtherIngredients } from './mock-other-ingredients';
import { mockProcessSchedule } from './mock-process-schedule';
import { mockStyles } from './mock-styles';

export const mockRecipeMasterActive: () => RecipeMaster = (): RecipeMaster => {
  const mock: RecipeMaster = {
    _id: 'active',
    cid: '1234567890123',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    name: 'active',
    style: mockStyles()[0],
    notes: [],
    master: 'complete',
    owner: 'user-id',
    isPublic: true,
    isFriendsOnly: false,
    labelImage: mockImage(),
    variants: [
      mockRecipeVariantComplete(),
      mockRecipeVariantIncomplete()
    ]
  };
  return mock;
};

export const mockRecipeMasterInactive: () => RecipeMaster = (): RecipeMaster => {
  const mock: RecipeMaster = {
    _id: 'inactive',
    cid: '1234567890124',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    name: 'inactive',
    style: mockStyles()[0],
    notes: [],
    master: 'complete',
    owner: 'owner-id',
    isPublic: true,
    isFriendsOnly: false,
    variants: []
  };
  return mock;
};

export const mockRecipeVariantComplete: () => RecipeVariant = () => {
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
    yeast: mockYeastBatch(),
    otherIngredients: mockOtherIngredients(),
    processSchedule: mockProcessSchedule()
  };
  return mock;
};

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
