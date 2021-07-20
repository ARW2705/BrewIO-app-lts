import { DocumentGuard } from '../interfaces';

export const UserGuardMetadata: DocumentGuard = {
  _id:                 { type: 'string', required: false },
  createdAt:           { type: 'string', required: false },
  updatedAt:           { type: 'string', required: false },
  cid:                 { type: 'string', required: false },
  username:            { type: 'string', required: true  },
  firstname:           { type: 'string', required: false },
  lastname:            { type: 'string', required: false },
  email:               { type: 'string', required: false },
  friendList:          { type: 'string', required: false },
  token:               { type: 'string', required: true  },
  preferredUnitSystem: { type: 'string', required: true  }
};
