/* Interface imports */
import { SyncMetadata } from '../../src/app/shared/interfaces';

export const mockSyncMetadata = (method: string, docId: string, docType: string) => {
  const mock: SyncMetadata = {
    method: method,
    docId: docId,
    docType: docType
  };

  return mock;
};
