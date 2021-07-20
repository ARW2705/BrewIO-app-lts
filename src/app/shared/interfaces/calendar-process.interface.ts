import { Process } from './process.interface';

export interface CalendarProcess extends Process {
  startDatetime?: string;
  duration: number;
}
