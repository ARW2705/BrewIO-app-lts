/* Interface imports */
import { Process } from '../../src/app/shared/interfaces/process';

export const mockCalendarStep: () => Process = (): Process => {
  const mock: Process = {
    _id: 'calendar-step',
    cid: '0123456789012',
    type: 'calendar',
    name: 'mock-calendar-step',
    description: 'a mock calendar step',
    duration: 7,
  };
  return mock;
};
