import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export interface SyncData<T> {
  isDeleted: boolean;
  data: T;
}

/**
 * Error Codes:
 *
 * -1 - not defined at this time
 *
 * 1 - server response error
 */
export interface SyncError {
  errCode: number;
  message: string;
}

/**
 * Sync handling schema
 *
 * Events to trigger sync operations:
 *  - Signup
 *  - Login
 *  - Reconnect
 *
 *
 * Create:
 *   Conditions for adding flag:
 *     - Always add create flags
 *
 *  On sync:
 *    - Perform a post request
 *
 * Update:
 *   Conditions for adding flag:
 *     - No other flags for the doc exist
 *
 *  On sync:
 *    - Create was done offline - perform a post request
 *    - Create was done online - perform a patch request
 *
 * Delete:
 *   Conditions for adding flag:
 *    - No other flags exist - add flag
 *    - If create flag exists - remove the flag
 *    - If update flag exists - change flag method to delete
 *
 *  On sync:
 *    - Perform a delete request
 */
export interface SyncMetadata {
  method: string; // 'create', 'update', or 'delete'
  docId: string; // _id property of doc
  docType: string; // 'recipe', 'batch', or 'user'
}

export interface SyncRequests<T> {
  syncRequests: Observable<HttpErrorResponse | T | SyncData<T>>[];
  syncErrors: SyncError[];
}

export interface SyncResponse<T> {
  successes: T[] | SyncData<T>;
  errors: SyncError[];
}
