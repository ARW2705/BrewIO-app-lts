/* Module imports */
import * as moment from 'moment';

/* Interface imports */
import { CalendarDate } from '../../src/app/shared/interfaces/calendar-date';

export const mockCalendarDate: () => CalendarDate = (): CalendarDate => {
  const mock: CalendarDate = {
    mDate: moment('2020-01-01T12:00:00.000Z'),
    isStart: false,
    isProjected: false,
    isToday: false,
    isMonth: false
  };
  return mock;
};
