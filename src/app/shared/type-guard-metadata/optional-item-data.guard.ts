import { DocumentGuard } from '../interfaces';

export const OptionalItemDataGuardMetadata: DocumentGuard = {
  batchId:            { type: 'string', required: false },
  itemIBU:            { type: 'number', required: false },
  itemSRM:            { type: 'number', required: false },
  itemSubname:        { type: 'string', required: false },
  originalRecipe:     { type: 'string', required: false },
  packagingDate:      { type: 'string', required: false },
  remainingColor:     { type: 'string', required: false },
  srmColor:           { type: 'string', required: false },
  supplierURL:        { type: 'string', required: false }
};
