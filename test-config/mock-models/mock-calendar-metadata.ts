/* Interface imports */
import { CalendarMetadata } from '../../src/app/shared/interfaces';

/* Mock imports */
import { mockAlertFuture } from './mock-alert-future';

export const mockCalendarMetadata: () => CalendarMetadata = (): CalendarMetadata => {
  const mock: CalendarMetadata = {
    id: 'cal-id',
    startDatetime: '2020-01-01',
    alerts: [ mockAlertFuture() ]
  };
  return mock;
};
