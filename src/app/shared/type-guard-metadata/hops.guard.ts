import { DocumentGuard } from '../interfaces';

export const HopsGuardMetadata: DocumentGuard = {
  _id:         { type: 'string', required: true },
  createdAt:   { type: 'string', required: true },
  updatedAt:   { type: 'string', required: true },
  name:        { type: 'string', required: true },
  alphaAcid:   { type: 'number', required: true },
  type:        { type: 'string', required: true },
  description: { type: 'string', required: true },
};
