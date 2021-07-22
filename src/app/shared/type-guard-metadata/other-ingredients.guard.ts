import { DocumentGuard } from '../interfaces';

export const OtherIngredientsGuardMetadata: DocumentGuard = {
  _id:         { type: 'string', required: false },
  createdAt:   { type: 'string', required: false },
  updatedAt:   { type: 'string', required: false },
  name:        { type: 'string', required: true  },
  type:        { type: 'string', required: true  },
  description: { type: 'string', required: true  },
  quantity:    { type: 'number', required: true  },
  units:       { type: 'string', required: true  }
};
