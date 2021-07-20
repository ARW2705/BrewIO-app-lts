import { Process } from './process.interface';

export interface ManualProcess extends Process {
  expectedDuration?: number;
}
