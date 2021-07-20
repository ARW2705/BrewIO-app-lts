import { DocumentGuard } from '../interfaces';

export const ProcessGuardMetadata: DocumentGuard = {
  _id:         { type: 'string', required: false },
  createdAt:   { type: 'string', required: false },
  updatedAt:   { type: 'string', required: false },
  cid:         { type: 'string', required: true  },
  type:        { type: 'string', required: true  },
  name:        { type: 'string', required: true  },
  description: { type: 'string', required: false }
};
