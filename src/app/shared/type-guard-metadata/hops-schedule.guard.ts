import { DocumentGuard } from '../interfaces';

export const HopsScheduleGuardMetadata: DocumentGuard = {
  _id:       { type: 'string' , required: false },
  createdAt: { type: 'string' , required: false },
  updatedAt: { type: 'string' , required: false },
  quantity:  { type: 'number' , required: true  },
  duration:  { type: 'number' , required: true  },
  dryHop:    { type: 'boolean', required: true  }
};
