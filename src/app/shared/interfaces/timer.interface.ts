import { TimerProcess } from './timer-process.interface';
import { ProgressCircleSettings } from './progress-circle.interface';

export interface Timer {
  cid: string;
  first: string;
  timer: TimerProcess;
  timeRemaining: number;
  show: boolean;
  expansion: {
    value: string;
    params: {
      height: number;
      speed: number;
    }
  };
  isRunning: boolean;
  settings: ProgressCircleSettings;
}
