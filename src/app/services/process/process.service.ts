/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, concat, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, mergeMap, take, tap } from 'rxjs/operators';

/* Constants imports */
import { API_VERSION, BASE_URL } from '../../shared/constants';

/* Interface imports */
import { Alert, Batch, BatchAnnotations, BatchContext, BatchProcess, CalendarMetadata, CalendarProcess, HopsSchedule, PrimaryValues, Process, RecipeMaster, RecipeVariant, SelectedUnits, SyncData, SyncError, SyncMetadata, SyncRequests, SyncResponse, TimerProcess, User } from '../../shared/interfaces';

/* Type guard imports */
import { AlertGuardMetadata, BatchAnnotationsGuardMetadata, BatchContextGuardMetadata, BatchGuardMetadata, BatchProcessGuardMetadata, PrimaryValuesGuardMetadata } from '../../shared/type-guard-metadata';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Service imports */
import { CalculationsService } from '../calculations/calculations.service';
import { ConnectionService } from '../connection/connection.service';
import { ErrorReportingService } from '../error-reporting/error-reporting.service';
import { EventService } from '../event/event.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { IdService } from '../id/id.service';
import { LibraryService } from '../library/library.service';
import { PreferencesService } from '../preferences/preferences.service';
import { RecipeService } from '../recipe/recipe.service';
import { StorageService } from '../storage/storage.service';
import { SyncService } from '../sync/sync.service';
import { ToastService } from '../toast/toast.service';
import { TypeGuardService } from '../type-guard/type-guard.service';
import { UserService } from '../user/user.service';
import { UtilityService } from '../utility/utility.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  activeBatchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
  archiveBatchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
  syncArchiveRoute: string = '';
  syncBaseRoute: string = 'process/batch';
  syncErrors: SyncError[] = [];

  constructor(
    public calculator: CalculationsService,
    public connectionService: ConnectionService,
    public errorReporter: ErrorReportingService,
    public event: EventService,
    public http: HttpClient,
    public httpError: HttpErrorService,
    public idService: IdService,
    public libraryService: LibraryService,
    public preferenceService: PreferencesService,
    public recipeService: RecipeService,
    public storageService: StorageService,
    public syncService: SyncService,
    public toastService: ToastService,
    public typeGuard: TypeGuardService,
    public userService: UserService,
    public utilService: UtilityService
  ) {
    this.syncArchiveRoute = `${this.syncBaseRoute}/archive`;
    this.registerEvents();
  }

  /***** Initializations *****/

  /**
   * Fetch active and archive batches from server and populate memory
   *
   * @param: none
   * @return: observable success requires no additional actions, using for error handling
   */
  initFromServer(): void {
    concat(
      this.syncOnConnection(true),
      this.http.get<{ activeBatches: Batch[], archiveBatches: Batch[] }>(
        `${BASE_URL}/${API_VERSION}/process/batch`
      )
      .pipe(
        tap(
          (batchListResponse: { activeBatches: Batch[], archiveBatches: Batch[] }): void => {
            console.log('batches from server', batchListResponse);

            this.mapBatchArrayToSubjectArray(true, batchListResponse.activeBatches);
            this.mapBatchArrayToSubjectArray(false, batchListResponse.archiveBatches);

            this.updateBatchStorage(true);
            this.updateBatchStorage(false);
          }
        ),
        catchError(this.errorReporter.handleGenericCatchError())
      )
    )
    .pipe(finalize(() => this.event.emit('init-inventory')))
    .subscribe(
      (): void => {},
      (error: any): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Load active and archive batches from storage
   *
   * @param: none
   * @return: none
   */
  initFromStorage(): void {
    // Get active batches from storage, do not overwrite if batches from server
    this.storageService.getBatches(true)
      .subscribe(
        (activeBatchList: Batch[]): void => {
          console.log('active batches from storage');
          if (this.activeBatchList$.value.length === 0) {
            this.mapBatchArrayToSubjectArray(true, activeBatchList);
          }
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );

    // Get archive batches from storage, do not overwrite if batches from server
    this.storageService.getBatches(false)
      .subscribe(
        (archiveBatchList: Batch[]): void => {
          console.log('archived batches from storage');
          if (this.archiveBatchList$.value.length === 0) {
            this.mapBatchArrayToSubjectArray(false, archiveBatchList);
          }
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Get active and archived batches
   *
   * @param: none
   * @return: none
   */
  initializeBatchLists(): void {
    console.log('init batches');
    this.initFromStorage();

    if (this.canSendRequest()) {
      this.initFromServer();
    } else {
      this.event.emit('init-inventory');
    }
  }

  /**
   * Set up event listeners
   *
   * @param: none
   * @return: none
   */
  registerEvents(): void {
    this.event.register('init-batches').subscribe((): void => this.initializeBatchLists());
    this.event.register('clear-data').subscribe((): void => this.clearAllBatchLists());
    this.event.register('sync-batches-on-signup').subscribe((): void => this.syncOnSignup());
    this.event.register('connected').subscribe((): void => this.syncOnReconnect());
  }

  /***** End Initializations *****/


  /***** API access methods *****/

  /**
   * Complete a batch by marking it as archived
   *
   * @param: batchId - batch id to update; batch must have server id to update database
   * @return: observable of ended batch
   */
  endBatchById(batchId: string): Observable<Batch> {
    const batch$: BehaviorSubject<Batch> = this.getBatchById(batchId);
    if (!batch$) {
      const message: string = 'An error occurring trying to end a batch: batch not found';
      const additionalMessage: string = `Active batch with id ${batchId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }
    const batch: Batch = batch$.value;

    batch.isArchived = true;

    return this.updateBatch(batch)
      .pipe(
        mergeMap((): Observable<Batch> => this.archiveActiveBatch(batchId)),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Start a new batch process and add new batch to active list
   *
   * @param: userId - client user's id
   * @param: recipeMasterId - recipe master id that contains the recipe
   * @param: recipeVariantId - recipe variant id to base batch on
   * @return: observable of new batch
   */
  startNewBatch(userId: string, recipeMasterId: string, recipeVariantId: string): Observable<Batch> {
    return this.generateBatchFromRecipe(userId, recipeMasterId, recipeVariantId)
      .pipe(
        mergeMap((newBatch: Batch) => {
          if (!newBatch) {
            const message: string = 'An error occurring trying to start a batch: batch generation failed';
            const additionalMessage: string = `New batch could not be generated with the following ids: user - ${userId}, recipeMaster - ${recipeMasterId}, recipeVariant - ${recipeVariantId}`;
            return throwError(this.getMissingError(message, additionalMessage));
          }

          if (this.canSendRequest()) {
            this.requestInBackground('post', newBatch);
          } else {
            this.addSyncFlag('create', newBatch.cid);
          }

          return this.addBatchToActiveList(newBatch);
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Update a batch
   *
   * @param: updatedBatch - batch with new values
   * @param: isActive - true for active batch, false for archive batch; defaults to true
   * @return: Observable of updated batch
   */
  updateBatch(updatedBatch: Batch, isActive: boolean = true): Observable<Batch> {
    const batch$: BehaviorSubject<Batch> = this.getBatchById(this.idService.getId(updatedBatch));
    if (!batch$) {
      const message: string = 'An error occurring trying to update a batch: batch not found';
      const additionalMessage: string = `Batch with id ${updatedBatch.cid} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    this.checkTypeSafety(updatedBatch);

    batch$.next(updatedBatch);
    this.emitBatchListUpdate(isActive);
    this.updateBatchStorage(isActive);

    if (this.canSendRequest([updatedBatch._id])) {
      this.requestInBackground('patch', updatedBatch);
    } else {
      this.addSyncFlag('update', this.idService.getId(updatedBatch));
    }

    return of(updatedBatch);
  }

  /**
   * Update a batch's measured values in annotations
   *
   * @param: batchId - id of the batch to update
   * @param: update - primary values to apply to batch
   * @param: isActive - true for active batch, false for archive batch
   * @return: observable of updated batch
   */
  updateMeasuredValues(batchId: string, update: PrimaryValues, isActive: boolean): Observable<Batch> {
    try {
      const batch$: BehaviorSubject<Batch> = this.getBatchById(batchId);
      const batch: Batch = batch$.value;
      update.ABV = this.calculator.getABV(update.originalGravity, update.finalGravity);
      update.IBU = this.calculator.calculateTotalIBU(
        batch.contextInfo.hops,
        update.originalGravity,
        update.batchVolume,
        batch.contextInfo.boilVolume
      );
      update.SRM = this.calculator.calculateTotalSRM(
        batch.contextInfo.grains,
        update.batchVolume
      );
      batch.annotations.measuredValues = update;
      return this.updateBatch(batch, isActive);
    } catch (error) {
      console.log('Update measured values error', error);
      return this.errorReporter.handleGenericCatchError()(error);
    }
  }

  /**
   * Update individual batch step
   *
   * @param: batchId - batch id to update
   * @param: stepUpdate - step update object to apply
   * @return: observable of updated batch
   */
  updateCalendarStep(batchId: string, calendarUpdate: CalendarMetadata): Observable<Batch> {
    try {
      const batch$: BehaviorSubject<Batch> = this.getBatchById(batchId);
      const batch: Batch = batch$.value;
      const processIndex: number = batch.process.schedule.findIndex((step: Process) => {
        return this.idService.hasId(step, calendarUpdate.id);
      });
      batch.process.alerts = batch.process.alerts.concat(calendarUpdate.alerts);
      const calendarProcess: CalendarProcess = <CalendarProcess>batch.process.schedule[processIndex];
      calendarProcess.startDatetime = calendarUpdate.startDatetime;

      return this.updateBatch(batch);
    } catch (error) {
      const userMessage: string = 'An error occurring trying to update batch step';
      return throwError(this.getMissingError(error.message, userMessage));
    }
  }

  /***** End API access methods *****/


  /***** Background Server Updates *****/

  /**
   * Configure a background request while defining which error handling method to use
   *
   * @param: syncMethod - the http method to apply
   * @param: shouldResolveError - true if error should return the error response as an observable
   * or false if error should be handled as an error
   * @param: batch - the batch to use in request
   * @return: observable of batch or HttpErrorResponse
   */
  configureBackgroundRequest(
    syncMethod: string,
    shouldResolveError: boolean,
    batch: Batch
  ): Observable<Batch | HttpErrorResponse> {
    return this.getBackgroundRequest(syncMethod, batch)
      .pipe(
        catchError(this.errorReporter.handleResolvableCatchError<HttpErrorResponse>(shouldResolveError))
      );
  }

  /**
   * Construct a server background request
   *
   * @param: syncMethod - the http method: 'post' and 'patch' are valid
   * @param: batch - the batch to base the request body
   * @return: observable of server request
   */
  getBackgroundRequest(syncMethod: string, batch: Batch): Observable<Batch> {
    let route: string = `${BASE_URL}/${API_VERSION}/process/`;
    if (syncMethod === 'post') {
      route += `user/${batch.owner}/master/${batch.recipeMasterId}/variant/${batch.recipeVariantId}`;
      return this.http.post<Batch>(route, batch);
    } else if (syncMethod === 'patch') {
      route += `batch/${batch._id}`;
      return this.http.patch<Batch>(route, batch);
    } else {
      const message: string = `Invalid http method: ${syncMethod}`;
      return throwError(
        new CustomError('HttpRequestError', message, this.errorReporter.highSeverity, message)
      );
    }
  }

  /**
   * Update server in background
   *
   * @param: syncMethod - the http method to apply
   * @param: batch - the batch to base the request body
   * @return: none
   */
  requestInBackground(syncMethod: string, batch: Batch): void {
    let syncRequest: Observable<Batch>;

    if (syncMethod === 'post' || syncMethod === 'patch') {
      syncRequest = this.getBackgroundRequest(syncMethod, batch);
    } else {
      const message: string = `Unknown sync type: ${syncMethod}`;
      syncRequest = throwError(
        new CustomError('SyncError', message, this.errorReporter.highSeverity, message)
      );
    }

    syncRequest
      .pipe(
        tap((batchResponse: Batch): void => {
          const batch$: BehaviorSubject<Batch> = this.getBatchById(batchResponse.cid);
          if (!batch$) {
            const message: string = 'An error occurring trying to update batch after server sync: batch not found';
            const additionalMessage: string = `Batch with id ${batchResponse.cid} not found`;
            throw this.getMissingError(message, additionalMessage);
          } else {
            batch$.next(batchResponse);
            this.emitBatchListUpdate(true);
            this.emitBatchListUpdate(false);
            this.updateBatchStorage(true);
            this.updateBatchStorage(false);
          }
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      )
      .subscribe(
        (): void => console.log(`Batch: background ${syncMethod} request successful`),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Background Server Updates *****/


  /***** Sync methods *****/

  /**
   * Add a sync flag for a batch
   *
   * @param: method - options: 'create', 'update', or 'delete'
   * @param: docId - document id to apply sync
   * @return: none
   */
  addSyncFlag(method: string, docId: string): void {
    const syncFlag: SyncMetadata = {
      docId,
      method,
      docType: 'batch'
    };

    this.syncService.addSyncFlag(syncFlag);
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
   * @param: none
   * @return: configured sync requests object
   */
  generateSyncRequests(): SyncRequests<Batch> {
    const errors: SyncError[] = [];
    const requests: Observable<HttpErrorResponse | Batch | SyncData<Batch>>[] = [];

    this.syncService.getSyncFlagsByType('batch')
      .forEach((syncFlag: SyncMetadata): void => {
        const batch$: BehaviorSubject<Batch> = this.getBatchById(syncFlag.docId);

        if (batch$ === undefined) {
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
          const recipeMaster$: BehaviorSubject<RecipeMaster>
            = this.recipeService.getRecipeMasterById(batch.recipeMasterId);

          if (recipeMaster$ === undefined || this.idService.hasDefaultIdType(recipeMaster$.value._id)) {
            const errMsg: string = 'Sync error: Cannot get batch owner\'s id';
            errors.push(this.syncService.constructSyncError(errMsg));
            return;
          }
          batch.recipeMasterId = recipeMaster$.value._id;
          const variantId: string = recipeMaster$.value.variants
            .find((variant: RecipeVariant): boolean => this.idService.hasId(variant, batch.recipeVariantId))
            ._id;
          batch.recipeVariantId = variantId || batch.recipeVariantId;
        }

        if (syncFlag.method === 'update' && this.idService.isMissingServerId(batch._id)) {
          const errMsg: string = `Sync error: batch with id: ${batch.cid} is missing its server id`;
          errors.push(this.syncService.constructSyncError(errMsg));
        } else if (syncFlag.method === 'create') {
          batch['forSync'] = true;
          requests.push(this.configureBackgroundRequest('post', true, batch));
        } else if (syncFlag.method === 'update' && !this.idService.isMissingServerId(batch._id)) {
          requests.push(this.configureBackgroundRequest('patch', true, batch));
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
   * @return: none
   */
  processSyncSuccess(syncData: (Batch | SyncData<Batch>)[]): void {
    syncData.forEach((_syncData: Batch | SyncData<Batch>): void => {
      if (_syncData['isDeleted'] === undefined) {
        const batch$: BehaviorSubject<Batch> = this.getBatchById((<Batch>_syncData).cid);

        if (batch$ === undefined) {
          this.syncErrors.push({
            errCode: -1,
            message: `Sync error: batch with id: '${(<Batch>_syncData).cid}' not found`
          });
        } else {
          this.checkTypeSafety(_syncData);
          batch$.next(<Batch>_syncData);
        }
      }
    });

    this.emitBatchListUpdate(true);
    this.emitBatchListUpdate(false);
  }

  /**
   * Process all sync flags on a connection event
   *
   * @param: onLogin - true if calling at login, false on reconnect
   * @return: none
   */
  syncOnConnection(onLogin: boolean): Observable<boolean> {
    // Ignore reconnects if not logged in
    if (!onLogin && !this.userService.isLoggedIn()) {
      return of(false);
    }

    const syncRequests: SyncRequests<Batch> = this.generateSyncRequests();
    const errors: SyncError[] = syncRequests.syncErrors;
    const requests: Observable<HttpErrorResponse | Batch | SyncData<Batch>>[] = syncRequests.syncRequests;

    return this.syncService.sync('batch', requests)
      .pipe(
        map((responses: SyncResponse<Batch>): boolean => {
          if (!onLogin) {
            this.processSyncSuccess(<(Batch | SyncData<Batch>)[]>(responses.successes));
            this.updateBatchStorage(true);
            this.updateBatchStorage(false);
          }
          this.syncErrors = responses.errors.concat(errors);
          return true;
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Network reconnect event handler
   *
   * @param: none
   * @param: none
   */
  syncOnReconnect(): void {
    this.syncOnConnection(false)
      .subscribe(
        (): void => console.log('batch sync on reconnect complete'),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Post all stored batches to server
   *
   * @param: none
   * @return: none
   */
  syncOnSignup(): void {
    console.log('batch on signup');
    const requests: Observable<HttpErrorResponse | Batch>[] = [];

    const batchList: BehaviorSubject<Batch>[] = this.getAllBatchesList();

    // TODO: extract to own method(?)
    batchList.forEach((batch$: BehaviorSubject<Batch>): void => {
      const recipe$: BehaviorSubject<RecipeMaster> = this.recipeService
        .getRecipeMasterById(batch$.value.recipeMasterId);

      if (!recipe$ || this.idService.isMissingServerId(recipe$.value._id)) {
        const message: string = `Recipe with id ${batch$.value.recipeMasterId} not found`;
        requests.push(
          throwError(new CustomError('SyncError', message, this.errorReporter.highSeverity, message))
        );
        return;
      }

      const user$: BehaviorSubject<User> = this.userService.getUser();
      if (!user$ || !user$.value._id) {
        const message: string = 'User server id not found';
        requests.push(
          throwError(new CustomError('SyncError', message, this.errorReporter.highSeverity, message))
        );
        return;
      }
      const user: User = user$.value;

      const payload: Batch = batch$.value;
      payload.owner = user._id;
      payload['recipeMasterId'] = recipe$.value._id;
      payload['forSync'] = true;

      requests.push(this.configureBackgroundRequest('post', false, payload));
    });

    this.syncService.sync<Batch | HttpErrorResponse>('batch', requests)
      .pipe(
        finalize(() => this.event.emit('sync-inventory-on-signup')),
        map((responses: SyncResponse<Batch>): boolean => {
          this.processSyncSuccess(<(Batch | SyncData<Batch>)[]>(responses.successes));
          this.syncErrors = responses.errors;
          this.updateBatchStorage(true);
          return true;
        })
      )
      .subscribe(
        (): void => {},
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Sync methods *****/


  /***** Utility methods *****/

  /**
   * Add a new batch to the list of active batches
   *
   * @param: newBatch - the new batch to convert to a subject and add to list
   * @return: Observable of the new batch
   */
  addBatchToActiveList(newBatch: Batch): Observable<Batch> {
    const batchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = this.getBatchList(true);
    const batchList: BehaviorSubject<Batch>[] = batchList$.value;

    batchList.push(new BehaviorSubject<Batch>(newBatch));
    batchList$.next(batchList);
    this.updateBatchStorage(true);
    return of(newBatch);
  }

  /**
   * Change an active batch to an archive batch; update active/archive lists
   *
   * @param: batchId - batch id to convert
   * @return: none
   */
  archiveActiveBatch(batchId: string): Observable<Batch> {
    const batch$: BehaviorSubject<Batch> = this.getBatchById(batchId);

    if (!batch$) {
      const message: string = 'An error occurring trying to archive an active batch: missing batch';
      const additionalMessage: string = `Batch with id ${batchId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    const batch: Batch = batch$.value;
    batch.isArchived = true;
    batch$.next(batch);

    const archiveList$: BehaviorSubject<BehaviorSubject<Batch>[]> = this.getBatchList(false);
    const archiveList: BehaviorSubject<Batch>[] = archiveList$.value;

    archiveList.push(batch$);
    archiveList$.next(archiveList);

    this.updateBatchStorage(false);

    return this.removeBatchFromList(true, batchId);
  }

  /**
   * Check if able to send an http request
   *
   * @param: [ids] - optional array of ids to check
   * @return: true if ids are valid, device is connected to network, and user logged in
   */
  canSendRequest(ids?: string[]): boolean {
    let idsOk: boolean = !ids;
    if (ids && ids.length) {
      idsOk = ids.every((id: string): boolean => id && !this.idService.hasDefaultIdType(id));
    }

    return this.connectionService.isConnected() && this.userService.isLoggedIn() && idsOk;
  }

  /**
   * Clear active or archive list
   *
   * @param: isActive - true for active batch list, false for archive batch list
   * @return: none
   */
  clearBatchList(isActive: boolean): void {
    const list$: BehaviorSubject<BehaviorSubject<Batch>[]> = this.getBatchList(isActive);

    list$.value.forEach((batch$: BehaviorSubject<Batch>): void => batch$.complete());
    list$.next([]);

    this.storageService.removeBatches(isActive);
  }

  /**
   * Clear all active and archive batches
   *
   * @param: none
   * @return: none
   */
  clearAllBatchLists(): void {
    this.clearBatchList(true);
    this.clearBatchList(false);
  }

  /**
   * Emit a batch list change
   *
   * @param: isActive - true if active batch list should be updated; false for archive
   * @return: none
   */
  emitBatchListUpdate(isActive: boolean): void {
    const batchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = this.getBatchList(isActive);
    batchList$.next(batchList$.value);
  }

  /**
   * Create a batch using a recipe process schedule as template
   *
   * @param: userId - the user's id
   * @param: masterId - the recipe's master id
   * @param: variantId - the recipe variant id from which to copy the schedule
   * @return: Observable of new batch
   */
  generateBatchFromRecipe(userId: string, masterId: string, variantId: string): Observable<Batch> {
    const recipeMaster$: BehaviorSubject<RecipeMaster> = this.recipeService
      .getRecipeMasterById(masterId);

    if (!recipeMaster$) {
      const message: string = 'An error occurring trying to generate batch from recipe: missing recipe';
      const additionalMessage: string = `Recipe master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    return recipeMaster$
      .pipe(
        take(1),
        map((recipeMaster: RecipeMaster): Batch => {
          const variant = recipeMaster.variants
            .find((_variant: RecipeVariant): boolean => {
              return this.idService.hasId(_variant, variantId);
            });

          if (!variant) {
            const message: string = 'An error occurring trying to generate batch from recipe: missing recipe';
            const additionalMessage: string = `Recipe master with id ${masterId} was found, but variant with id ${variantId} not found`;
            throw this.getMissingError(message, additionalMessage);
          }

          const newBatch: Batch = {
            cid: this.idService.getNewId(),
            createdAt: (new Date()).toISOString(),
            owner: userId,
            recipeMasterId: this.idService.getId(recipeMaster),
            recipeVariantId: this.idService.getId(variant),
            isArchived: false,
            annotations: {
              styleId: recipeMaster.style._id,
              targetValues: {
                efficiency: variant.efficiency,
                originalGravity: variant.originalGravity,
                finalGravity: variant.finalGravity,
                batchVolume: variant.batchVolume,
                ABV: variant.ABV,
                IBU: variant.IBU,
                SRM: variant.SRM
              },
              measuredValues: {
                efficiency: -1,
                originalGravity: -1,
                finalGravity: -1,
                batchVolume: -1,
                ABV: -1,
                IBU: -1,
                SRM: -1
              },
              notes: []
            },
            process: {
              currentStep: 0,
              alerts: [],
              schedule: Array.from(
                variant.processSchedule,
                (process: Process): Process => {
                  const copy: object = { cid: this.idService.getNewId() };
                  for (const key in process) {
                    if (key !== '_id') {
                      copy[key] = process[key];
                    }
                  }
                  return <Process>copy;
                }
              )
            },
            contextInfo: {
              recipeMasterName: recipeMaster.name,
              recipeVariantName: variant.variantName,
              recipeImage: recipeMaster.labelImage,
              batchVolume: variant.batchVolume,
              boilVolume: variant.boilVolume,
              grains: this.utilService.clone(variant.grains),
              hops: this.utilService.clone(variant.hops),
              yeast: this.utilService.clone(variant.yeast),
              otherIngredients: this.utilService.clone(variant.otherIngredients)
            }
          };
          console.log('new batch', newBatch);
          return newBatch;
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Get a combined list of active and archive batches
   *
   * @param: none
   * @return: array of batch behavior subjects
   */
  getAllBatchesList(): BehaviorSubject<Batch>[] {
    return this.getBatchList(true).value.concat(this.getBatchList(false).value);
  }

  /**
   * Search both active and archive lists and get a batch by its id
   *
   * @param: batchId - id to search
   * @return: Batch behavior subject or undefined if not found
   */
  getBatchById(batchId: string): BehaviorSubject<Batch> {
    const active$: BehaviorSubject<Batch> = this.getBatchList(true).value
      .find((batch$: BehaviorSubject<Batch>): boolean => this.idService.hasId(batch$.value, batchId));

    if (active$ !== undefined) {
      return active$;
    }

    return this.getBatchList(false).value
      .find((batch$: BehaviorSubject<Batch>): boolean => {
        return this.idService.hasId(batch$.value, batchId);
      });
  }

  /**
   * Get active or archive batch list subject
   *
   * @param: isActive - true for active batch, false for archive batch
   * @return: subject of array of batch subjects
   */
  getBatchList(isActive: boolean): BehaviorSubject<BehaviorSubject<Batch>[]> {
    return isActive ? this.activeBatchList$ : this.archiveBatchList$;
  }

  /**
   * Get a custom error for a missing batch
   *
   * @param: baseMessage - user accessible message
   * @param: additionalMessage - additional error message that is not shown to user
   * @return: custom error
   */
  getMissingError(baseMessage: string, additionalMessage: string = ''): Error {
    return new CustomError(
      'BatchError',
      `${baseMessage} ${additionalMessage}`,
      this.errorReporter.highSeverity,
      baseMessage
    );
  }

  /**
   * Convert an array of active or archive batches into a BehaviorSubject of an
   * array of BehaviorSubjects of the respective batches; Combine with any
   * batch subjects already in the list that have an outstanding sync flag
   *
   * @param: isActive - true for active batches, false for archive batches
   * @param: batchList - array of batches
   *
   * @return: none
   */
  mapBatchArrayToSubjectArray(isActive: boolean, batchList: Batch[]): void {
    this.getBatchList(isActive).next(this.utilService.toSubjectArray<Batch>(batchList));
  }

  /**
   * Remove a batch from a batch list
   *
   * @param: isActive - true for active batch, false for archive batch
   * @param: batchId - batch id to remove from list
   * @return: Observable of null, using for error throw/handling
   */
  removeBatchFromList(isActive: boolean, batchId: string): Observable<Batch> {
    const batchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = this.getBatchList(isActive);
    const batchList: BehaviorSubject<Batch>[] = batchList$.value;

    const indexToRemove: number = this.idService.getIndexById(
      batchId,
      this.utilService.getArrayFromSubjects(batchList)
    );

    if (indexToRemove === -1) {
      const message: string = 'An error occurring trying to remove batch from list: missing batch';
      const additionalMessage: string = `Batch with id ${batchId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    batchList[indexToRemove].complete();
    batchList.splice(indexToRemove, 1);
    batchList$.next(batchList);
    this.updateBatchStorage(isActive);

    return of(null);
  }

  /***** End utility methods *****/


  /***** Component helper methods *****/

  /**
   * Generate timer process steps for boil step; update duration on form update
   *
   * @param: processSchedule - a recipe variant's process schedule
   * @param: boilDuration - boil duration time in minutes
   * @param: hopsSchedule - a recipe variant's hops schedue
   * @return: none
   */
  autoSetBoilDuration(
    processSchedule: Process[],
    boilDuration: number,
    hopsSchedule: HopsSchedule[]
  ): Process[] {
    const boilIndex: number = this.getProcessIndex(processSchedule, 'name', 'Boil');

    if (boilIndex === -1) {
      processSchedule.push(<TimerProcess>{
        cid: this.idService.getNewId(),
        type: 'timer',
        name: 'Boil',
        description: 'Boil wort',
        duration: boilDuration,
        concurrent: false,
        splitInterval: 1
      });
    } else {
      const boilStep: TimerProcess = <TimerProcess>processSchedule[boilIndex];
      if (boilStep.duration !== boilDuration) {
        boilStep.duration = boilDuration;
        return this.autoSetHopsAdditions(processSchedule, boilDuration, hopsSchedule);
      }
    }
    return processSchedule;
  }

  /**
   * Generate timer process steps for each hops addition (that is not a dry-hop)
   *
   * @param: processSchedule - a recipe variant's process schedule
   * @param: boilDuration - boil duration time in minutes
   * @param: hopsSchedule - a recipe variant's hops schedue
   * @return: none
   */
  autoSetHopsAdditions(
    processSchedule: Process[],
    boilDuration: number,
    hopsSchedule: HopsSchedule[]
  ): Process[] {
    const currentBoilIndex: number = this.getProcessIndex(processSchedule, 'name', 'Boil');

    if (currentBoilIndex !== -1) {
      // remove existing hops timers
      const preFilteredProcessSchedule: Process[] = processSchedule
        .filter((process: Process): boolean => {
          return !process.name.match(/^(Add).*(hops)$/);
        });
      // get steps before first hops addition
      const updatedBoilIndex: number = this.getProcessIndex(preFilteredProcessSchedule, 'name', 'Boil');
      const preAdditionSchedule: Process[] = preFilteredProcessSchedule.splice(0, updatedBoilIndex);
      // get new hops addition process steps
      const hopsProcesses: Process[] = this.generateHopsProcesses(hopsSchedule, boilDuration);
      // recombine process schedule
      const newProcessSchedule: Process[] = preAdditionSchedule
        .concat(hopsProcesses)
        .concat(preFilteredProcessSchedule);

      // set boil step timer as concurrent is timers were added
      const finalBoilIndex: number = updatedBoilIndex + hopsProcesses.length;
      (<TimerProcess>newProcessSchedule[finalBoilIndex]).concurrent = !!hopsProcesses.length;
      return newProcessSchedule;
    }
    return processSchedule;
  }

  /**
   * Generate timer process steps for mash step; update duration on form update
   *
   * @param: processSchedule - a recipe variant's process schedule
   * @param: mashDuration - mash duration time in minutes
   * @return: none
   */
  autoSetMashDuration(processSchedule: Process[], mashDuration: number): void {
    const mashIndex: number = this.getProcessIndex(processSchedule, 'name', 'Mash');

    if (mashIndex === -1) {
      processSchedule.push(<TimerProcess>{
        cid: this.idService.getNewId(),
        type: 'timer',
        name: 'Mash',
        description: 'Mash grains',
        duration: mashDuration,
        concurrent: false,
        splitInterval: 1
      });
    } else {
      (<TimerProcess>processSchedule[mashIndex]).duration = mashDuration;
    }
  }

  /**
   * Format a hops addition step description
   *
   * @param: hops - a recipe variant's hops schedule
   * @return: a description for a new hops process timer step
   */
  formatHopsDescription(hops: HopsSchedule): string {
    const units: SelectedUnits = this.preferenceService.getSelectedUnits();
    let hopsQuantity: number = hops.quantity;
    if (this.calculator.requiresConversion('weightSmall', units)) {
      hopsQuantity = this.calculator.convertWeight(hops.quantity, false, false);
    }
    const twoPlaces: number = 2;
    hopsQuantity = this.utilService.roundToDecimalPlace(hopsQuantity, twoPlaces);
    return `Hops addition: ${hopsQuantity}${units.weightSmall.shortName}`;
  }

  /**
   * Create an array of concurrent timer processes for each hops addition
   *
   * @param: hopsSchedule - a recipe variant's hops schedule
   * @param: boilDuration - a recipe variant's set boil duration
   * @return: array of concurrent timer processes
   */
  generateHopsProcesses(hopsSchedule: HopsSchedule[], boilDuration: number): Process[] {
    return hopsSchedule
      .filter((hops: HopsSchedule): boolean => !hops.dryHop)
      .sort((h1: HopsSchedule, h2: HopsSchedule): number => h2.duration - h1.duration)
      .map((hopsAddition: HopsSchedule): TimerProcess => {
        return {
          cid: this.idService.getNewId(),
          type: 'timer',
          name: `Add ${hopsAddition.hopsType.name} hops`,
          concurrent: true,
          description: this.formatHopsDescription(hopsAddition),
          duration: boilDuration - hopsAddition.duration,
          splitInterval: 1
        };
      });
  }

  /**
   * Get a process step index from a given process schedule
   *
   * @param: processSchedule - the process schedule to search
   * @param: searchField - the process attribute name to comare with search term
   * @param: searchTerm - the search term to match against a given search field value
   * @return: the index number of the found process or -1 if not found
   */
  getProcessIndex(processSchedule: Process[], searchField: string, searchTerm: string): number {
    return processSchedule.findIndex((process: Process): boolean => process[searchField] === searchTerm);
  }

  /***** End Component helper methods *****/


  /***** Storage methods *****/

  /**
   * Update active or archive batch storage
   *
   * @param: isActive - true for active batches, false for archive batches
   * @return: none
   */
  updateBatchStorage(isActive: boolean): void {
    const batchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = this.getBatchList(isActive);

    this.storageService.setBatches(
      isActive,
      batchList$.value.map((batch$: BehaviorSubject<Batch>): Batch => batch$.value)
    )
    .subscribe(
      (): void => console.log(`stored ${ isActive ? 'active' : 'archive' } batches`),
      (error: any): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /***** End storage methods *****/


  /***** Type Guard *****/

  /**
   * Runtime check given Batch for type correctness; throws error on check failed
   *
   * @param: batch - the batch to check
   * @return: none
   */
  checkTypeSafety(batch: any): void {
    if (!this.isSafeBatch(batch)) {
      throw this.getUnsafeError(batch);
    }
  }

  /**
   * Get a custom error on unsafe batch type
   *
   * @param: thrownFor - the original error thrown
   * @return: new custom error
   */
  getUnsafeError(thrownFor: any): Error {
    return new CustomError(
      'BatchError',
      `Batch is invalid: got ${JSON.stringify(thrownFor, null, 2)}`,
      this.errorReporter.highSeverity,
      'An internal error occurred: invalid batch'
    );
  }

  /**
   * Check if given alerts are valid by correctly implementing the Alert interface
   *
   * @param: alerts - expects an array of Alerts at runtime
   * @return: true if all alerts correctly implement Alert interface
   */
  isSafeAlerts(alerts: Alert[]): boolean {
    return alerts.every((alert: Alert): boolean => {
      return this.typeGuard.hasValidProperties(alert, AlertGuardMetadata);
    });
  }

  /**
   * Check if given batch object is valid by correctly implementing the Batch interface
   *
   * @param: batch - expects a Batch at runtime
   * @return: true if given batch correctly implements Batch interface
   */
  isSafeBatch(batch: Batch): boolean {
    return (
      this.typeGuard.hasValidProperties(batch, BatchGuardMetadata)
      && this.isSafeBatchAnnotations(batch.annotations)
      && this.isSafeBatchContext(batch.contextInfo)
      && this.isSafeBatchProcess(batch.process)
    );
  }

  /**
   * Check if given batch annotations object is valid by correctly implementing the BatchAnnotations interface
   *
   * @param: annotations - expects a BatchAnnotations at runtime
   * @return: true if given annotations correctly implements BatchAnnotations interface
   */
  isSafeBatchAnnotations(annotations: BatchAnnotations): boolean {
    return (
      this.typeGuard.hasValidProperties(annotations, BatchAnnotationsGuardMetadata)
      && this.isSafePrimaryValues(annotations.targetValues)
      && this.isSafePrimaryValues(annotations.measuredValues)
    );
  }

  /**
   * Check if given batch context object is valid by correctly implementing the BatchContext interface
   *
   * @param: context - expects a BatchContext at runtime
   * @return: true if given context correctly implements BatchContext interface
   */
  isSafeBatchContext(context: BatchContext): boolean {
    return (
      this.typeGuard.hasValidProperties(context, BatchContextGuardMetadata)
      && this.recipeService.isSafeGrainBillCollection(context.grains)
      && this.recipeService.isSafeHopsScheduleCollection(context.hops)
      && this.recipeService.isSafeYeastBatchCollection(context.yeast)
      && this.recipeService.isSafeOtherIngredientsCollection(context.otherIngredients)
    );
  }

  /**
   * Check if given batch process object is valid by correctly implementing the BatchProcess interface
   *
   * @param: batchProcess - expects a BatchProcess at runtime
   * @return: true if given annotations correctly implements BatchProcess interface
   */
  isSafeBatchProcess(batchProcess: BatchProcess): boolean {
    return (
      this.typeGuard.hasValidProperties(batchProcess, BatchProcessGuardMetadata)
      && this.isSafeProcessSchedule(batchProcess.schedule)
      && this.isSafeAlerts(batchProcess.alerts)
    );
  }

  /**
   * Check if given primary values object is valid by correctly implementing the PrimaryValues interface
   *
   * @param: values - expects a PrimaryValues at runtime
   * @return: true if given primary values correctly implements PrimaryValues interface
   */
  isSafePrimaryValues(values: PrimaryValues): boolean {
    return this.typeGuard.hasValidProperties(values, PrimaryValuesGuardMetadata);
  }

  /**
   * Check if given process schedule array is valid by correctly implementing the Process interface
   * as well as the appropriate extended interface defined by the type property
   *
   * @param: schedule - expects array of Process objects at runtime
   * @return: true if all processes within schedule implements the Process interface as well as their
   * individual extended interface
   */
  isSafeProcessSchedule(schedule: Process[]): boolean {
    return this.recipeService.isSafeProcessSchedule(schedule);
  }

  /***** End Type Guard *****/

}
