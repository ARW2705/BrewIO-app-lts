import { SyncError, SyncMetadata, SyncResponse } from '../../src/app/shared/interfaces/sync';

export const mockSyncError: (message?: string) => SyncError = (message: string = 'sync-error'): SyncError => {
  const mock: SyncError = {
    errCode: 1,
    message: message
  };
  return mock;
};

export const mockSyncMetadata = (method: string, docId: string, docType: string) => {
  const mock: SyncMetadata = {
    method: method,
    docId: docId,
    docType: docType
  };

  return mock;
};

export const mockSyncResponse: <T>() => SyncResponse<T> = <T>(): SyncResponse<T> => {
  const mock: SyncResponse<T> = {
    successes: [],
    errors: []
  };
  return mock;
};
