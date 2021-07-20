import { DocumentGuard } from '../interfaces';

export const BatchContextGuardMetadata: DocumentGuard = {
  recipeMasterName:  { type: 'string', required: true },
  recipeVariantName: { type: 'string', required: true },
  boilVolume:        { type: 'number', required: true },
  batchVolume:       { type: 'number', required: true }
};
