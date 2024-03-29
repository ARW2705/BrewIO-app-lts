/* Interface imports */
import { Batch, RecipeMaster, RecipeVariant } from '../../src/app/shared/interfaces';

/* Mock imports */
import { mockBatchAnnotations, mockBatchContext, mockProcessSchedule, mockRecipeMasterActive, mockRecipeVariantComplete } from '../mock-models';

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
