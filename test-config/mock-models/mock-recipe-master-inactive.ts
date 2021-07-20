/* Interface imports */
import { RecipeMaster } from '../../src/app/shared/interfaces';

/* Mock imports */
import { mockStyles } from './mock-styles';

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
