import { ActionSheetButton } from '../../src/app/shared/interfaces/action-sheet-buttons';

export const mockActionSheetButtons = () => {
  const mock: ActionSheetButton[] = [
    {
      text: 'Choice 1',
      handler: () => { }
    },
    {
      text: 'Choice 2',
      handler: () => { }
    },
    {
      text: 'Choice 3',
      handler: () => { }
    },
    {
      text: 'With Role',
      role: 'role',
      handler: () => { }
    }
  ];
  return mock;
};
