import { DocumentGuard } from '../interfaces';

export const StyleGuardMetadata: DocumentGuard = {
  _id:             { type: 'string', required: true },
  createdAt:       { type: 'string', required: true },
  updatedAt:       { type: 'string', required: true },
  name:            { type: 'string', required: true },
  description:     { type: 'string', required: true },
  originalGravity: { type: 'number', required: true },
  finalGravity:    { type: 'number', required: true },
  IBU:             { type: 'number', required: true },
  SRM:             { type: 'number', required: true },
  co2Volume:       { type: 'number', required: true }
};
