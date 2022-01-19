/* Module imports */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, defaultIfEmpty, map } from 'rxjs/operators';

/* Constant imports */
import { HIGH_SEVERITY } from '@shared/constants';

/* Interface imports */
import { SyncData, SyncError, SyncMetadata, SyncResponse } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { HttpErrorService } from '@services/http-error/http-error.service';
import { IdService } from '@services/id/id.service';
import { StorageService } from '@services/storage/storage.service';
import { TypeGuardService } from '@services/type-guard/type-guard.service';


@Injectable({
  providedIn: 'root'
})
export class SyncService {
  docsRequiringFormData: string[] = ['recipeMaster', 'inventoryItem', 'user'];
  syncFlags: SyncMetadata[] = [];
  syncKey: string = 'sync';

  constructor(
    public errorReporter: ErrorReportingService,
    public httpError: HttpErrorService,
    public idService: IdService,
    public storageService: StorageService,
    public typeGuard: TypeGuardService
  ) {
    this.init();
  }

  /***** Sync Flags *****/

  /**
   * Add a flag to sync document on server reconnect.
   * Sync method is primary determination for flags being added or modified.
   *
   * For 'delete' method: Add, modify, or remove flag based on the following conditions
   *  - If no flags present, add the delete flag
   *  - If a create flag is present, remove the flag. The doc doesn't need to
   *    sync before deleting
   *  - If an update flag is present, change the method to delete. The doc
   *    doesn't need to be updated before deleting
   *
   * @param: metadata - SyncMetadata containing sync method and doc id
   * @return: none
   */
  addDeleteSyncFlag(metadata: SyncMetadata): void {
    const currentFlagIndex = this.syncFlags
      .findIndex((syncFlag: SyncMetadata): boolean => {
        return syncFlag.docId === metadata.docId;
      });

    if (currentFlagIndex === -1) {
      this.syncFlags.push(metadata);
    } else if (this.syncFlags[currentFlagIndex].method === 'create') {
      this.syncFlags.splice(currentFlagIndex, 1);
    } else if (this.syncFlags[currentFlagIndex].method === 'update') {
      this.syncFlags[currentFlagIndex].method = 'delete';
    }
  }

  /**
   * Add a flag to sync document on server reconnect.
   * For 'create' method: No conditions, the flag is always added
   *
   * @param: metadata - SyncMetadata containing sync method and doc id
   * @return: none
   */
  addCreateSyncFlag(metadata: SyncMetadata): void {
    if (this.syncFlags.every((flag: SyncMetadata): boolean => flag.docId !== metadata.docId)) {
      this.syncFlags.push(metadata);
    }
  }

  /**
   * Add a flag to sync document on server reconnect with the following considerations:
   * Sync method is primary determination for flags being added or modified.
   *
   * For 'create' method: No conditions, the flag is always added
   *
   * For 'update' method: Add this flag only if there are no other flags for docId
   *
   * For 'delete' method: Add, modify, or remove flag based on the following conditions
   *  - If no flags present, add the delete flag
   *  - If a create flag is present, remove the flag. The doc doesn't need to
   *    sync before deleting
   *  - If an update flag is present, change the method to delete. The doc
   *    doesn't need to be updated before deleting
   *
   * @param: metadata - SyncMetadata containing sync method and doc id
   * @return: none
   */
  addSyncFlag(metadata: SyncMetadata): void {
    if (metadata.method === 'create') {
      this.addCreateSyncFlag(metadata);
    } else if (metadata.method === 'update') {
      this.addUpdateSyncFlag(metadata);
    } else if (metadata.method === 'delete') {
      this.addDeleteSyncFlag(metadata);
    } else {
      const message: string = `Unknown sync flag method: ${metadata.method}`;
      throw new CustomError('SyncError', message, HIGH_SEVERITY, message);
    }
    this.updateStorage();
  }

  /**
   * Add a flag to sync document on server reconnect.
   * For 'update' method: Add this flag only if there are no other flags for docId
   *
   * @param: metadata - SyncMetadata containing sync method and doc id
   * @return: none
   */
  addUpdateSyncFlag(metadata: SyncMetadata): void {
    const currentFlagIndex = this.syncFlags
      .findIndex((syncFlag: SyncMetadata): boolean => {
        return syncFlag.docId === metadata.docId;
      });

    if (currentFlagIndex === -1 && !this.idService.hasDefaultIdType(metadata.docId)) {
      this.syncFlags.push(metadata);
    }
  }

  /**
   * Clear sync flags array and clear storage
   *
   * @param: none
   * @return: none
   */
  clearSyncData(): void {
    this.syncFlags = [];
    this.storageService.removeSyncFlags();
  }

  /**
   * Clear all sync flags for a given doc type; update flag storage afterwards
   *
   * @param: docType - the doc type whose flags should be cleared
   * @return: none
   */
  clearSyncFlagByType(docType: string): void {
    this.syncFlags = this.syncFlags
      .filter((syncFlag: SyncMetadata): boolean => {
        return syncFlag.docType !== docType;
      });
    this.updateStorage();
  }

  /**
   * Convert a server request method name to its sync method counterpart
   *
   * @param: requestMethod - the request method to convert
   * @return: the converted sync method name
   */
  convertRequestMethodToSyncMethod(requestMethod: string): string {
    if (requestMethod === 'post') {
      return 'create';
    } else if (requestMethod === 'patch') {
      return 'update';
    } else if (requestMethod === 'delete') {
      return requestMethod;
    } else {
      const message: string = `Unknown request method: ${requestMethod}`;
      throw new CustomError('SyncError', message, HIGH_SEVERITY, message);
    }
  }

  /**
   * Get all sync flags
   *
   * @param: none
   * @return: Array of all sync metadata
   */
  getAllSyncFlags(): SyncMetadata[] {
    return this.syncFlags;
  }

  /**
   * Get array of sync flags filtered by docType
   *
   * @param: docType - document type to filter by
   * @return: Array of sync metadata for given docTypes
   */
  getSyncFlagsByType(docType: string): SyncMetadata[] {
    return this.syncFlags.filter((syncFlag: SyncMetadata): boolean => syncFlag.docType === docType);
  }

  /***** End Sync Flags *****/


  /***** Sync Error Handling *****/

  /**
   * Construct a new sync error object
   *
   * @param: message - the error message
   * @param: errCode - error id code, defaults to -1
   * @return: configured sync error
   * @note: Error Codes:
   * -1 - unknown
   *  1 - server error reseponse
   */
  constructSyncError(message: string, errCode: number = -1): SyncError {
    return { errCode, message };
  }

  /**
   * Process sync error responses into messages
   *
   * @param: errorData - array of errors
   * @return: array of formatted error messages
   */
  processSyncErrors(errorData: (HttpErrorResponse | Error)[]): SyncError[] {
    return errorData.map((error: HttpErrorResponse): SyncError => {
      if (error instanceof HttpErrorResponse) {
        const message: string = this.httpError.composeErrorMessage(error);
        return this.constructSyncError(message, 1);
      } else {
        return this.constructSyncError(error['message']);
      }
    });
  }

  /***** End Sync Error Handling *****/


  /***** Sync Request *****/

  /**
   * Append a catchError to each observable in a given array
   * of observables that resolves any thrown error
   *
   * @param: requests - array of http request observables
   * @return: observable of requests with each request having its own catchError
   */
  getRequestsWithErrorResolvingHandlers<T>(requests: Observable<T | HttpErrorResponse>[]): Observable<T | HttpErrorResponse>[] {
    return requests
      .map((request: Observable<T | HttpErrorResponse>): Observable<T | HttpErrorResponse> => {
        return request
          .pipe(catchError((error: HttpErrorResponse): Observable<HttpErrorResponse> => of(error)));
      });
  }

  /**
   * Perform sync http requests
   *
   * @param: docType - document type of requests
   * @param: requests - Array of http request observables
   * @return: observable of sync responses
   */
  sync<T>(docType: string, requests: Observable<T | HttpErrorResponse>[]): Observable<SyncResponse<T>> {
    console.log(`performing ${requests.length} ${docType} sync requests`);
    return forkJoin(this.getRequestsWithErrorResolvingHandlers<T>(requests))
      .pipe(
        defaultIfEmpty([]),
        map((responses: (T | SyncData<T> | HttpErrorResponse)[]): SyncResponse<T> => {
          console.log('sync response', responses);
          this.clearSyncFlagByType(docType);
          const errors: (HttpErrorResponse | Error)[] = [];
          const successes: T[] = [];
          responses.forEach((response: T | HttpErrorResponse): void => {
            if (response instanceof HttpErrorResponse) {
              errors.push(response);
            } else {
              successes.push(response);
            }
          });

          return {
            successes,
            errors: this.processSyncErrors(errors)
          };
        })
      );
  }

  /***** End Sync Request *****/

  /***** Storage *****/

  /**
   * Get any stored sync flags
   *
   * @param: none
   * @return: none
   */
  init(): void {
    this.storageService.getSyncFlags()
      .subscribe(
        (flags: SyncMetadata[]): void => {
          console.log('sync flags', flags);
          this.syncFlags = flags;
        },
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Update stored sync flags
   *
   * @param: none
   * @return: none
   */
  updateStorage(): void {
    this.storageService.setSyncFlags(this.syncFlags)
      .subscribe(
        (): void => console.log('Stored sync flags'),
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Storage *****/

}
