import { DocumentGuard } from '../interfaces';

export const HopsGuardMetadata: DocumentGuard = {
  _id:          { type: 'string', required: false },
  createdAt:    { type: 'string', required: false },
  updatedAt:    { type: 'string', required: false },
  name:         { type: 'string', required: true  },
  alphaAcid:    { type: 'number', required: true  },
  type:         { type: 'string', required: true  },
  description:  { type: 'string', required: false },
  usedFor:      { type: 'string', required: true  },
  alternatives: { type: 'string', required: true  }
};
