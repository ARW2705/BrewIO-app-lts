import { DocumentGuard } from '../interfaces';

export const OtherIngredientsGuardMetadata: DocumentGuard = {
  name:        { type: 'string', required: true  },
  type:        { type: 'string', required: true  },
  description: { type: 'string', required: true  },
  quantity:    { type: 'number', required: true  },
  units:       { type: 'string', required: true  }
};
