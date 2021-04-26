import * as moment from 'moment';

import { Process } from '../../src/app/shared/interfaces/process';
import { CalendarDate } from '../../src/app/shared/interfaces/calendar-date';

export const mockCalendarDate = () => {
  const mock: CalendarDate = {
    mDate: moment('2020-01-01T12:00:00.000Z'),
    isStart: false,
    isProjected: false,
    isToday: false,
    isMonth: false
  };
  return mock;
};

export const mockCalendarStep = () => {
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
