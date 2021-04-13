import { RecipeMaster } from '../../src/app/shared/interfaces/recipe-master';

import { mockRecipeVariantComplete } from './mock-recipe-variant-complete';
import { mockRecipeVariantIncomplete } from './mock-recipe-variant-incomplete';
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
    variants: [
      mockRecipeVariantComplete(),
      mockRecipeVariantIncomplete()
    ]
  };
  return mock;
};
