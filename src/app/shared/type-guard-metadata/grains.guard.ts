import { DocumentGuard } from '../interfaces';

export const GrainsGuardMetadata: DocumentGuard = {
  _id:         { type: 'string', required: false },
  createdAt:   { type: 'string', required: false },
  updatedAt:   { type: 'string', required: false },
  name:        { type: 'string', required: true  },
  lovibond:    { type: 'number', required: true  },
  gravity:     { type: 'number', required: true  },
  description: { type: 'string', required: true  },
};
