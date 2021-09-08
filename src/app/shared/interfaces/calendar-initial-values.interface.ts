import * as moment from 'moment';
import { CalendarDate } from './calendar-date.interface';

export interface CalendarInitialValues {
  displayDate: moment.Moment;
  projectedDates: CalendarDate[];
  startDate: moment.Moment;
}
