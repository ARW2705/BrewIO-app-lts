import { DocumentGuard } from '../interfaces';

export const GrainsGuardMetadata: DocumentGuard = {
  _id:         { type: 'string', required: true },
  createdAt:   { type: 'string', required: true },
  updatedAt:   { type: 'string', required: true },
  name:        { type: 'string', required: true },
  lovibond:    { type: 'number', required: true },
  gravity:     { type: 'number', required: true },
  description: { type: 'string', required: true },
};
