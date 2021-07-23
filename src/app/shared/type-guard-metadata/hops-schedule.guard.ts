import { DocumentGuard } from '../interfaces';

export const HopsScheduleGuardMetadata: DocumentGuard = {
  quantity:  { type: 'number' , required: true  },
  duration:  { type: 'number' , required: true  },
  dryHop:    { type: 'boolean', required: true  }
};
