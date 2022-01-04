/* Module imports */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/* Constants imports */
import { HIGH_SEVERITY } from '@shared/constants';

/* Interface imports */
import { Batch, RecipeMaster, RecipeVariant, SyncData, SyncError, SyncMetadata, SyncRequests, SyncResponse, User } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { IdService } from '@services/id/id.service';
import { ProcessHttpService } from '@services/process/http/process-http.service';
import { ProcessTypeGuardService } from '@services/process/type-guard/process-type-guard.service';
import { RecipeService } from '@services/recipe/recipe.service';
import { SyncService } from '@services/sync/sync.service';
import { UserService } from '@services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessSyncService {
  readonly syncBaseRoute: string = 'process/batch';
  syncArchiveRoute: string = '';
  syncErrors: SyncError[] = [];

  constructor(
    public errorReporter: ErrorReportingService,
    public idService: IdService,
    public processHttpService: ProcessHttpService,
    public processTypeGuardService: ProcessTypeGuardService,
    public recipeService: RecipeService,
    public syncService: SyncService,
    public userService: UserService
  ) { }

  /**
   * Add a sync flag for a batch
   *
   * @param: method - options: 'create', 'update', or 'delete'
   * @param: docId - document id to apply sync
   * @return: none
   */
  addSyncFlag(method: string, docId: string): void {
    this.syncService.addSyncFlag({ docId, method, docType: 'batch' });
  }

  /**
   * Convert an http request method name to a sync method name
   *
   * @param: requestMethod - the http request method name
   * @return: the sync method counterpart of request method
   */
  convertRequestMethodToSyncMethod(requestMethod: string): string {
    return this.syncService.convertRequestMethodToSyncMethod(requestMethod);
  }

  /**
   * Clear all sync errors
   *
   * @param: none
   * @return: none
   */
  dismissAllSyncErrors(): void {
    this.syncErrors = [];
  }

  /**
   * Clear a sync error at the given index
   *
   * @param: index - error array index
   * @return: none
   */
  dismissSyncError(index: number): void {
    this.syncErrors.splice(index, 1);
  }

  /**
   * Construct sync requests based on stored sync flags
   *
   * @param: batchList - current list of batch subject (active and archive)
   * @return: configured sync requests object
   */
  generateSyncRequests(batchList: BehaviorSubject<Batch>[]): SyncRequests<Batch> {
    const errors: SyncError[] = [];
    const requests: Observable<HttpErrorResponse | Batch | SyncData<Batch>>[] = [];

    this.syncService.getSyncFlagsByType('batch')
      .forEach((syncFlag: SyncMetadata): void => {
        const batch$: BehaviorSubject<Batch> = batchList
          .find((_batch$: BehaviorSubject<Batch>): boolean => {
            return this.idService.hasId(_batch$.value, syncFlag.docId);
          });
        if (!batch$) {
          const errMsg: string = `Sync error: Batch with id '${syncFlag.docId}' not found`;
          errors.push(this.syncService.constructSyncError(errMsg));
          return;
        }
        const batch: Batch = batch$.value;

        if (batch.owner === 'offline') {
          // TODO: extract to own method(?)
          const user$: BehaviorSubject<User> = this.userService.getUser();
          const user: User = user$.value;
          if (!user._id || (!user._id && user.cid !== 'offline')) {
            const errMsg: string = 'Error getting user id';
            errors.push(this.syncService.constructSyncError(errMsg));
            return;
          }
          batch.owner = user._id;
        }

        if (this.idService.hasDefaultIdType(batch.recipeMasterId)) {
          // TODO: extract to own method(?)
          const recipe$: BehaviorSubject<RecipeMaster> = this.recipeService.getRecipeMasterById(
            batch.recipeMasterId
          );

          if (recipe$ === undefined || this.idService.hasDefaultIdType(recipe$.value._id)) {
            const errMsg: string = 'Sync error: Cannot get batch owner\'s id';
            errors.push(this.syncService.constructSyncError(errMsg));
            return;
          }
          batch.recipeMasterId = recipe$.value._id;
          const variantId: string = recipe$.value.variants
            .find((variant: RecipeVariant): boolean => {
              return this.idService.hasId(variant, batch.recipeVariantId);
            })
            ._id;
          batch.recipeVariantId = variantId || batch.recipeVariantId;
        }

        if (syncFlag.method === 'update' && this.idService.isMissingServerId(batch._id)) {
          const errMsg: string = `Sync error: batch with id: ${batch.cid} is missing its server id`;
          errors.push(this.syncService.constructSyncError(errMsg));
        } else if (syncFlag.method === 'create') {
          batch['forSync'] = true;
          requests.push(this.processHttpService.configureBackgroundRequest('post', true, batch));
        } else if (syncFlag.method === 'update' && !this.idService.isMissingServerId(batch._id)) {
          requests.push(this.processHttpService.configureBackgroundRequest('patch', true, batch));
        } else {
          const errMsg: string = `Sync error: Unknown sync flag method '${syncFlag.method}'`;
          errors.push(this.syncService.constructSyncError(errMsg));
        }
      });

    return { syncRequests: requests, syncErrors: errors };
  }

  /**
   * Process sync successes to update in memory batches
   *
   * @param: syncedData - an array of successfully synced docs;
   * deleted docs contain isDeleted flag - no further actions required for deletions
   * @return: array of batch subjects with updated server data
   */
  processSyncSuccess(
    syncData: (Batch | SyncData<Batch>)[],
    batchList: BehaviorSubject<Batch>[]
  ): BehaviorSubject<Batch>[] {
    syncData.forEach((_syncData: Batch | SyncData<Batch>): void => {
      if (!_syncData.hasOwnProperty('isDeleted') || !_syncData['isDeleted']) {
        const batchIndex: number = batchList.findIndex((batch$: BehaviorSubject<Batch>): boolean => {
          return this.idService.hasId(batch$.value, (<Batch>_syncData).cid);
        });
        if (batchIndex === -1) {
          this.syncErrors.push({
            errCode: -1,
            message: `Sync error: batch with id: '${(<Batch>_syncData).cid}' not found`
          });
        } else {
          this.processTypeGuardService.checkTypeSafety(_syncData);
          batchList[batchIndex].next(<Batch>_syncData);
        }
      }
    });

    return batchList;
  }

  /**
   * Process all sync flags on a connection event
   *
   * @param: onLogin - true if calling at login, false on reconnect
   * @param: batchList - current list of batch subject (active and archive)
   * @return: observable of list of batch subjects that have been updated with server data
   */
  syncOnConnection(
    onLogin: boolean,
    batchList: BehaviorSubject<Batch>[]
  ): Observable<BehaviorSubject<Batch>[]> {
    // Ignore reconnects if not logged in
    if (!onLogin && !this.userService.isLoggedIn()) {
      return of(null);
    }

    const generatedRequests: SyncRequests<Batch> = this.generateSyncRequests(batchList);
    const errors: SyncError[] = generatedRequests.syncErrors;
    return this.syncService.sync('batch', generatedRequests.syncRequests)
      .pipe(
        map((responses: SyncResponse<Batch>): BehaviorSubject<Batch>[] => {
          this.syncErrors = responses.errors.concat(errors);
          if (!onLogin) {
            return this.processSyncSuccess(
              <(Batch | SyncData<Batch>)[]>(responses.successes),
              batchList
            );
          }
          return null;
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Post all stored batches to server
   *
   * @param: batchList - current list of batch subjects
   * @return: observable of list of batch subjects that have been updated with server data
   */
  syncOnSignup(batchList: BehaviorSubject<Batch>[]): Observable<BehaviorSubject<Batch>[]> {
    const requests: Observable<HttpErrorResponse | Batch>[] = [];
    // TODO: extract to own method(?)
    batchList.forEach((batch$: BehaviorSubject<Batch>): void => {
      const batch: Batch = batch$.value;
      const recipe$: BehaviorSubject<RecipeMaster> = this.recipeService.getRecipeMasterById(
        batch.recipeMasterId
      );

      if (!recipe$ || this.idService.isMissingServerId(recipe$.value._id)) {
        const message: string = `Recipe with id ${batch.recipeMasterId} not found`;
        requests.push(
          throwError(new CustomError('SyncError', message, HIGH_SEVERITY, message))
        );
        return;
      }

      const user$: BehaviorSubject<User> = this.userService.getUser();
      if (!user$ || !user$.value._id) {
        const message: string = 'User server id not found';
        requests.push(
          throwError(new CustomError('SyncError', message, HIGH_SEVERITY, message))
        );
        return;
      }
      const user: User = user$.value;

      const payload: Batch = batch;
      payload.owner = user._id;
      payload['recipeMasterId'] = recipe$.value._id;
      payload['forSync'] = true;

      requests.push(this.processHttpService.configureBackgroundRequest('post', false, payload));
    });

    return this.syncService.sync<Batch | HttpErrorResponse>('batch', requests)
      .pipe(
        map((responses: SyncResponse<Batch>): BehaviorSubject<Batch>[] => {
          this.syncErrors = responses.errors;
          return this.processSyncSuccess(
            <(Batch | SyncData<Batch>)[]>responses.successes,
            batchList
          );
        })
      );
  }
}
