import { DocumentGuard } from '../interfaces';

export const BatchGuardMetadata: DocumentGuard = {
  _id:             { type: 'string' , required: false },
  createdAt:       { type: 'string' , required: false },
  updatedAt:       { type: 'string' , required: false },
  cid:             { type: 'string' , required: true  },
  owner:           { type: 'string' , required: true  },
  recipeMasterId:  { type: 'string' , required: true  },
  recipeVariantId: { type: 'string' , required: true  },
  isArchived:      { type: 'boolean', required: true  }
};
