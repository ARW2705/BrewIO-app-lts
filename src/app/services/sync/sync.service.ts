/* Module imports */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

/* Interface imports */
import { SyncError, SyncData, SyncMetadata, SyncResponse } from '../../shared/interfaces/sync';

/* Utility imports */
import { hasDefaultIdType } from '../../shared/utility-functions/id-helpers';

/* Service imports */
import { StorageService } from '../storage/storage.service';


@Injectable({
  providedIn: 'root'
})
export class SyncService {
  docsRequiringFormData: string[] = ['recipeMaster', 'inventoryItem', 'user'];
  syncFlags: SyncMetadata[] = [];
  syncKey: string = 'sync';

  constructor(public storageService: StorageService) {
    this.init();
  }

  /**
   * Add a flag to sync document on reconnect with the following considerations:
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
   * @params: metadata - SyncMetadata containing sync method and doc id
   *
   * @return: none
   */
  addSyncFlag(metadata: SyncMetadata): void {
    if (metadata.method === 'create') {
      if (this.syncFlags.every((flag: SyncMetadata): boolean => flag.docId !== metadata.docId)) {
        this.syncFlags.push(metadata);
      }
    } else if (metadata.method === 'update') {
      const currentFlagIndex = this.syncFlags
        .findIndex((syncFlag: SyncMetadata): boolean => {
          return syncFlag.docId === metadata.docId;
        });

      if (currentFlagIndex === -1 && !hasDefaultIdType(metadata.docId)) {
        this.syncFlags.push(metadata);
      }
    } else if (metadata.method === 'delete') {
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
    } else {
      throw new Error(`Unknown sync flag method: ${metadata.method}`);
    }
    this.updateStorage();
  }

  /**
   * Clear sync flags array and clear storage
   *
   * @params: none
   * @return: none
   */
  clearSyncData(): void {
    this.syncFlags = [];
    this.storageService.removeSyncFlags();
  }

  /**
   * Clear all sync flags for a given doc type; update flag storage afterwards
   *
   * @params: docType - the doc type whose flags should be cleared
   *
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
   * Construct a new sync error object
   *
   * @params: message - the error message
   * @params: errCode - error id code, defaults to -1
   *
   * Error Codes:
   * -1 - Unknown
   * 1 - Server error response
   *
   * @return: configured sync error
   */
  constructSyncError(message: string, errCode: number = -1): SyncError {
    return {
      errCode: errCode,
      message: message
    };
  }

  /**
   * Get all sync flags
   *
   * @params: none
   *
   * @return: Array of all sync metadata
   */
  getAllSyncFlags(): SyncMetadata[] {
    return this.syncFlags;
  }

  /**
   * Get array of sync flags filtered by docType
   *
   * @params: docType - document type to filter by
   *
   * @return: Array of sync metadata for given docTypes
   */
  getSyncFlagsByType(docType: string): SyncMetadata[] {
    return this.syncFlags
      .filter((syncFlag: SyncMetadata): boolean => {
        return syncFlag.docType === docType;
      });
  }

  /**
   * Get any stored sync flags
   *
   * @params: none
   * @return: none
   */
  init(): void {
    this.storageService.getSyncFlags()
      .subscribe(
        (flags: SyncMetadata[]): void => {
          console.log('sync flags', flags);
          this.syncFlags = flags;
        },
        (error: object | string): void => {
          if (error['name'] === 'NotFoundError') {
            console.log(error['message']);
          } else {
            console.log('Sync error', error);
          }
        }
      );
  }

  /**
   * Process sync error responses into messages
   *
   * @params: errorData - array of errors
   *
   * @return: array of formatted error messages
   */
  processSyncErrors(errorData: (HttpErrorResponse | Error)[]): SyncError[] {
    return errorData.map((error: HttpErrorResponse): SyncError => {
      if (error instanceof HttpErrorResponse) {
        const errStatus: number = error.status ? error.status : 503;
        const errText: string = error.status ? error.statusText : 'Service unavailable';
        const additionalText: string = error.error && error.error.name === 'ValidationError'
          ? `: ${error.error.message}`
          : '';
        return this.constructSyncError(`<${errStatus}> ${errText || ''}${additionalText}`, 1);
      } else {
        return this.constructSyncError(error['message']);
      }
    });
  }

  /**
   * Perform sync http requests
   *
   * @params: docType - document type of requests
   * @params: requests - Array of http request observables
   *
   * @return: observable of sync responses
   */
  sync<T>(docType: string, requests: Observable<T | HttpErrorResponse>[]): Observable<SyncResponse<T>> {
    console.log(`performing ${requests.length} ${docType} sync requests`);
    return forkJoin(requests)
      .pipe(
        map((responses: (T | SyncData<T> | HttpErrorResponse)[]): SyncResponse<T> => {
          this.clearSyncFlagByType(docType);

          const errors: (HttpErrorResponse | Error)[] = [];
          const successes: T[] = [];

          responses.forEach((response: T | HttpErrorResponse): void => {
            if (response instanceof HttpErrorResponse || response instanceof Error) {
              errors.push(response);
            } else {
              successes.push(response);
            }
          });

          return {
            successes: successes,
            errors: this.processSyncErrors(errors)
          };
        })
      );
   }

  /**
   * Update stored sync flags
   *
   * @params: none
   * @return: none
   */
  updateStorage(): void {
    this.storageService.setSyncFlags(this.syncFlags)
      .subscribe(
        (): void => console.log('Stored sync flags'),
        (error: string): void => console.log(`Sync flag store error: ${error}`)
      );
  }

}
