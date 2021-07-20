import { DocumentGuard } from '../interfaces';

export const GrainBillGuardMetadata: DocumentGuard = {
  _id:       { type: 'string', required: false },
  createdAt: { type: 'string', required: false },
  updatedAt: { type: 'string', required: false },
  cid:       { type: 'string', required: true  },
  quantity:  { type: 'number', required: true  },
  mill:      { type: 'number', required: true  },
  notes:     { type: 'string', required: true  }
};
