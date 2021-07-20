/* Interface imports */
import { ToastButton } from '../../src/app/shared/interfaces';

export const mockToastButtons: () => ToastButton[] = () => {
  const mock: ToastButton[] = [
    {
      text: 'Choice 1',
      icon: 'icon',
      handler: () => { }
    },
    {
      text: 'Choice 2',
      side: 'left',
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
