/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concat, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, finalize, tap } from 'rxjs/operators';

/* Constants imports */
import { API_VERSION, BASE_URL } from '../../shared/constants';

/* Interface imports */
import { Author, DocumentGuard, GrainBill, HopsSchedule, Image, ImageRequestFormData, ImageRequestMetadata, OtherIngredients, Process, RecipeMaster, RecipeVariant, SyncData, SyncError, SyncMetadata, SyncRequests, SyncResponse, User, YeastBatch } from '../../shared/interfaces';

/* Type guard imports */
import { ProcessGuardMetadata, CalendarProcessGuardMetadata, ManualProcessGuardMetadata, TimerProcessGuardMetadata, RecipeMasterGuardMetadata, RecipeVariantGuardMetadata, GrainBillGuardMetadata, HopsScheduleGuardMetadata, YeastBatchGuardMetadata, OtherIngredientsGuardMetadata } from '../../shared/type-guard-metadata';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Default imports */
import { defaultImage } from '../../shared/defaults';

/* Service imports */
import { ConnectionService } from '../connection/connection.service';
import { ErrorReportingService } from '../error-reporting/error-reporting.service';
import { EventService } from '../event/event.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { IdService } from '../id/id.service';
import { ImageService } from '../image/image.service';
import { LibraryService } from '../library/library.service';
import { StorageService } from '../storage/storage.service';
import { SyncService } from '../sync/sync.service';
import { ToastService } from '../toast/toast.service';
import { TypeGuardService } from '../type-guard/type-guard.service';
import { UserService } from '../user/user.service';
import { UtilityService } from '../utility/utility.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  defaultImage: Image = defaultImage();
  recipeMasterList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]>
    = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);
  syncBaseRoute: string = 'recipes/private';
  syncErrors: SyncError[] = [];
  syncKey: string = 'recipe';

  constructor(
    public connectionService: ConnectionService,
    public errorReporter: ErrorReportingService,
    public event: EventService,
    public http: HttpClient,
    public idService: IdService,
    public httpError: HttpErrorService,
    public imageService: ImageService,
    public libraryService: LibraryService,
    public storageService: StorageService,
    public syncService: SyncService,
    public toastService: ToastService,
    public typeGuard: TypeGuardService,
    public userService: UserService,
    public utilService: UtilityService
  ) {
    this.registerEvents();
  }

  /***** Initializations *****/

  /**
   * Perform any pending sync operations first then fetch recipes
   * On completion, emit event to trigger batch init
   *
   * @param: none
   * @return: none
   */
  initFromServer(): void {
    concat(
      this.syncOnConnection(true),
      this.http.get<RecipeMaster[]>(`${BASE_URL}/${API_VERSION}/recipes/private`)
        .pipe(
          tap((recipeMasterArrayResponse: RecipeMaster[]): void => {
            console.log('recipes from server');
            recipeMasterArrayResponse
              .forEach((recipe: RecipeMaster): void => {
                this.checkTypeSafety(recipe);
              });
            this.mapRecipeMasterArrayToSubjects(recipeMasterArrayResponse);
            this.updateRecipeStorage();
          }),
          catchError(this.errorReporter.handleGenericCatchError())
        )
    )
    .pipe(finalize(() => this.event.emit('init-batches')))
    .subscribe(
      (): void => {},
      (error: any): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Get recipes from storage - use these recipes if there has not been a server response
   *
   * @param: none
   * @return: none
   */
  initFromStorage(): void {
    this.storageService.getRecipes()
      .subscribe(
        (recipeMasterList: RecipeMaster[]): void => {
          console.log('recipes from storage');
          if (!this.recipeMasterList$.value.length && recipeMasterList.length) {
            this.mapRecipeMasterArrayToSubjects(recipeMasterList);
          }
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Get recipe masters
   *
   * @param: none
   * @return: none
   */
  initializeRecipeMasterList(): void {
    console.log('init recipes');
    this.initFromStorage();

    if (this.canSendRequest()) {
      this.initFromServer();
    } else {
      this.event.emit('init-batches');
    }
  }

  /**
   * Set up event listeners
   *
   * @param: none
   * @return: none
   */
  registerEvents(): void {
    this.event.register('init-recipes').subscribe((): void => this.initializeRecipeMasterList());
    this.event.register('clear-data').subscribe((): void => this.clearRecipes());
    this.event.register('sync-recipes-on-signup').subscribe((): void => this.syncOnSignup());
    this.event.register('connected').subscribe((): void => this.syncOnReconnect());
  }

  /***** End Initializations *****/


  /***** Public API *****/

  /**
   * Get recipe author data
   *
   * @param: masterId - recipe master to use as base for user search
   *
   * @return: observable of author data
   */
  getPublicAuthorByRecipeId(masterId: string): Observable<Author> {
    let searchId: string = masterId;
    const author: Author = {
      username: 'Not Found',
      userImage: this.defaultImage,
      breweryLabelImage: this.defaultImage
    };

    try {
      const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(searchId);
      if (master$ === undefined) {
        return of(author);
      }
      const master: RecipeMaster = master$.value;

      const user$: BehaviorSubject<User> = this.userService.getUser();
      const user: User = user$.value;

      if (this.idService.hasId(user, master.owner)) {
        return of({
          username: user.username,
          userImage: user.userImage,
          breweryLabelImage: user.breweryLabelImage
        });
      }

      if (this.idService.hasDefaultIdType(searchId)) {
        searchId = master._id;
        if (searchId === undefined) {
          return of(author);
        }
      }

      return this.http.get<Author>(
        `${BASE_URL}/${API_VERSION}/recipes/public/master/${searchId}/author`
      )
      .pipe(
        catchError((error: Error): Observable<Author> => {
          console.log('Error fetching author', error);
          return of(author);
        })
      );
    } catch (error) {
      return of(author);
    }
  }

  /**
   * Get a public recipe master by its id
   *
   * @param: masterId - recipe master id string to search
   *
   * @return: Observable of recipe master
   */
  getPublicRecipeMasterById(masterId: string): Observable<RecipeMaster> {
    return this.http.get<RecipeMaster>(
      `${BASE_URL}/${API_VERSION}/recipes/public/master/${masterId}`
    )
    .pipe(catchError(this.errorReporter.handleGenericCatchError()));
  }

  /**
   * Get all public recipe masters owned by a user
   *
   * @param: userId - user id string to search
   *
   * @return: Observable of an array of recipe masters
   */
  getPublicRecipeMasterListByUser(userId: string): Observable<RecipeMaster[]> {
    return this.http.get<RecipeMaster[]>(`${BASE_URL}/${API_VERSION}/recipes/public/${userId}`)
      .pipe(catchError(this.errorReporter.handleGenericCatchError()));
  }

  /**
   * Get a public recipe variant by its id
   *
   * @param: masterId - recipe master id which requested recipe belongs
   * @param: variantId - recipe id string to search
   *
   * @return: Observable of recipe
   */
  getPublicRecipeVariantById(masterId: string, variantId: string): Observable<RecipeVariant> {
    return this.http.get<RecipeVariant>(
      `${BASE_URL}/${API_VERSION}/recipes/public/master/${masterId}/variant/${variantId}`
    )
    .pipe(catchError(this.errorReporter.handleGenericCatchError()));
  }

  /***** END Public API *****/


  /***** Private API *****/

  /**
   * Create a new recipe master and initial variant
   *
   * @param: newMasterValues - object with data to construct
   * recipe master and an initial recipe variant
   *
   * @return: observable of new recipe master
   */
  createRecipeMaster(newMasterValues: object): Observable<RecipeMaster> {
    try {
      const newMaster: RecipeMaster = this.formatNewRecipeMaster(newMasterValues);

      this.checkTypeSafety(newMaster);

      return this.imageService.storeImageToLocalDir(newMaster.labelImage)
        .pipe(
          mergeMap((): Observable<RecipeMaster> => this.addRecipeMasterToList(newMaster)),
          tap(() => {
            if (this.canSendRequest()) {
              this.requestInBackground('post', newMaster);
            } else {
              this.addSyncFlag('create', newMaster.cid);
            }
          }),
          catchError(this.errorReporter.handleGenericCatchError())
        );
    } catch (error) {
      return this.errorReporter.handleGenericCatchError()(error);
    }
  }

  /**
   * Create a new recipe variant
   *
   * @param: masterId - recipe master id to add variant to
   * @param: variant - the new RecipeVariant to add
   *
   * @return: observable of new variant
   */
  createRecipeVariant(masterId: string, recipeVariant: RecipeVariant): Observable<RecipeVariant> {
    const recipeMaster$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (!recipeMaster$) {
      const message: string = 'An error occurred trying to create new variant: missing source recipe';
      const additionalMessage: string = `Recipe master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }
    const recipeMaster: RecipeMaster = recipeMaster$.value;

    this.setRecipeIds(recipeVariant);
    this.checkTypeSafety(recipeVariant);

    return this.addRecipeVariantToMasterInList(masterId, recipeVariant)
      .pipe(
        tap(() => {
          if (this.canSendRequest([masterId])) {
            this.requestInBackground('post', recipeMaster, recipeVariant);
          } else {
            this.addSyncFlag('update', masterId);
          }
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Remove a recipe master and its variants
   *
   * @param: masterId - if of recipe master to delete
   *
   * @return: observable resulting data not required; using for error throw/handling
   */
  removeRecipeMasterById(masterId: string): Observable<boolean> {
    const recipeMaster$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (!recipeMaster$) {
      const message: string = 'An error occurred trying to remove recipe master: missing recipe';
      const additionalMessage: string = `Recipe master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    const recipeMaster: RecipeMaster = recipeMaster$.value;

    return this.removeRecipeMasterFromList(masterId)
      .pipe(
        tap((): void => {
          if (recipeMaster.labelImage && !this.imageService.hasDefaultImage(recipeMaster.labelImage)) {
            // this.imageService.deleteLocalImage(recipeMaster.labelImage.filePath)
            //   .subscribe((errMsg: string) => console.log('image deletion', errMsg));
            // TODO: THIS WON'T WORK UNTIL IMAGE SERVICE IS UPDATED
            this.imageService.deleteLocalImage(recipeMaster.labelImage.filePath)
              .subscribe(
                (): void => {},
                catchError(this.errorReporter.handleGenericCatchError())
              );
          }

          if (this.canSendRequest([masterId])) {
            this.requestInBackground('delete', recipeMaster);
          } else {
            this.addSyncFlag('delete', masterId);
          }
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Remove a recipe variant from its parent
   *
   * @param: masterId - recipe variant's master's id
   * @param: variantId - id of variant to delete
   *
   * @return: observable resulting data not required; using for error throw/handling
   */
  removeRecipeVariantById(masterId: string, variantId: string): Observable<boolean> {
    const recipeMaster$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (!recipeMaster$) {
      const message: string = 'An error occurred trying to remove variant: missing source recipe';
      const additionalMessage: string = `Recipe master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    const recipeMaster: RecipeMaster = recipeMaster$.value;
    const recipeVariant: RecipeVariant = recipeMaster.variants
      .find((variant: RecipeVariant): boolean => {
        return this.idService.hasId(variant, variantId);
      });

    if (!recipeVariant) {
      const message: string = 'An error occurred trying to remove variant: missing variant';
      const additionalMessage: string = `Recipe variant with id ${variantId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    return this.removeRecipeFromMasterInList(masterId, variantId)
      .pipe(
        tap((): void => {
          if (this.canSendRequest([masterId])) {
            this.requestInBackground('delete', recipeMaster, recipeVariant);
          } else {
            this.addSyncFlag('update', masterId);
          }
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Update a recipe master
   *
   * @param: masterId - recipe master's id
   * @param: update - object containing update data
   *
   * @return: observable of updated recipe master
   */
  updateRecipeMasterById(masterId: string, update: object): Observable<RecipeMaster> {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);

    if (!master$) {
      const message: string = 'An error occurred trying to update recipe: missing recipe master';
      const additionalMessage: string = `Recipe master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    const master: RecipeMaster = master$.value;

    const previousImagePath: string = master.labelImage.filePath;
    const isTemp: boolean = this.imageService.isTempImage(master.labelImage);

    for (const key in update) {
      if (update.hasOwnProperty(key) && master.hasOwnProperty(key) && key !== 'variants') {
        master[key] = update[key];
      }
    }

    let storeImage: Observable<Image>;
    const labelImage: Image = update['labelImage'] ;
    if (labelImage && labelImage.hasPending) {
      storeImage = this.imageService.storeImageToLocalDir(
        labelImage,
        isTemp ? null : previousImagePath
      );
    } else {
      storeImage = of(null);
    }

    return storeImage
      .pipe(
        mergeMap((): Observable<RecipeMaster> => this.updateRecipeMasterInList(masterId, master)),
        tap((): void => {
          if (this.canSendRequest([masterId])) {
            this.requestInBackground('patch', master);
          } else {
            this.addSyncFlag('update', masterId);
          }
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Update a recipe variant
   *
   * @param: masterId - if of recipe variant's parent master
   * @param: variantId - if of variant to update
   * @param: update - object containing update data
   *
   * @return: observable of the updated recipe
   */
  updateRecipeVariantById(
    masterId: string,
    variantId: string,
    update: object
  ): Observable<RecipeVariant> {
    return this.updateRecipeVariantOfMasterInList(masterId, variantId, update)
      .pipe(
        tap((recipeVariant: RecipeVariant): void => {
          const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
          if (!master$) {
            const message: string = 'An error occurred trying to update variant: missing recipe master';
            const additionalMessage: string = `Recipe master with id ${masterId} not found`;
            throw this.getMissingError(message, additionalMessage);
          }
          const recipeMaster: RecipeMaster = master$.value;

          if (this.canSendRequest([masterId, variantId])) {
            this.requestInBackground('patch', recipeMaster, recipeVariant);
          } else {
            this.addSyncFlag('update', masterId);
          }
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /***** END private API *****/


  /***** Background Server Update Methods *****/

  /**
   * Configure a background request while defining which error handling method to use
   *
   * @param: syncMethod - the http method to apply
   * @param: recipeMaster - the RecipeMaster to use in request
   * @param: shouldResolveError - true if error should return the error response as an observable
   * or false if error should be handled as an error
   *
   * @return: observable of RecipeMaster or HttpErrorResponse
   */
  configureBackgroundRequest<T>(
    syncMethod: string,
    shouldResolveError: boolean,
    recipeMaster: RecipeMaster,
    recipeVariant: RecipeVariant,
    deletionId?: string
  ): Observable<T | HttpErrorResponse> {
    return this.getBackgroundRequest<T>(syncMethod, recipeMaster, recipeVariant, deletionId)
      .pipe(catchError((error: HttpErrorResponse): Observable<HttpErrorResponse | never> => {
        if (shouldResolveError) {
          return of(error);
        } else {
          return this.errorReporter.handleGenericCatchError()(error);
        }
      }));
  }

  /**
   * Construct a server background request
   *
   * @param: syncMethod - the http method: 'post', 'patch', and 'delete' are valid
   * @param: recipeMaster - the recipe master to base the request on
   * @param: [recipeVariant] - optional recipe variant to base the request on
   * @param: [deletionId] - optional id for deletion if client side doc has already been deleted
   *
   * @return: observable of server request
   */
  getBackgroundRequest<T>(
    requestMethod: string,
    recipeMaster: RecipeMaster,
    recipeVariant?: RecipeVariant,
    deletionId?: string
  ): Observable<T> {
    const isMaster: boolean = !recipeVariant;

    let route: string = `${BASE_URL}/${API_VERSION}/recipes/private`;

    if (requestMethod !== 'post' && requestMethod !== 'patch' && requestMethod !== 'delete') {
      const message: string = `Invalid http method: ${requestMethod}`;
      return throwError(new CustomError('HttpRequestError', message, 2, message));
    }

    if (requestMethod === 'delete') {
      route += '/master/';
      if (!recipeMaster && !recipeVariant && deletionId) {
        route += deletionId;
      } else if (isMaster) {
        route += recipeMaster._id;
      } else {
        route += `${recipeMaster._id}/variant/${recipeVariant._id}`;
      }
      return this.http.delete<T>(route);
    }

    const imageRequest: ImageRequestFormData[] = [];
    if (isMaster && recipeMaster.labelImage.hasPending) {
      imageRequest.push({ image: recipeMaster.labelImage, name: 'labelImage'});
    }

    return this.imageService.blobbifyImages(imageRequest)
      .pipe(
        mergeMap((imageData: ImageRequestMetadata[]): Observable<T> => {
          const formData: FormData = new FormData();
          formData.append(
            isMaster ? 'recipeMaster' : 'recipeVariant',
            JSON.stringify(isMaster ? recipeMaster : recipeVariant)
          );

          if (imageData.length) {
            formData.append(imageData[0].name, imageData[0].blob, imageData[0].filename);
          }

          if (requestMethod === 'post') {
            route += `${isMaster ? '' : `/master/${recipeMaster._id}`}`;
            return this.http.post<T>(route, formData);
          } else if (requestMethod === 'patch') {
            route += `/master/${recipeMaster._id}${isMaster ? '' : `/variant/${recipeVariant._id}`}`;
            return this.http.patch<T>(route, formData);
          }
        })
      );
  }

  /**
   * Handle updating client doc with server response
   *
   * @param: masterId - recipe master's id to update or variant's master's id
   * @param: variantId - recipe variant id to update
   * @param: recipeResponse - the updated recipe master or variant
   * @param: method - the request method; 'delete' requests need no further processing
   *
   * @return: observable of the updated recipe master or variant
   */
  handleBackgroundUpdateResponse(
    masterId: string,
    variantId: string,
    recipeResponse: RecipeMaster | RecipeVariant,
    method: string
  ): Observable<RecipeMaster | RecipeVariant> {
    if (method === 'delete') {
      return of(null);
    } else if (!variantId) {
      return this.updateRecipeMasterInList(masterId, <RecipeMaster>recipeResponse);
    } else {
      return this.updateRecipeVariantOfMasterInList(masterId, variantId, <RecipeVariant>recipeResponse);
    }
  }

  /**
   * Update server in background
   *
   * @param: syncMethod - the http method to apply
   * @param: recipeMaster - the RecipeMaster to base request on
   * @param: [recipeVariant] - optional RecipeVariant to base request on
   *
   * @return: none
   */
  requestInBackground(
    syncMethod: string,
    recipeMaster: RecipeMaster,
    recipeVariant?: RecipeVariant
  ): void {
    console.log(`${syncMethod}ing in background`, recipeMaster, recipeVariant);
    let syncRequest: Observable<RecipeMaster | RecipeVariant>;

    if (syncMethod === 'post' || syncMethod === 'patch' || syncMethod === 'delete') {
      syncRequest = this.getBackgroundRequest<RecipeMaster | RecipeVariant>(
        syncMethod,
        recipeMaster,
        recipeVariant
      );
    } else {
      const message: string = `Unknown sync type: ${syncMethod}`;
      syncRequest = throwError(new CustomError('SyncError', message, 2, message));
    }

    syncRequest
      .pipe(
        map((recipeResponse: RecipeMaster | RecipeVariant): Observable<RecipeMaster | RecipeVariant> => {
          const variantId: string = recipeVariant ? recipeVariant.cid : null;
          return this.handleBackgroundUpdateResponse(recipeMaster.cid, variantId, recipeResponse, syncMethod);
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      )
      .subscribe(
        (): void => console.log(`Recipe: background ${syncMethod} request successful`),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Background Server Update Methods *****/


  /***** Sync Methods *****/

  /**
   * Add a sync flag for a recipe
   *
   * @param: method - options: 'create', 'update', or 'delete'
   * @param: docId - document id to apply sync
   *
   * @return: none
   */
  addSyncFlag(method: string, docId: string): void {
    const syncFlag: SyncMetadata = {
      method: method,
      docId: docId,
      docType: 'recipe'
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
   * @param: index - error array index to remove
   *
   * @return: none
   */
  dismissSyncError(index: number): void {
    this.syncErrors.splice(index, 1);
  }

  /**
   * Construct sync requests based on stored sync flags
   *
   * @param: none
   *
   * @return: configured sync requests object
   */
  generateSyncRequests(): SyncRequests<RecipeMaster> {
    const errors: SyncError[] = [];
    const requests: Observable<HttpErrorResponse | RecipeMaster | SyncData<RecipeMaster>>[] = [];

    this.syncService.getSyncFlagsByType('recipe')
      .forEach((syncFlag: SyncMetadata): void => {
        const recipeMaster$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(syncFlag.docId);
        const recipeMaster: RecipeMaster = recipeMaster$ ? recipeMaster$.value : null;

        if (recipeMaster$ === undefined && syncFlag.method !== 'delete') {
          const errMsg: string = `Sync error: Recipe master with id '${syncFlag.docId}' not found`;
          errors.push(this.syncService.constructSyncError(errMsg));
          return;
        } else if (syncFlag.method === 'delete') {
          requests.push(this.configureBackgroundRequest<RecipeMaster>('delete', true, null, null, syncFlag.docId));
          return;
        }

        if (this.idService.hasDefaultIdType(recipeMaster.owner)) {
          const user$: BehaviorSubject<User> = this.userService.getUser();

          if (user$ === undefined || user$.value._id === undefined) {
            const errMsg: string = 'Sync error: Cannot get recipe owner\'s id';
            errors.push(this.syncService.constructSyncError(errMsg));
            return;
          }
          recipeMaster.owner = user$.value._id;
        }

        if (syncFlag.method === 'update' && this.idService.isMissingServerId(recipeMaster._id)) {
          const errMsg: string = `Recipe with id: ${recipeMaster.cid} is missing its server id`;
          errors.push(this.syncService.constructSyncError(errMsg));
        } else if (syncFlag.method === 'create') {
          recipeMaster['forSync'] = true;
          requests.push(this.configureBackgroundRequest<RecipeMaster>('post', true, recipeMaster, null));
        } else if (syncFlag.method === 'update' && !this.idService.isMissingServerId(recipeMaster._id)) {
          requests.push(this.configureBackgroundRequest<RecipeMaster>('patch', true, recipeMaster, null));
        } else {
          const errMsg = `Sync error: Unknown sync flag method '${syncFlag.method}'`;
          errors.push(this.syncService.constructSyncError(errMsg));
        }
      });

    return { syncRequests: requests, syncErrors: errors };
  }

  /**
   * Process sync successes to update in memory docs
   *
   * @param: syncedData - an array of successfully synced docs; deleted docs
   * will contain a special flag to avoid searching for a removed doc in memory
   *
   * @return: none
   */
  processSyncSuccess(syncData: (RecipeMaster | SyncData<RecipeMaster>)[]): void {
    syncData.forEach((_syncData: (RecipeMaster | SyncData<RecipeMaster>)): void => {
      if (_syncData['isDeleted'] === undefined) {
        const recipeMaster$: BehaviorSubject<RecipeMaster>
          = this.getRecipeMasterById((<RecipeMaster>_syncData).cid);

        if (recipeMaster$ === undefined) {
          this.syncErrors.push({
            errCode: -1,
            message: `Sync error: recipe with id: '${(<RecipeMaster>_syncData).cid}' not found`
          });
        } else {
          this.checkTypeSafety(_syncData);
          recipeMaster$.next(<RecipeMaster>_syncData);
        }
      }
    });

    this.emitListUpdate();
  }

  /**
   * Process all sync flags on login or reconnect; ignore reconnects if not logged in
   *
   * @param: onLogin - true if calling sync at login, false for sync on reconnect
   *
   * @return: none
   */
  syncOnConnection(onLogin: boolean): Observable<boolean> {
    if (!onLogin && !this.userService.isLoggedIn()) {
      return of(false);
    }

    const syncRequests: SyncRequests<RecipeMaster> = this.generateSyncRequests();
    const errors: SyncError[] = syncRequests.syncErrors;
    const requests: Observable<HttpErrorResponse | RecipeMaster | SyncData<RecipeMaster>>[]
      = syncRequests.syncRequests;

    return this.syncService.sync('recipe', requests)
      .pipe(
        map((responses: SyncResponse<RecipeMaster>): boolean => {
          if (!onLogin) {
            this.processSyncSuccess(<(RecipeMaster | SyncData<RecipeMaster>)[]>responses.successes);
            this.updateRecipeStorage();
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
        (): void => console.log('recipe sync on reconnect complete'),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Post all stored recipes to server
   *
   * @param: none
   * @return: none
   */
  syncOnSignup(): void {
    const requests: (Observable<HttpErrorResponse | RecipeMaster>)[] = [];

    const masterList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = this.getMasterList();
    const masterList: BehaviorSubject<RecipeMaster>[] = masterList$.value;
    const user$: BehaviorSubject<User> = this.userService.getUser();

    if (!user$ || !user$.value._id) {
      const message: string = 'Sync error: Cannot find recipe owner\'s id';
      requests.push(throwError(new CustomError('SyncError', message, 2, message)));
    } else {
      masterList.forEach((recipeMaster$: BehaviorSubject<RecipeMaster>): void => {
        const payload: RecipeMaster = recipeMaster$.value;
        payload['owner'] = user$.value._id;
        payload['forSync'] = true;
        requests.push(this.configureBackgroundRequest('post', true, payload, null));
      });
    }

    this.syncService.sync('recipe', requests)
      .pipe(
        finalize(() => this.event.emit('sync-batches-on-signup')),
        map((responses: SyncResponse<RecipeMaster>): boolean => {
          this.processSyncSuccess(<(RecipeMaster | SyncData<RecipeMaster>)[]>responses.successes);
          this.syncErrors = responses.errors;
          this.updateRecipeStorage();
          return true;
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      )
      .subscribe(
        (): void => console.log('sync on signup complete'),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Sync Methods *****/


  /***** Utility methods *****/

  /**
   * Convert new recipe master to a behavior subject then push to master list
   *
   * @param: recipeMaster - the new recipe master
   *
   * @return: observable of new recipe master
   */
  addRecipeMasterToList(recipeMaster: RecipeMaster): Observable<RecipeMaster> {
    const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = this.getMasterList();
    const list: BehaviorSubject<RecipeMaster>[] = list$.value;
    list.push(new BehaviorSubject<RecipeMaster>(recipeMaster));
    list$.next(list);
    this.updateRecipeStorage();
    return of(recipeMaster);
  }

  /**
   * Add a recipe to the recipe master and update behavior subject
   *
   * @param: masterId - recipe's master's id
   * @param: variant - new RecipeVariant to add to a master
   *
   * @return: Observable of new recipe
   */
  addRecipeVariantToMasterInList(
    masterId: string,
    variant: RecipeVariant
  ): Observable<RecipeVariant> {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);

    if (!master$) {
      const message: string = 'An error occurred trying to add a new variant to its master: missing recipe master';
      const additionalMessage: string = `Recipe master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    const master: RecipeMaster = master$.value;

    variant.owner = this.idService.getId(master);
    master.variants.push(variant);

    if (variant.isMaster) {
      this.setRecipeAsMaster(master, master.variants.length - 1);
    }

    master$.next(master);
    this.emitListUpdate();
    this.updateRecipeStorage();

    return of(variant);
  }

  /**
   * Check if able to send an http request
   *
   * @param: [ids] - optional array of ids to check
   *
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
   * Call complete for all recipe subjects and clear recipeMasterList array
   *
   * @param: none
   * @return: none
   */
  clearRecipes(): void {
    const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = this.getMasterList();

    list$.value.forEach((recipeMaster$: BehaviorSubject<RecipeMaster>) => recipeMaster$.complete());
    list$.next([]);

    this.storageService.removeRecipes();
  }

  /**
   * Format a new RecipeMaster from initial values
   *
   * @param: newMasterValues - object with recipe master and initial recipe variant values
   *
   * @return: a new recipe master
   */
  formatNewRecipeMaster(newMasterValues: object): RecipeMaster {
    const user: User = this.userService.getUser().value;

    if (this.idService.getId(user) === undefined) {
      throw new CustomError(
        'RecipeError',
        'Client Validation Error: Missing User ID',
        2,
        'Client Validation Error: Missing User ID'
      );
    }

    const recipeMasterId: string = this.idService.getNewId();
    const initialRecipe: RecipeVariant = newMasterValues['variant'];

    this.setRecipeIds(initialRecipe);

    initialRecipe.isMaster = true;
    initialRecipe.owner = recipeMasterId;

    const masterData: object = newMasterValues['master'];
    const newMaster: RecipeMaster = {
      cid: recipeMasterId,
      name: masterData['name'],
      style: masterData['style'],
      notes: masterData['notes'],
      master: initialRecipe.cid,
      owner: this.idService.getId(user),
      isPublic: false,
      isFriendsOnly: false,
      variants: [ initialRecipe ],
      labelImage: masterData['labelImage']
    };

    return newMaster;
  }

  /**
   * Trigger an emit event of the master list behavior subject
   *
   * @param: none
   * @return: none
   */
  emitListUpdate(): void {
    const masterList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = this.getMasterList();
    masterList$.next(masterList$.value);
  }


  /**
   * Combine hops schedule instances of the same type;
   * if the hops schedule contains two separate additions of the same type of hops (e.g. cascade at
   * 30 minutes and again at 15 minutes), combine the two addition amounts and keep one instance of
   * that type of hops
   *
   * @param: hopsSchedule - the recipe's hops schedule
   *
   * @return: combined hops schedule
   */
  getCombinedHopsSchedule(hopsSchedule: HopsSchedule[]): HopsSchedule[] {
    if (hopsSchedule === undefined) {
      return undefined;
    }

    const combined: HopsSchedule[] = [];

    hopsSchedule.forEach((hops: HopsSchedule): void => {
      const _combined: HopsSchedule = combined
        .find((combinedHops: HopsSchedule): boolean => {
          return hops.hopsType._id === combinedHops.hopsType._id;
        });

      if (_combined === undefined) {
        combined.push(hops);
      } else {
        _combined.quantity += hops.quantity;
      }
    });

    combined.sort((h1: HopsSchedule, h2: HopsSchedule): number => h2.quantity - h1.quantity);

    return combined;
  }

  /**
   * Get a custom error for a missing recipe
   *
   * @param: baseMessage - user accessible error message
   * @param: additionalMessage - additional error text that is not displayed to user
   *
   * @return: custom error
   */
  getMissingError(baseMessage: string, additionalMessage: string = ''): Error {
    return new CustomError(
      'RecipeError',
      `${baseMessage} ${additionalMessage}`,
      2,
      baseMessage
    );
  }

  /**
   * Get a recipe master by its id
   *
   * @param: masterId - recipe master server id or client id string to search
   *
   * @return: the recipe master subject if found, else undefined
   */
  getRecipeMasterById(masterId: string): BehaviorSubject<RecipeMaster> {
    return this.getMasterList().value
      .find((recipeMaster$: BehaviorSubject<RecipeMaster>): boolean => {
        return this.idService.hasId(recipeMaster$.value, masterId);
      });
  }

  /**
   * Get list of recipe masters, fetch from server if list is empty
   *
   * @param: none
   *
   * @return: subject of array of recipe master subjects
   */
  getMasterList(): BehaviorSubject<BehaviorSubject<RecipeMaster>[]> {
    return this.recipeMasterList$;
  }

  /**
   * Get a recipe by its id using its master's id to help search
   *
   * @param: masterId - recipe variant's master's id
   * @param: variantId - recipe variant's id
   *
   * @return: observable of requested recipe variant
   */
  getRecipeVariantById(masterId: string, variantId: string): Observable<RecipeVariant> {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (!master$) {
      const message: string = `An error occurred trying to get variant by id: missing recipe master`;
      const additionalMessage: string = `Recipe master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }
    const master: RecipeMaster = master$.value;

    return of(master.variants.find((variant: RecipeVariant): boolean => this.idService.hasId(variant, variantId)));
  }

  /**
   * Check if there is a process schedule available for a recipe variant. A
   * recipe will have a process if processSchedule has content
   *
   * @param: variant - recipe variant to check for a process
   *
   * @return: true if at least one process is in the schedule
   */
  isRecipeProcessPresent(variant: RecipeVariant): boolean {
    return (
      variant
      && variant.processSchedule !== undefined
      && variant.processSchedule.length > 0
    );
  }

  /**
   * Convert an array of recipe masters into a BehaviorSubject of an array of
   * BehaviorSubjects of recipe masters; concat the current recipe master
   * subjects that have a sync flag.
   *
   * @param: recipeMasterList - array of recipe masters
   *
   * @return: none
   */
  mapRecipeMasterArrayToSubjects(recipeMasterList: RecipeMaster[]): void {
    this.getMasterList().next(this.utilService.toSubjectArray<RecipeMaster>(recipeMasterList));
  }

  /**
   * Remove a recipe variant from a recipe master
   *
   * @param: master$ - the recipe's master subject
   * @param: variantId - recipe variant to remove
   *
   * @return: Observable - success requires no data, using for error throw/handling
   */
  removeRecipeFromMasterInList(masterId: string, variantId: string): Observable<boolean> {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (master$ === undefined) {
      const message: string = `An error occurred trying to remove variant from recipe master: missing recipe master`;
      const additionalMessage: string = `Recipe master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }
    const master: RecipeMaster = master$.value;
    const recipeIndex: number = this.idService.getIndexById(variantId, master.variants);

    if (recipeIndex === -1) {
      const message: string = 'An error occurred trying to remove variant from recipe master: missing recipe variant';
      const additionalMessage: string = `Recipe variant with id ${variantId} from master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    if (master.variants[recipeIndex].isMaster) {
      this.removeRecipeAsMaster(master, recipeIndex);
    }

    master.variants.splice(recipeIndex, 1);

    master$.next(master);
    this.emitListUpdate();
    this.updateRecipeStorage();

    return of(true);
  }

  /**
   * Remove a recipe master and its variants from the master list and update list subject
   *
   * @param: masterId - the recipe master to delete
   *
   * @return: Observable - success requires no data, using for error throw/handling
   */
  removeRecipeMasterFromList(masterId: string): Observable<boolean> {
    const masterList: BehaviorSubject<RecipeMaster>[] = this.getMasterList().value;

    const indexToRemove: number = this.idService.getIndexById(
      masterId,
      this.utilService.getArrayFromSubjects(masterList)
    );

    if (indexToRemove === -1) {
      const message: string = 'An error occurred trying to remove recipe master from list: missing recipe master';
      const additionalMessage: string = `Recipe master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    masterList[indexToRemove].complete();
    masterList.splice(indexToRemove, 1);
    this.emitListUpdate();
    this.updateRecipeStorage();

    return of(true);
  }

  /**
   * Deselect a recipe as the master, set the first recipe variant in the array
   * that is not the currently selected variant as the new master. Do not perform
   * action if there is only one variant
   *
   * @param: recipeMaster - the recipe master that the recipe variant belongs to
   * @param: changeIndex - the index of the recipe master's recipes array which
   * needs to be changed
   *
   * @return: none
   */
  removeRecipeAsMaster(recipeMaster: RecipeMaster, changeIndex: number): void {
    if (recipeMaster.variants.length > 1) {
      recipeMaster.variants[changeIndex].isMaster = false;

      const newMaster: RecipeVariant = recipeMaster.variants[changeIndex === 0 ? 1 : 0];

      newMaster.isMaster = true;
      recipeMaster.master = newMaster._id || newMaster.cid;
    }
  }

  /**
   * Set a recipe variant as the master, deselect previous master
   *
   * @param: recipeMaster - the recipe master that the recipe variant belongs to
   * @param: changeIndex - the index of the recipe master's recipes array which
   * needs to be changed
   *
   * @return: none
   */
  setRecipeAsMaster(recipeMaster: RecipeMaster, changeIndex: number): void {
    recipeMaster.variants
      .forEach((recipe: RecipeVariant, index: number): void => {
        recipe.isMaster = (index === changeIndex);
      });
    recipeMaster.master = recipeMaster.variants[changeIndex].cid;
  }

  /**
   * Populate recipe variant and child property cid fields
   *
   * @param: variant - RecipeVariant to update
   *
   * @return: none
   */
  setRecipeIds(variant: RecipeVariant): void {
    variant.cid = this.idService.getNewId();
    if (variant.grains.length) {
      this.setRecipeNestedIds<GrainBill>(variant.grains);
    }
    if (variant.hops.length) {
      this.setRecipeNestedIds<HopsSchedule>(variant.hops);
    }
    if (variant.yeast.length) {
      this.setRecipeNestedIds<YeastBatch>(variant.yeast);
    }
    if (variant.otherIngredients.length) {
      this.setRecipeNestedIds<OtherIngredients>(variant.otherIngredients);
    }
    if (variant.processSchedule.length) {
      this.setRecipeNestedIds<Process>(variant.processSchedule);
    }
  }

  /**
   * Populate all cid fields of each object in array
   *
   * @param: itemArray - array of objects that require a cid field
   *
   * @return: none
   */
  setRecipeNestedIds<T>(itemArray: T[]): void {
    itemArray.forEach((item: T): void => { item['cid'] = this.idService.getNewId(); });
  }

  /**
   * Store the current recipe master list in storage
   *
   * @param: none
   * @return: none
   */
  updateRecipeStorage(): void {
    this.storageService.setRecipes(
      this.getMasterList()
        .value
        .map((recipeMaster$: BehaviorSubject<RecipeMaster>): RecipeMaster => recipeMaster$.value)
    )
    .subscribe(
      (): void => console.log('stored recipes'),
      (error: any): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Update a recipe master subject in the master list
   *
   * @param: masterId - id of recipe master to update
   * @param: update - update may be either a complete or partial RecipeMaster
   *
   * @return: Observable of updated recipe master
   */
  updateRecipeMasterInList(masterId: string, update: RecipeMaster): Observable<RecipeMaster> {
    console.log('updating recipe master in list', masterId, update);
    this.checkTypeSafety(update);

    const recipeMaster$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (!recipeMaster$) {
      const message: string = 'An error occurred trying to update recipe master: missing recipe master';
      const additionalMessage: string = `Recipe master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    recipeMaster$.next(update);
    this.emitListUpdate();
    this.updateRecipeStorage();

    return of(recipeMaster$.value);
  }

  /**
   * Update a recipe variant within a recipe master in list and update the subject
   *
   * @param: masterId - recipe master of variant
   * @param: variantId - recipe variant id to update
   * @param: update - may be either a complete or partial RecipeVariant
   *
   * @return: Observable of updated recipe
   */
  updateRecipeVariantOfMasterInList(
    masterId: string,
    variantId: string,
    update: RecipeVariant | object
  ): Observable<RecipeVariant> {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (!master$) {
      const message: string = 'An error occurred trying to update variant from recipe master: missing recipe master';
      const additionalMessage: string = `Recipe master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }
    const master: RecipeMaster = master$.value;

    const recipeIndex: number = this.idService.getIndexById(variantId, master.variants);
    if (recipeIndex === -1) {
      const message: string = 'An error occurred trying to update variant from recipe master: missing recipe variant';
      const additionalMessage: string = `Recipe variant with id ${variantId} from master with id ${masterId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }
    const variant: RecipeVariant = master.variants[recipeIndex];

    if (update.hasOwnProperty('isMaster')) {
      if (update['isMaster']) {
        this.setRecipeAsMaster(master, recipeIndex);
      } else if (!update['isMaster'] && variant.isMaster) {
        this.removeRecipeAsMaster(master, recipeIndex);
      }
    }

    for (const key in update) {
      if (update.hasOwnProperty(key)) {
        variant[key] = update[key];
      }
    }

    this.checkTypeSafety(variant);

    master$.next(master);
    this.emitListUpdate();
    this.updateRecipeStorage();

    return of(variant);
  }

  /***** End utility methods *****/


  /***** Type Guard *****/

  /**
   * Check types of recipe master or variant properties; throw appropriate error if recipe is unsafe
   *
   * @param: recipe - expected to be either RecipeMaster or RecipeVariant, but can check any,
   *
   * @return: none
   */
  checkTypeSafety(recipe: any): void {
    const isRecipeMaster: boolean = recipe && recipe.hasOwnProperty('variants');
    if (isRecipeMaster && !this.isSafeRecipeMaster(recipe)) {
      throw this.getUnsafeRecipeError(recipe, 'master');
    } else if (!isRecipeMaster && !this.isSafeRecipeVariant(recipe)) {
      throw this.getUnsafeRecipeError(recipe, 'variant');
    }
  }

  /**
   * Throw a custom error when an invalid recipe is encountered
   *
   * @param: thrownFor - given recipe object that failed validation
   *
   * @return: custom invalid recipe error
   */
  getUnsafeRecipeError(thrownFor: any, recipeType: string): Error {
    return new CustomError(
      'RecipeError',
      `Given ${recipeType} is invalid: got ${JSON.stringify(thrownFor, null, 2)}`,
      2,
      `An internal error occurred: invalid ${recipeType}`
    );
  }

  /**
   * Get the process type specific document type guard
   *
   * @param: processType - the specific type of process to check: either 'manual', 'timer', or 'calendar'
   *
   * @return: the combined common and specific process type guard data
   */
  getDocumentGuardByType(processType: string): DocumentGuard {
    let SpecificValidations: DocumentGuard;

    if (processType === 'manual') {
      SpecificValidations = ManualProcessGuardMetadata;
    } else if (processType === 'timer') {
      SpecificValidations = TimerProcessGuardMetadata;
    } else if (processType === 'calendar') {
      SpecificValidations = CalendarProcessGuardMetadata;
    } else {
      throw new CustomError(
        'TypeGuardError',
        `Invalid process type on type guard validation: ${processType}`,
        2,
        'An internal check error occurred, Process is malformed'
      );
    }

    return this.typeGuard.concatGuards(ProcessGuardMetadata, SpecificValidations);
  }

  /**
   * Check if array of grain bills correctly implement the GrainBill interface
   *
   * @param: grainBill - expects an array of GrainBill objects
   *
   * @return: true if all items in array correctly implement GrainBill
   */
  isSafeGrainBillCollection(grainBill: GrainBill[]): boolean {
    return grainBill.every((grainBillInstance: GrainBill): boolean => {
      return this.isSafeGrainBill(grainBillInstance);
    });
  }

  /**
   * Check if grain bill correctly implement the GrainBill interface
   *
   * @param: grainBill - expects a GrainBill objects
   *
   * @return: true if object correctly implement GrainBill
   */
  isSafeGrainBill(grainBill: GrainBill): boolean {
    return (
      this.typeGuard.hasValidProperties(grainBill, GrainBillGuardMetadata)
      && this.libraryService.isSafeGrains(grainBill.grainType)
    );
  }

  /**
   * Check if array of hops schedule correctly implement the HopsSchedule interface
   *
   * @param: hopsSchedule - expects an array of HopsSchedule objects
   *
   * @return: true if all items in array correctly implement HopsSchedule
   */
  isSafeHopsScheduleCollection(hopsSchedule: HopsSchedule[]): boolean {
    return hopsSchedule.every((hopsScheduleInstance: HopsSchedule): boolean => {
      return this.isSafeHopsSchedule(hopsScheduleInstance);
    });
  }

  /**
   * Check if hops schedule correctly implement the HopsSchedule interface
   *
   * @param: hopsSchedule - expects a HopsSchedule objects
   *
   * @return: true if object correctly implement HopsSchedule
   */
  isSafeHopsSchedule(hopsSchedule: HopsSchedule): boolean {
    return (
      this.typeGuard.hasValidProperties(hopsSchedule, HopsScheduleGuardMetadata)
      && this.libraryService.isSafeHops(hopsSchedule.hopsType)
    );
  }

  /**
   * Check if other ingredients correctly implement the OtherIngredients interface
   *
   * @param: otherIngredients - expects a OtherIngredients objects
   *
   * @return: true if object correctly implement OtherIngredients
   */
  isSafeOtherIngredientsCollection(otherIngredients: OtherIngredients[]): boolean {
    return otherIngredients.every((otherIngredientsInstance: OtherIngredients): boolean => {
      return this.isSafeOtherIngredients(otherIngredientsInstance);
    });
  }

  /**
   * Check if other ingredients correctly implement the OtherIngredients interface
   *
   * @param: otherIngredients - expects a OtherIngredients objects
   *
   * @return: true if object correctly implement OtherIngredients
   */
  isSafeOtherIngredients(otherIngredients: OtherIngredients): boolean {
    return this.typeGuard.hasValidProperties(otherIngredients, OtherIngredientsGuardMetadata);
  }

  /**
   * Check if given process schedule array is valid by correctly implementing the Process interface
   * as well as the appropriate extended interface defined by the type property
   *
   * @param: schedule - expects array of Process objects at runtime
   *
   * @return: true if all processes within schedule implements the Process interface as well as their
   *          individual extended interface
   */
  isSafeProcessSchedule(schedule: Process[]): boolean {
    return schedule.every((process: Process): boolean => {
      const validation: DocumentGuard = this.getDocumentGuardByType(process.type);
      return this.typeGuard.hasValidProperties(process, validation);
    });
  }

  /**
   * Check if given recipe object is valid by correctly implementing the RecipeMaster interface
   *
   * @param: recipe - expects a RecipeMaster at runtime
   *
   * @return: true if given recipe correctly implements RecipeMaster interface
   */
  isSafeRecipeMaster(recipe: any): boolean {
    if (!this.typeGuard.hasValidProperties(recipe, RecipeMasterGuardMetadata)) {
      return false;
    }
    if (recipe.labelImage && !this.imageService.isSafeImage(recipe.labelImage)) {
      return false;
    }
    if (!this.libraryService.isSafeStyle(recipe.style)) {
      return false;
    }
    if (!recipe.variants.every((variant: RecipeVariant): boolean => this.isSafeRecipeVariant(variant))) {
      return false;
    }
    return true;
  }

  /**
   * Check if given recipe object is valid by correctly implementing the RecipeVariant interface
   *
   * @param: recipe - expects a RecipeVariant at runtime
   *
   * @return: true if given recipe correctly implements RecipeVariant interface
   */
  isSafeRecipeVariant(recipe: any): boolean {
    if (!this.typeGuard.hasValidProperties(recipe, RecipeVariantGuardMetadata)) {
      return false;
    }
    if (!this.isSafeGrainBillCollection(recipe.grains)) {
      return false;
    }
    if (!this.isSafeHopsScheduleCollection(recipe.hops)) {
      return false;
    }
    if (!this.isSafeYeastBatchCollection(recipe.yeast)) {
      return false;
    }
    if (!this.isSafeOtherIngredientsCollection(recipe.otherIngredients)) {
      return false;
    }
    if (!this.isSafeProcessSchedule(recipe.processSchedule)) {
      return false;
    }
    return true;
  }

  /**
   * Check if array of yeast batch correctly implement the YeastBatch interface
   *
   * @param: yeastBatch - expects an array of YeastBatch objects
   *
   * @return: true if all items in array correctly implement YeastBatch
   */
  isSafeYeastBatchCollection(yeastBatch: YeastBatch[]): boolean {
    return yeastBatch.every((yeastBatchInstance: YeastBatch): boolean => {
      return this.isSafeYeastBatch(yeastBatchInstance);
    });
  }

  /**
   * Check if yeast batch correctly implement the YeastBatch interface
   *
   * @param: yeastBatch - expects a YeastBatch objects
   *
   * @return: true if object correctly implement YeastBatch
   */
  isSafeYeastBatch(yeastBatch: YeastBatch): boolean {
    return (
      this.typeGuard.hasValidProperties(yeastBatch, YeastBatchGuardMetadata)
      && this.libraryService.isSafeYeast(yeastBatch.yeastType)
    );
  }

  /**** End Type Guard *****/

}
