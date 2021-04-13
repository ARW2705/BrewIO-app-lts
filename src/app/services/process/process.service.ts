/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concat, of, throwError } from 'rxjs';
import { catchError, finalize, map, mergeMap, take, tap } from 'rxjs/operators';

/* Constants imports */
import { API_VERSION } from '../../shared/constants/api-version';
import { BASE_URL } from '../../shared/constants/base-url';

/* Interface imports */
import { Batch } from '../../shared/interfaces/batch';
import { PrimaryValues } from '../../shared/interfaces/primary-values';
import { Process } from '../../shared/interfaces/process';
import { RecipeMaster } from '../../shared/interfaces/recipe-master';
import { RecipeVariant } from '../../shared/interfaces/recipe-variant';
import { SyncData, SyncError, SyncMetadata, SyncRequests, SyncResponse } from '../../shared/interfaces/sync';
import { User } from '../../shared/interfaces/user';

/* Utility function imports */
import { getArrayFromSubjects, toSubjectArray } from '../../shared/utility-functions/observable-helpers';
import { getId, getIndexById, hasDefaultIdType, hasId, isMissingServerId } from '../../shared/utility-functions/id-helpers';
import { clone } from '../../shared/utility-functions/clone';

/* Service imports */
import { CalculationsService } from '../calculations/calculations.service';
import { ClientIdService } from '../client-id/client-id.service';
import { ConnectionService } from '../connection/connection.service';
import { EventService } from '../event/event.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { RecipeService } from '../recipe/recipe.service';
import { StorageService } from '../storage/storage.service';
import { SyncService } from '../sync/sync.service';
import { ToastService } from '../toast/toast.service';
import { UserService } from '../user/user.service';


@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  syncBaseRoute: string = 'process/batch';
  syncErrors: SyncError[] = [];
  activeBatchList$: BehaviorSubject<BehaviorSubject<Batch>[]>
    = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
  archiveBatchList$: BehaviorSubject<BehaviorSubject<Batch>[]>
    = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
  syncArchiveRoute: string = `${this.syncBaseRoute}/archive`;

  constructor(
    public http: HttpClient,
    public calculationService: CalculationsService,
    public clientIdService: ClientIdService,
    public connectionService: ConnectionService,
    public event: EventService,
    public httpError: HttpErrorService,
    public recipeService: RecipeService,
    public storageService: StorageService,
    public syncService: SyncService,
    public toastService: ToastService,
    public userService: UserService,
  ) {
    this.registerEvents();
  }

  /***** Initializations *****/

  /**
   * Fetch active and archive batches from server and populate memory
   *
   * @params: none
   *
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
        catchError((error: HttpErrorResponse): Observable<never> => {
          return this.httpError.handleError(error);
        })
      )
    )
    .pipe(finalize(() => this.event.emit('init-inventory')))
    .subscribe(
      (): void => {},
      (error: string): void => console.log(`Initialization message: ${error}`)
    );
  }

  /**
   * Load active and archive batches from storage
   *
   * @params: none
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
        (error: string): void => console.log(`${error}: awaiting active batch data from server`)
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
        (error: string): void => console.log(`${error}: awaiting archive batch data from server`)
      );
  }

  /**
   * Get active and archived batches
   *
   * @params: none
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
   * @params: none
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
   * @params: batchId - batch id to update; batch must have server id to update database
   *
   * @return: observable of ended batch
   */
  endBatchById(batchId: string): Observable<Batch> {
    const batch$: BehaviorSubject<Batch> = this.getBatchById(batchId);
    if (!batch$) {
      return throwError(`End of batch error: batch with id ${batchId} not found`);
    }
    const batch: Batch = batch$.value;

    batch.isArchived = true;

    return this.updateBatch(batch)
      .pipe(mergeMap((): Observable<Batch> => this.archiveActiveBatch(batchId)));
  }

  /**
   * Start a new batch process and add new batch to active list
   *
   * @params: userId - client user's id
   * @params: recipeMasterId - recipe master id that contains the recipe
   * @params: recipeVariantId - recipe variant id to base batch on
   *
   * @return: observable of new batch
   */
  startNewBatch(userId: string, recipeMasterId: string, recipeVariantId: string): Observable<Batch> {
    return this.generateBatchFromRecipe(userId, recipeMasterId, recipeVariantId)
      .pipe(
        mergeMap((newBatch: Batch) => {
          if (!newBatch) {
            return throwError('Unable to generate new batch: missing recipe');
          }

          if (this.canSendRequest()) {
            this.requestInBackground('post', newBatch);
          } else {
            this.addSyncFlag('create', newBatch.cid);
          }

          return this.addBatchToActiveList(newBatch);
        })
      );
  }

  /**
   * Update a batch
   *
   * @params: updatedBatch - batch with new values
   * @params: isActive - true for active batch, false for archive batch; defaults to true
   *
   * @return: Observable of updated batch
   */
  updateBatch(updatedBatch: Batch, isActive: boolean = true): Observable<Batch> {
    const batch$: BehaviorSubject<Batch> = this.getBatchById(getId(updatedBatch));
    if (!batch$) {
      return throwError(`Update batch error: batch with id ${getId(updatedBatch)} not found`);
    }

    batch$.next(updatedBatch);
    this.emitBatchListUpdate(isActive);
    this.updateBatchStorage(isActive);

    if (this.canSendRequest([updatedBatch._id])) {
      this.requestInBackground('patch', updatedBatch);
    } else {
      this.addSyncFlag('update', getId(updatedBatch));
    }

    return of(updatedBatch);
  }

  /**
   * Update a batch's measured values in annotations
   *
   * @params: batchId - id of the batch to update
   * @params: update - primary values to apply to batch
   * @params: isActive - true for active batch, false for archive batch
   *
   * @return: observable of updated batch
   */
  updateMeasuredValues(batchId: string, update: PrimaryValues, isActive: boolean): Observable<Batch> {
    try {
      const batch$: BehaviorSubject<Batch> = this.getBatchById(batchId);
      const batch: Batch = batch$.value;

      update.ABV = this.calculationService.getABV(update.originalGravity, update.finalGravity);
      update.IBU = this.calculationService.calculateTotalIBU(
        batch.contextInfo.hops,
        update.originalGravity,
        update.batchVolume,
        batch.contextInfo.boilVolume
      );
      update.SRM = this.calculationService.calculateTotalSRM(
        batch.contextInfo.grains,
        update.batchVolume
      );

      batch.annotations.measuredValues = update;

      return this.updateBatch(batch, isActive);
    } catch (error) {
      console.log('Update measured values error', error);
      return throwError(error);
    }
  }

  /**
   * Update individual batch step
   *
   * @params: batchId - batch id to update
   * @params: stepUpdate - step update object to apply
   *
   * @return: observable of updated batch
   */
  updateStepById(batchId: string, stepUpdate: object): Observable<Batch> {
    const batch$: BehaviorSubject<Batch> = this.getBatchById(batchId);
    if (!batch$) {
      return throwError(`Active batch with id ${batchId} not found`);
    }
    const batch: Batch = batch$.value;

    if (!batch.owner) {
      return throwError('Active batch is missing an owner id');
    }

    if (!stepUpdate.hasOwnProperty('id')) {
      return throwError('Step update missing an id');
    }

    const stepIndex: number = batch.process.schedule
      .findIndex((step: Process) => hasId(step, stepUpdate['id']));

    if (stepIndex === -1) {
      return throwError(`Active batch missing step with id ${stepUpdate['id']}`);
    }

    batch.process.alerts = batch.process.alerts.concat(stepUpdate['update']['alerts']);
    batch.process.schedule[stepIndex]['startDatetime'] = stepUpdate['update']['startDatetime'];

    return this.updateBatch(batch);
  }

  /***** End API access methods *****/


  /***** Background Server Updates *****/

  /**
   * Configure a background request while defining which error handling method to use
   *
   * @params: syncMethod - the http method to apply
   * @params: shouldResolveError - true if error should return the error response as an observable
   * or false if error should be handled as an error
   * @params: batch - the batch to use in request
   *
   * @return: observable of batch or HttpErrorResponse
   */
  configureBackgroundRequest(
    syncMethod: string,
    shouldResolveError: boolean,
    batch: Batch
  ): Observable<Batch | HttpErrorResponse> {
    return this.getBackgroundRequest(syncMethod, batch)
      .pipe(catchError((error: HttpErrorResponse): Observable<HttpErrorResponse> => {
        if (shouldResolveError) {
          return of(error);
        }
        return this.httpError.handleError(error);
      }));
  }

  /**
   * Construct a server background request
   *
   * @params: syncMethod - the http method: 'post' and 'patch' are valid
   * @params: batch - the batch to base the request body
   *
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
      return throwError('Invalid http method');
    }
  }

  /**
   * Update server in background
   *
   * @params: syncMethod - the http method to apply
   * @params: batch - the batch to base the request body
   *
   * @return: none
   */
  requestInBackground(syncMethod: string, batch: Batch): void {
    let syncRequest: Observable<Batch>;

    if (syncMethod === 'post' || syncMethod === 'patch') {
      syncRequest = this.getBackgroundRequest(syncMethod, batch);
    } else {
      syncRequest = throwError('Unknown sync type');
    }

    syncRequest
      .pipe(
        tap((batchResponse: Batch): void => {
          const batch$: BehaviorSubject<Batch> = this.getBatchById(batchResponse.cid);
          if (!batch$) {
            this.toastService.presentErrorToast(`Batch with id ${batchResponse.cid} not found`);
          } else {
            batch$.next(batchResponse);
            this.emitBatchListUpdate(true);
            this.emitBatchListUpdate(false);
            this.updateBatchStorage(true);
            this.updateBatchStorage(false);
          }
        }),
        catchError((error: HttpErrorResponse): Observable<never> => {
          return this.httpError.handleError(error);
        })
      )
      .subscribe(
        (): void => console.log(`Batch: background ${syncMethod} request successful`),
        (error: string): void => {
          console.log(`Batch: background ${syncMethod} request error`, error);
          this.toastService.presentErrorToast('Batch: update failed to save to server');
        }
      );
  }

  /***** End Background Server Updates *****/


  /***** Sync methods *****/

  /**
   * Add a sync flag for a batch
   *
   * @params: method - options: 'create', 'update', or 'delete'
   * @params: docId - document id to apply sync
   *
   * @return: none
   */
  addSyncFlag(method: string, docId: string): void {
    const syncFlag: SyncMetadata = {
      method: method,
      docId: docId,
      docType: 'batch'
    };

    this.syncService.addSyncFlag(syncFlag);
  }

  /**
   * Clear all sync errors
   *
   * @params: none
   * @return: none
   */
  dismissAllSyncErrors(): void {
    this.syncErrors = [];
  }

  /**
   * Clear a sync error at the given index
   *
   * @params: index - error array index
   *
   * @return: none
   */
  dismissSyncError(index: number): void {
    if (index >= this.syncErrors.length || index < 0) {
      throw new Error('Invalid sync error index');
    }
    this.syncErrors.splice(index, 1);
  }

  /**
   * Construct sync requests based on stored sync flags
   *
   * @params: none
   *
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

        if (hasDefaultIdType(batch.recipeMasterId)) {
          // TODO: extract to own method(?)
          const recipeMaster$: BehaviorSubject<RecipeMaster>
            = this.recipeService.getRecipeMasterById(batch.recipeMasterId);

          if (recipeMaster$ === undefined || hasDefaultIdType(recipeMaster$.value._id)) {
            const errMsg: string = 'Sync error: Cannot get batch owner\'s id';
            errors.push(this.syncService.constructSyncError(errMsg));
            return;
          }
          batch.recipeMasterId = recipeMaster$.value._id;
          const variantId: string = recipeMaster$.value.variants
            .find((variant: RecipeVariant): boolean => hasId(variant, batch.recipeVariantId))
            ._id;
          batch.recipeVariantId = variantId || batch.recipeVariantId;
        }

        if (syncFlag.method === 'update' && isMissingServerId(batch._id)) {
          const errMsg: string = `Sync error: batch with id: ${batch.cid} is missing its server id`;
          errors.push(this.syncService.constructSyncError(errMsg));
        } else if (syncFlag.method === 'create') {
          batch['forSync'] = true;
          requests.push(this.configureBackgroundRequest('post', true, batch));
        } else if (syncFlag.method === 'update' && !isMissingServerId(batch._id)) {
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
   * @params: syncedData - an array of successfully synced docs;
   * deleted docs contain isDeleted flag - no further actions required for deletions
   *
   * @return: none
   */
  processSyncSuccess(syncData: (Batch | SyncData<Batch>)[]): void {
    syncData.forEach((_syncData: Batch | SyncData<Batch>): void => {
      if (_syncData['isDeleted'] === undefined) {
        const batch$: BehaviorSubject<Batch>
          = this.getBatchById((<Batch>_syncData).cid);

        if (batch$ === undefined) {
          this.syncErrors.push({
            errCode: -1,
            message: `Sync error: batch with id: '${(<Batch>_syncData).cid}' not found`
          });
        } else {
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
   * @params: onLogin - true if calling at login, false on reconnect
   *
   * @return: none
   */
  syncOnConnection(onLogin: boolean): Observable<boolean> {
    // Ignore reconnects if not logged in
    if (!onLogin && !this.userService.isLoggedIn()) {
      return of(false);
    }

    const syncRequests: SyncRequests<Batch> = this.generateSyncRequests();
    const errors: SyncError[] = syncRequests.syncErrors;
    const requests: Observable<HttpErrorResponse | Batch | SyncData<Batch>>[]
      = syncRequests.syncRequests;

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
        })
      );
  }

  /**
   * Network reconnect event handler
   *
   * @params: none
   * @params: none
   */
  syncOnReconnect(): void {
    this.syncOnConnection(false)
      .subscribe(
        (): void => {}, // Nothing further required if successful
        (error: string): void => {
          // TODO error feedback (toast?)
          console.log('Reconnect sync error', error);
        }
      );
  }

  /**
   * Post all stored batches to server
   *
   * @params: none
   * @return: none
   */
  syncOnSignup(): void {
    console.log('batch on signup');
    const requests: Observable<HttpErrorResponse | Batch>[] = [];

    const batchList: BehaviorSubject<Batch>[] = this.getAllBatchesList();

    // TODO: extract to own method(?)
    batchList.forEach((batch$: BehaviorSubject<Batch>): void => {
      const recipe$: BehaviorSubject<RecipeMaster>
        = this.recipeService.getRecipeMasterById(batch$.value.recipeMasterId);

      if (recipe$ === undefined || isMissingServerId(recipe$.value._id)) {
        requests.push(throwError(`Recipe with id ${batch$.value.recipeMasterId} not found`));
        return;
      }

      const user$: BehaviorSubject<User> = this.userService.getUser();
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
        (error: string): void => console.log('Batch sync error; continuing other sync events', error)
      );
  }

  /***** End Sync methods *****/


  /***** Utility methods *****/

  /**
   * Add a new batch to the list of active batches
   *
   * @params: newBatch - the new batch to convert to a subject and add to list
   *
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
   * @params: batchId - batch id to convert
   *
   * @return: none
   */
  archiveActiveBatch(batchId: string): Observable<Batch> {
    const batch$: BehaviorSubject<Batch> = this.getBatchById(batchId);

    if (batch$ === undefined) {
      return throwError(`Active batch with id: ${batchId} could not be archived`);
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
   * @params: [ids] - optional array of ids to check
   *
   * @return: true if ids are valid, device is connected to network, and user logged in
   */
  canSendRequest(ids?: string[]): boolean {
    let idsOk: boolean = !ids;
    if (ids && ids.length) {
      idsOk = ids.every((id: string): boolean => id && !hasDefaultIdType(id));
    }

    return this.connectionService.isConnected() && this.userService.isLoggedIn() && idsOk;
  }

  /**
   * Clear active or archive list
   *
   * @params: isActive - true for active batch list, false for archive batch list
   *
   * @return: none
   */
  clearBatchList(isActive: boolean): void {
    const batchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = this.getBatchList(isActive);

    batchList$.value.forEach((batch$: BehaviorSubject<Batch>): void => batch$.complete());
    batchList$.next([]);

    this.storageService.removeBatches(isActive);
  }

  /**
   * Clear all active and archive batches and clear storage on user logout
   *
   * @params: none
   * @return: none
   */
  clearAllBatchLists(): void {
    this.clearBatchList(true);
    this.clearBatchList(false);
  }

  /**
   * Emit a batch list change
   *
   * @params: isActive - true if active batch list should be updated; false for archive
   *
   * @return: none
   */
  emitBatchListUpdate(isActive: boolean): void {
    const batchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = this.getBatchList(isActive);
    batchList$.next(batchList$.value);
  }

  /**
   * Create a batch using a recipe process schedule as template
   *
   * @params: userId - the user's id
   * @params: masterId - the recipe's master id
   * @params: variantId - the recipe variant id from which to copy the schedule
   *
   * @return: Observable of new batch
   */
  generateBatchFromRecipe(userId: string, masterId: string, variantId: string): Observable<Batch> {
    const recipeMaster$: BehaviorSubject<RecipeMaster> = this.recipeService
      .getRecipeMasterById(masterId);

    if (!recipeMaster$) {
      return throwError('Missing recipe template');
    }

    return recipeMaster$
      .pipe(
        take(1),
        map((recipeMaster: RecipeMaster): Batch => {
          const variant = recipeMaster.variants
            .find((_variant: RecipeVariant): boolean => {
              return hasId(_variant, variantId);
            });

          if (variant === undefined) {
            throw Error('Missing recipe template');
          }

          const newBatch: Batch = {
            cid: this.clientIdService.getNewId(),
            createdAt: (new Date()).toISOString(),
            owner: userId,
            recipeMasterId: getId(recipeMaster),
            recipeVariantId: getId(variant),
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
                  const copy: object = { cid: this.clientIdService.getNewId() };
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
              grains: clone(variant.grains),
              hops: clone(variant.hops),
              yeast: clone(variant.yeast),
              otherIngredients: clone(variant.otherIngredients)
            }
          };
          console.log('new batch', newBatch);
          return newBatch;
        }),
        catchError((error: Error) => throwError(error.message))
      );
  }

  /**
   * Get a combined list of active and archive batches
   *
   * @params: none
   *
   * @return: array of batch behavior subjects
   */
  getAllBatchesList(): BehaviorSubject<Batch>[] {
    return this.getBatchList(true).value.concat(this.getBatchList(false).value);
  }

  /**
   * Search both active and archive lists and get a batch by its id
   *
   * @params: batchId - id to search
   *
   * @return: Batch behavior subject or undefined if not found
   */
  getBatchById(batchId: string): BehaviorSubject<Batch> {
    const active$: BehaviorSubject<Batch> = this.getBatchList(true).value
      .find((batch$: BehaviorSubject<Batch>): boolean => {
        return hasId(batch$.value, batchId);
      });

    if (active$ !== undefined) return active$;

    return this.getBatchList(false).value
      .find((batch$: BehaviorSubject<Batch>): boolean => {
        return hasId(batch$.value, batchId);
      });
  }

  /**
   * Get active or archive batch list subject
   *
   * @params: isActive - true for active batch, false for archive batch
   *
   * @return: subject of array of batch subjects
   */
  getBatchList(isActive: boolean): BehaviorSubject<BehaviorSubject<Batch>[]> {
    return isActive ? this.activeBatchList$ : this.archiveBatchList$;
  }

  /**
   * Convert an array of active or archive batches into a BehaviorSubject of an
   * array of BehaviorSubjects of the respective batches; Combine with any
   * batch subjects already in the list that have an outstanding sync flag
   *
   * @params: isActive - true for active batches, false for archive batches
   * @params: batchList - array of batches
   *
   * @return: none
   */
  mapBatchArrayToSubjectArray(isActive: boolean, batchList: Batch[]): void {
    this.getBatchList(isActive).next(toSubjectArray<Batch>(batchList));
  }

  /**
   * Remove a batch from a batch list
   *
   * @params: isActive - true for active batch, false for archive batch
   * @params: batchId - batch id to remove from list
   *
   * @return: Observable of null, using for error throw/handling
   */
  removeBatchFromList(isActive: boolean, batchId: string): Observable<Batch> {
    const batchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = this.getBatchList(isActive);
    const batchList: BehaviorSubject<Batch>[] = batchList$.value;

    const indexToRemove: number = getIndexById(batchId, getArrayFromSubjects(batchList));

    if (indexToRemove === -1) {
      return throwError(
        `Delete error: ${isActive ? 'Active' : 'Archive'} batch with id ${batchId} not found`
      );
    }

    batchList[indexToRemove].complete();
    batchList.splice(indexToRemove, 1);
    batchList$.next(batchList);
    this.updateBatchStorage(isActive);

    return of(null);
  }

  /***** End utility methods *****/


  /***** Storage methods *****/

  /**
   * Update active or archive batch storage
   *
   * @params: isActive - true for active batches, false for archive batches
   *
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
      (error: string): void => {
        console.log(`${ isActive ? 'active' : 'archive' } batch store error: ${error}`);
      }
    );
  }

  /***** End storage methods *****/

}
