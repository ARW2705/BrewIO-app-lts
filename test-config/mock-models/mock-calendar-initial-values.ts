/* Module imports */
import * as moment from 'moment';

/* Interface imports */
import { CalendarInitialValues } from '../../src/app/shared/interfaces';

/**
 * start and display dates are set to '2020-01-01' (wed) and projected dates is empty
 */
export const mockCalendarInitialValues: () => CalendarInitialValues = (): CalendarInitialValues => {
  const mockMoment: moment.Moment = moment('2020-01-01');
  const mock: CalendarInitialValues = {
    displayDate: mockMoment,
    projectedDates: [],
    startDate: mockMoment
  };
  return mock;
};
