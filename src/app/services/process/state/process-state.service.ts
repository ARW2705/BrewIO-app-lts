/* Module imports */
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, mergeMap, take, tap } from 'rxjs/operators';

/* Constant imports */
import { HIGH_SEVERITY } from '@shared/constants';

/* Interface imports */
import { Batch, BatchAnnotations, BatchContext, BatchProcess, Process, RecipeMaster, RecipeVariant } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { EventService } from '@services/event/event.service';
import { IdService } from '@services/id/id.service';
import { ProcessHttpService } from '@services/process/http/process-http.service';
import { ProcessSyncService } from '@services/process/sync/process-sync.service';
import { ProcessTypeGuardService } from '@services/process/type-guard/process-type-guard.service';
import { RecipeService } from '@services/recipe/recipe.service';
import { StorageService } from '@services/storage/storage.service';
import { UtilityService } from '@services/utility/utility.service';


@Injectable({
  providedIn: 'root'
})
export class ProcessStateService {
  activeBatchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
  archiveBatchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);

  constructor(
    public errorReporter: ErrorReportingService,
    public event: EventService,
    public idService: IdService,
    public processHttpService: ProcessHttpService,
    public processSyncService: ProcessSyncService,
    public processTypeGuardService: ProcessTypeGuardService,
    public recipeService: RecipeService,
    public storageService: StorageService,
    public utilService: UtilityService
  ) {
    this.registerEvents();
  }

  /***** Initializations *****/

  /**
   * Fetch active and archive batches from server and populate memory
   *
   * @param: none
   * @return: observable success requires no additional actions, using for error handling
   */
  initFromServer(): Observable<null> {
    if (this.utilService.canSendRequest()) {
      return this.syncOnConnection(true)
        .pipe(
          mergeMap((): Observable<{ activeBatches: Batch[], archiveBatches: Batch[] }> => {
            return this.processHttpService.getAllBatches();
          }),
          map((batchLists: { activeBatches: Batch[], archiveBatches: Batch[] }): null => {
            this.mapBatchArrayToSubjectArray(true, batchLists.activeBatches);
            this.mapBatchArrayToSubjectArray(false, batchLists.archiveBatches);
            this.updateBatchStorage(true);
            this.updateBatchStorage(false);
            return null;
          })
        );
    } else {
      return of(null);
    }
  }

  /**
   * Load active and archive batches from storage
   *
   * @param: none
   * @return: observable success requires no additional actions, using for error handling
   */
  initFromStorage(): Observable<null> {
    return forkJoin([
      this.storageService.getBatches(true),
      this.storageService.getBatches(false)
    ])
    .pipe(
      mergeMap(([activeBatches, archiveBatches]: [ Batch[], Batch[] ]): Observable<null> => {
        // only apply lists from storage if the current lists are empty
        if (this.activeBatchList$.value.length === 0) {
          this.mapBatchArrayToSubjectArray(true, activeBatches);
        }
        if (this.archiveBatchList$.value.length === 0) {
          this.mapBatchArrayToSubjectArray(false, archiveBatches);
        }
        return of(null);
      })
    );
  }

  /**
   * Get active and archived batches
   *
   * @param: none
   * @return: none
   */
  initBatchLists(): void {
    this.initFromStorage()
      .pipe(
        finalize((): void => this.event.emit('init-inventory')),
        mergeMap((): Observable<null> =>  this.initFromServer())
      )
      .subscribe(
        (): void => console.log('batch init complete'),
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Set up event listeners
   *
   * @param: none
   * @return: none
   */
  registerEvents(): void {
    console.log('register batch events');
    this.event.register('init-batches').subscribe((): void => this.initBatchLists());
    this.event.register('clear-data').subscribe((): void => this.clearAllBatchLists());
    this.event.register('sync-batches-on-signup').subscribe((): void => this.syncOnSignup());
    this.event.register('connected')
      .pipe(mergeMap((): Observable<null> => this.syncOnConnection(false)))
      .subscribe((): void => console.log('process sync on connection complete'));
  }

  /***** End Initializations *****/


  /***** API access methods *****/



  /***** Sync Calls *****/

  /**
   * Perform sync on signup action and apply any results to inventory
   *
   * @param: none
   * @return: none
   */
  syncOnSignup(): void {
    this.processSyncService.syncOnSignup(this.getAllBatchesList())
      .subscribe(
        (syncedList: BehaviorSubject<Batch>[]): void => this.setBatchLists(syncedList),
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Perform sync on connection action and apply any results to process
   *
   * @param: onLogin - true if connection event was due to user login
   * @return: none
   */
  syncOnConnection(onLogin: boolean): Observable<null> {
    return this.processSyncService.syncOnConnection(onLogin, this.getAllBatchesList())
      .pipe(
        map((syncedList: BehaviorSubject<Batch>[]): null => {
          this.setBatchLists(syncedList);
          return null;
        })
      );
  }

  /***** End Sync Calls *****/


  /***** Http Handlers *****/

  /**
   * Update in memory item with update response from server
   *
   * @param: batchResponse - server response with item
   * @param: isDeletion - true if item is being deleted
   * @return: none
   */
  handleBackgroundUpdateResponse(batchResponse: Batch, isDeletion: boolean): void {
    const id: string = this.idService.getId(batchResponse);
    const batch$: BehaviorSubject<Batch> = this.getBatchSubjectById(id);
    if (!isDeletion && !batch$) {
      throw this.getMissingError('update', id);
    } else {
      this.processTypeGuardService.checkTypeSafety(batchResponse);
      batch$.next(batchResponse);
      this.emitBatchListUpdate(!batchResponse.isArchived);
    }
  }

  /**
   * Send a background request to server or set sync flag if request cannot be completed
   *
   * @param: requestMethdod - the http request method ('post', 'patch', or 'delete')
   * @param: requestBody - the http body to send
   * @return: none
   */
  sendBackgroundRequest(requestMethod: string, requestBody: Batch): void {
    const requestId: string = this.idService.getId(requestBody);
    const ids: string[] = [];
    if (requestMethod === 'patch' || requestMethod === 'delete') {
      ids.push(requestId);
    }

    if (this.utilService.canSendRequest(ids)) {
      this.processTypeGuardService.checkTypeSafety(requestBody);
      this.processHttpService.requestInBackground(requestMethod, requestBody)
        .subscribe(
          (batch: Batch): void => {
            this.handleBackgroundUpdateResponse(batch, requestMethod === 'delete');
          },
          (error: Error): void => this.errorReporter.handleUnhandledError(error)
        );
    } else {
      this.processSyncService.addSyncFlag(
        this.processSyncService.convertRequestMethodToSyncMethod(requestMethod),
        requestId
      );
    }
  }

  /***** End Http Handlers *****/


  /***** State Handlers *****/

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
   * @return: observable of null on successful completion
   */
  archiveActiveBatch(batchId: string): Observable<Batch> {
    const batch$: BehaviorSubject<Batch> = this.getBatchSubjectById(batchId);
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
   * Clear active or archive list and their content
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
   * Generate batch annotations derived from a given recipe
   *
   * @param: recipe - the recipe master to base the batch on
   * @param: variant - the particular recipe variant to base the batch on
   * @return: initialized batch annotations
   */
  generateBatchAnnotations(recipe: RecipeMaster, variant: RecipeVariant): BatchAnnotations {
    return {
      styleId: recipe.style._id,
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
    };
  }

  /**
   * Generate batch context info from a given recipe
   *
   * @param: recipe - the recipe master to base the batch on
   * @param: variant - the particular recipe variant to base the batch on
   * @return: initialized batch context info
   */
  generateBatchContext(recipe: RecipeMaster, variant: RecipeVariant): BatchContext {
    return {
      recipeMasterName: recipe.name,
      recipeVariantName: variant.variantName,
      recipeImage: recipe.labelImage,
      batchVolume: variant.batchVolume,
      boilVolume: variant.boilVolume,
      grains: this.utilService.clone(variant.grains),
      hops: this.utilService.clone(variant.hops),
      yeast: this.utilService.clone(variant.yeast),
      otherIngredients: this.utilService.clone(variant.otherIngredients)
    };
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
    const recipeMaster$: BehaviorSubject<RecipeMaster> = this.recipeService.getRecipeSubjectById(
      masterId
    );
    if (!recipeMaster$) {
      const message: string = 'An error occurring trying to generate batch from recipe: missing recipe';
      const additionalMessage: string = `Recipe master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    return recipeMaster$
      .pipe(
        take(1),
        map((recipe: RecipeMaster): Batch => {
          const variant: RecipeVariant = recipe.variants.find((_variant: RecipeVariant): boolean => {
            return this.idService.hasId(_variant, variantId);
          });
          if (!variant) {
            const message: string = 'An error occurring trying to generate batch from recipe: missing variant';
            const additionalMessage: string = `Recipe master with id ${masterId} was found, but variant with id ${variantId} not found`;
            throw this.getMissingError(message, additionalMessage);
          }

          const newBatch: Batch = {
            cid: this.idService.getNewId(),
            createdAt: (new Date()).toISOString(),
            owner: userId,
            recipeMasterId: this.idService.getId(recipe),
            recipeVariantId: this.idService.getId(variant),
            isArchived: false,
            annotations: this.generateBatchAnnotations(recipe, variant),
            process: this.generateBatchProcess(variant),
            contextInfo: this.generateBatchContext(recipe, variant)
          };
          console.log('new batch', newBatch);
          return newBatch;
        }),
        mergeMap((newBatch: Batch): Observable<Batch> => this.addBatchToActiveList(newBatch)),
        tap((newBatch: Batch): void => {
          this.setBatch(newBatch, true);
          this.sendBackgroundRequest('post', newBatch);
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Generate batch process from a given recipe
   *
   * @param: variant - the particular recipe variant to base the batch on
   * @return: initialized batch process
   */
  generateBatchProcess(variant: RecipeVariant): BatchProcess {
    return {
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
    };
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
   * @return: the batch object or undefined if not found
   */
  getBatchById(batchId: string): Batch {
    return this.getBatchSubjectById(batchId).value;
  }

  /**
   * Search both active and archive lists and get a batch subject by its id
   *
   * @param: batchId - id to search
   * @return: Batch behavior subject or undefined if not found
   */
  getBatchSubjectById(batchId: string): BehaviorSubject<Batch> {
    const active$: BehaviorSubject<Batch> = this.getBatchList(true).value
      .find((batch$: BehaviorSubject<Batch>): boolean => this.idService.hasId(batch$.value, batchId));
    if (active$ !== undefined) {
      return active$;
    }

    return this.getBatchList(false).value.find((batch$: BehaviorSubject<Batch>): boolean => {
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
   * @param: [additionalMessage] - additional error message that is not shown to user
   * @return: custom error
   */
  getMissingError(baseMessage: string, additionalMessage: string = ''): CustomError {
    return new CustomError(
      'BatchError',
      `${baseMessage} ${additionalMessage}`,
      HIGH_SEVERITY,
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
   * @return: none
   */
  mapBatchArrayToSubjectArray(isActive: boolean, batchList: Batch[]): void {
    this.getBatchList(isActive).next(this.utilService.toBehaviorSubjectArray<Batch>(batchList));
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
    const batchSubjectList: BehaviorSubject<Batch>[] = batchList$.value;
    const batchList: Batch[] = this.utilService.getArrayFromBehaviorSubjects(batchSubjectList);
    const indexToRemove: number = this.idService.getIndexById(batchId, batchList);
    if (indexToRemove === -1) {
      return of(null); // nothing to do if batch no longer exists
    }

    batchSubjectList[indexToRemove].complete();
    batchSubjectList.splice(indexToRemove, 1);
    batchList$.next(batchSubjectList);
    this.updateBatchStorage(isActive);
    return of(null);
  }

  /**
   * Set the active and/or archive batch lists with given list
   * list may be a combination of active and archive batches
   *
   * @param: batchList - the list to replace the current list with
   * @return: none
   */
  setBatchLists(batchList: BehaviorSubject<Batch>[]): void {
    if (batchList) {
      const activeList: BehaviorSubject<Batch>[] = [];
      const archiveList: BehaviorSubject<Batch>[] = [];
      batchList.forEach((batch$: BehaviorSubject<Batch>): void => {
        const batch: Batch = batch$.value;
        this.processTypeGuardService.checkTypeSafety(batch);
        if (batch.isArchived) {
          archiveList.push(batch$);
        } else {
          activeList.push(batch$);
        }
      });
      this.getBatchList(true).next(activeList);
      this.getBatchList(false).next(archiveList);
      this.updateBatchStorage(true);
      this.updateBatchStorage(false);
    }
  }

  /**
   * Set an active or archive batch with a given batch
   * Batch must already exist (update only)
   *
   * @param: batch - the new batch to overwrite with
   * @param: isActive - true for active batch; false for archive batch
   * @return: none
   */
  setBatch(batch: Batch, isActive: boolean): void {
    if (batch) {
      const batch$: BehaviorSubject<Batch> = this.getBatchSubjectById(this.idService.getId(batch));
      if (!batch$) {
        const message: string = 'An error occurring trying to update a batch';
        const additionalMessage: string = `Batch with id ${batch.cid} not found`;
        throw this.getMissingError(message, additionalMessage);
      }

      this.processTypeGuardService.checkTypeSafety(batch);
      batch$.next(batch);
      this.emitBatchListUpdate(isActive);
      this.updateBatchStorage(isActive);
    }
  }

  /***** End State Handlers *****/


  /***** Storage methods *****/

  /**
   * Update active or archive batch storage
   *
   * @param: isActive - true for active batches, false for archive batches
   * @return: none
   */
  updateBatchStorage(isActive: boolean): void {
    const storeList: Batch[] = this.getBatchList(isActive).value
      .map((batch$: BehaviorSubject<Batch>): Batch => batch$.value);
    this.storageService.setBatches(isActive, storeList)
      .subscribe(
        (): void => console.log(`stored ${ isActive ? 'active' : 'archive' } batches`),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End storage methods *****/
}
