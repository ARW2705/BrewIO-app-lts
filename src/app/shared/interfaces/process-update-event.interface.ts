import { CalendarProcess } from './calendar-process.interface';
import { ManualProcess } from './manual-process.interface';
import { TimerProcess } from './timer-process.interface';

export interface ProcessUpdateEvent {
  process: CalendarProcess | ManualProcess | TimerProcess | { delete: boolean };
  type: string;
  index?: number;
  toUpdate?: CalendarProcess | ManualProcess | TimerProcess;
}
