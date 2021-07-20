import { DocumentGuard } from '../interfaces';

export const AlertGuardMetadata: DocumentGuard = {
  title:       { type: 'string', required: true },
  description: { type: 'string', required: true },
  datetime:    { type: 'string', required: true }
};
