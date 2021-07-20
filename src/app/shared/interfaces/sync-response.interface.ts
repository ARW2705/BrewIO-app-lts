import { SyncData } from './sync-data.interface';
import { SyncError } from './sync-error.interface';

export interface SyncResponse<T> {
  successes: T[] | SyncData<T>;
  errors: SyncError[];
}
