import { DocumentGuard } from '../interfaces';

export const ManualProcessGuardMetadata: DocumentGuard = {
  expectedDuration: { type: 'number', required: false }
};
