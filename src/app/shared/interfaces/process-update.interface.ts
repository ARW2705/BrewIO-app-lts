import { CalendarProcess } from './calendar-process.interface';
import { ManualProcess } from './manual-process.interface';
import { TimerProcess } from './timer-process.interface';

export interface ProcessUpdate {
  process: CalendarProcess | ManualProcess | TimerProcess | { delete: boolean };
}
