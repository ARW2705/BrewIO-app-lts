/* Interface imports */
import { DocumentGuard } from '../../src/app/shared/interfaces';

export const mockDocumentGuard: () => DocumentGuard = (): DocumentGuard => {
  const mock: DocumentGuard = {
    prop1: { type: 'string' , required: false },
    prop2: { type: 'boolean', required: true  },
    prop3: { type: 'number' , required: false }
  };
  return mock;
};
