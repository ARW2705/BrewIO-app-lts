import { DocumentGuard } from '../interfaces';

export const YeastGuardMetadata: DocumentGuard = {
  _id:                { type: 'string', required: true },
  createdAt:          { type: 'string', required: true },
  updatedAt:          { type: 'string', required: true },
  name:               { type: 'string', required: true },
  brand:              { type: 'string', required: true },
  form:               { type: 'string', required: true },
  description:        { type: 'string', required: true },
  attenuation:        { type: 'number', required: true },
  flocculation:       { type: 'string', required: true },
  optimumTemperature: { type: 'number', required: true },
  alcoholTolerance:   { type: 'number', required: true }
};
