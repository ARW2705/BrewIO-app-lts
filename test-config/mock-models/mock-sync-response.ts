import { SyncResponse } from '../../src/app/shared/interfaces/sync';

export const mockSyncResponse: <T>() => SyncResponse<T> = <T>(): SyncResponse<T> => {
  const mock: SyncResponse<T> = {
    successes: [],
    errors: []
  };
  return mock;
};
