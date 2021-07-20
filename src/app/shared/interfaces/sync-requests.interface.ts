import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SyncData } from './sync-data.interface';
import { SyncError } from './sync-error.interface';

export interface SyncRequests<T> {
  syncRequests: Observable<HttpErrorResponse | T | SyncData<T>>[];
  syncErrors: SyncError[];
}
