import { DocumentGuard } from '../interfaces';

export const PrimaryValuesGuardMetadata: DocumentGuard = {
  efficiency:      { type: 'number' , required: false },
  originalGravity: { type: 'number' , required: false },
  finalGravity:    { type: 'number' , required: false },
  batchVolume:     { type: 'number' , required: false },
  ABV:             { type: 'number' , required: true  },
  IBU:             { type: 'number' , required: true  },
  SRM:             { type: 'number' , required: true  }
};
