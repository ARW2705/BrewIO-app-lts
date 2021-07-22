import { DocumentGuard } from '../interfaces';

export const YeastBatchGuardMetadata: DocumentGuard = {
  _id:             { type: 'string' , required: false },
  createdAt:       { type: 'string' , required: false },
  updatedAt:       { type: 'string' , required: false },
  quantity:        { type: 'number' , required: true  },
  requiresStarter: { type: 'boolean', required: true  }
};
