/* Module imports */
import * as moment from 'moment';

/* Interface imports */
import { CalendarDate } from '../../src/app/shared/interfaces';

/**
 * Get a mock CalendarDate
 * momentjs date is 12:00am Wed Jan 1 2020 with all other fields false
 *
 * @param: none
 *
 * @return: CalendarDate
 */
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
