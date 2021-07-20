import { DocumentGuard } from '../interfaces';

export const BatchProcessGuardMetadata: DocumentGuard = {
  currentStep: { type: 'number', required: true  }
};
