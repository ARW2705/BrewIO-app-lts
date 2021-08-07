import { Alert } from './alert.interface';

export interface CalendarMetadata {
  id: string;
  startDatetime: string;
  alerts: Alert[];
}
