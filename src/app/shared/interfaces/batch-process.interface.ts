import { Alert } from './alert.interface';
import { Process } from './process.interface';

export interface BatchProcess {
  currentStep: number;
  schedule: Process[];
  alerts: Alert[];
}
