import { DocumentGuard } from '../interfaces';

export const RecipeMasterGuardMetadata: DocumentGuard = {
  _id:           { type: 'string' , required: false },
  createdAt:     { type: 'string' , required: false },
  updatedAt:     { type: 'string' , required: false },
  cid:           { type: 'string' , required: true  },
  name:          { type: 'string' , required: true  },
  notes:         { type: 'string' , required: true  },
  master:        { type: 'string' , required: true  },
  owner:         { type: 'string' , required: true  },
  isPublic:      { type: 'boolean', required: true  },
  isFriendsOnly: { type: 'boolean', required: true  }
};
