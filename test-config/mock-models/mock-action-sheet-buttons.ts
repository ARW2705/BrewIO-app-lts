import { ActionSheetButton } from '../../src/app/shared/interfaces';

export const mockActionSheetButtons: () => ActionSheetButton[] = () => {
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
