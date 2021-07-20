import { Process } from './process.interface';

export interface TimerProcess extends Process {
  splitInterval: number;
  concurrent: boolean;
  duration: number;
}
