/* Interface imports */
import { SyncError } from '../../src/app/shared/interfaces/sync';

export const mockSyncError: (message?: string) => SyncError = (message: string = 'sync-error'): SyncError => {
  const mock: SyncError = {
    errCode: 1,
    message: message
  };
  return mock;
};
