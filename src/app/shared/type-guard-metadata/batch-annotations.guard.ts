import { DocumentGuard } from '../interfaces';

export const BatchAnnotationsGuardMetadata: DocumentGuard = {
  styleId:       { type: 'string', required: true  },
  notes:         { type: 'string', required: true  },
  packagingDate: { type: 'string', required: false }
};
