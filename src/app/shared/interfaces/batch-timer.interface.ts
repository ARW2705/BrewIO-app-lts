import { BehaviorSubject } from 'rxjs';
import { Timer } from './timer.interface';

export interface BatchTimer {
  batchId: string;
  timers: BehaviorSubject<Timer>[];
}
