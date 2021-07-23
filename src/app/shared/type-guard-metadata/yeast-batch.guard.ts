import { DocumentGuard } from '../interfaces';

export const YeastBatchGuardMetadata: DocumentGuard = {
  quantity:        { type: 'number' , required: true  },
  requiresStarter: { type: 'boolean', required: true  }
};
