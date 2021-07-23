import { DocumentGuard } from '../interfaces';

export const GrainBillGuardMetadata: DocumentGuard = {
  quantity:  { type: 'number', required: true  },
  mill:      { type: 'number', required: true  }
};
