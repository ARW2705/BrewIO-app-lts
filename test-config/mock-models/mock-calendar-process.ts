/* Interface imports */
import { CalendarProcess } from '../../src/app/shared/interfaces';

export const mockCalendarProcess: () => CalendarProcess = (): CalendarProcess => {
  const mock: CalendarProcess = {
    _id: 'calendar-step',
    cid: '0123456789012',
    type: 'calendar',
    name: 'mock-calendar-step',
    description: 'a mock calendar step',
    duration: 7,
  };
  return mock;
};
