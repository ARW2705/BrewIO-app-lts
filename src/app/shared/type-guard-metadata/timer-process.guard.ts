import { DocumentGuard } from '../interfaces';

export const TimerProcessGuardMetadata: DocumentGuard = {
  splitInterval : { type: 'number' , required: true },
  concurrent    : { type: 'boolean', required: true },
  duration      : { type: 'number' , required: true }
};
