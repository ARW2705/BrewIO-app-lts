/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concat, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, finalize, tap } from 'rxjs/operators';

/* Constants imports */
import { API_VERSION } from '../../shared/constants/api-version';
import { BASE_URL } from '../../shared/constants/base-url';

/* Interface imports */
import { Author } from '../../shared/interfaces/author';
import { GrainBill } from '../../shared/interfaces/grain-bill';
import { HopsSchedule } from '../../shared/interfaces/hops-schedule';
import { Image, ImageRequestFormData, ImageRequestMetadata } from '../../shared/interfaces/image';
import { OtherIngredients } from '../../shared/interfaces/other-ingredients';
import { Process } from '../../shared/interfaces/process';
import { RecipeMaster } from '../../shared/interfaces/recipe-master';
import { RecipeVariant } from '../../shared/interfaces/recipe-variant';
import { SyncData, SyncError, SyncMetadata, SyncRequests, SyncResponse } from '../../shared/interfaces/sync';
import { User } from '../../shared/interfaces/user';
import { YeastBatch } from '../../shared/interfaces/yeast-batch';

/* Utility function imports */
import { getId, getIndexById, hasDefaultIdType, hasId, isMissingServerId } from '../../shared/utility-functions/id-helpers';
import { getArrayFromSubjects, toSubjectArray } from '../../shared/utility-functions/subject-helpers';

/* Default imports */
import { defaultImage } from '../../shared/defaults/default-image';

/* Service imports */
import { ClientIdService } from '../client-id/client-id.service';
import { ConnectionService } from '../connection/connection.service';
import { EventService } from '../event/event.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { ImageService } from '../image/image.service';
import { StorageService } from '../storage/storage.service';
import { SyncService } from '../sync/sync.service';
import { ToastService } from '../toast/toast.service';
import { UserService } from '../user/user.service';


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
    public http: HttpClient,
    public clientIdService: ClientIdService,
    public connectionService: ConnectionService,
    public event: EventService,
    public httpError: HttpErrorService,
    public imageService: ImageService,
    public storageService: StorageService,
    public syncService: SyncService,
    public toastService: ToastService,
    public userService: UserService
  ) {
    this.registerEvents();
  }

  /***** Initializations *****/

  /**
   * Perform any pending sync operations first then fetch recipes
   * On completion, emit event to trigger batch init
   *
   * @params: none
   * @return: none
   */
  initFromServer(): void {
    concat(
      this.syncOnConnection(true),
      this.http.get<RecipeMaster[]>(`${BASE_URL}/${API_VERSION}/recipes/private`)
        .pipe(
          tap((recipeMasterArrayResponse: RecipeMaster[]): void => {
            console.log('recipes from server');
            this.mapRecipeMasterArrayToSubjects(recipeMasterArrayResponse);
            this.updateRecipeStorage();
          }),
          catchError((error: HttpErrorResponse): Observable<never> => {
            return this.httpError.handleError(error);
          })
        )
    )
    .pipe(finalize(() => this.event.emit('init-batches')))
    .subscribe(
      (): void => {},
      (error: string): void => console.log(`Initialization message: ${error}`)
    );
  }

  /**
   * Get recipes from storage - use these recipes if there has not been a server response
   *
   * @params: none
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
        (error: string): void => console.log(`${error}: awaiting data from server`)
      );
  }

  /**
   * Get recipe masters
   *
   * @params: none
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
   * @params: none
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
   * @params: masterId - recipe master to use as base for user search
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

      if (hasId(user, master.owner)) {
        return of({
          username: user.username,
          userImage: user.userImage,
          breweryLabelImage: user.breweryLabelImage
        });
      }

      if (hasDefaultIdType(searchId)) {
        searchId = master._id;
        if (searchId === undefined) {
          return throwError('Missing server id');
        }
      }

      return this.http.get<Author>(
        `${BASE_URL}/${API_VERSION}/recipes/public/master/${searchId}/author`
      )
      .pipe(
        catchError((error: HttpErrorResponse): Observable<Author> => {
          console.log('Error fetching author', error);
          return of(author);
        })
      );
    } catch (error) {
      console.log('Error finding recipe', error);
      return of(author);
    }
  }

  /**
   * Get a public recipe master by its id
   *
   * @params: masterId - recipe master id string to search
   *
   * @return: Observable of recipe master
   */
  getPublicRecipeMasterById(masterId: string): Observable<RecipeMaster> {
    return this.http.get<RecipeMaster>(
      `${BASE_URL}/${API_VERSION}/recipes/public/master/${masterId}`
    )
    .pipe(catchError((error: HttpErrorResponse): Observable<never> => {
      return this.httpError.handleError(error);
    }));
  }

  /**
   * Get all public recipe masters owned by a user
   *
   * @params: userId - user id string to search
   *
   * @return: Observable of an array of recipe masters
   */
  getPublicRecipeMasterListByUser(userId: string): Observable<RecipeMaster[]> {
    return this.http.get<RecipeMaster[]>(`${BASE_URL}/${API_VERSION}/recipes/public/${userId}`)
      .pipe(catchError((error: HttpErrorResponse): Observable<never> => {
        return this.httpError.handleError(error);
      }));
  }

  /**
   * Get a public recipe variant by its id
   *
   * @params: masterId - recipe master id which requested recipe belongs
   * @params: variantId - recipe id string to search
   *
   * @return: Observable of recipe
   */
  getPublicRecipeVariantById(masterId: string, variantId: string): Observable<RecipeVariant> {
    return this.http.get<RecipeVariant>(
      `${BASE_URL}/${API_VERSION}/recipes/public/master/${masterId}/variant/${variantId}`
    )
    .pipe(catchError((error: HttpErrorResponse): Observable<never> => {
      return this.httpError.handleError(error);
    }));
  }

  /***** END Public API *****/


  /***** Private API *****/

  /**
   * Create a new recipe master and initial variant
   *
   * @params: newMasterValues - object with data to construct
   * recipe master and an initial recipe variant
   *
   * @return: observable of new recipe master
   */
  createRecipeMaster(newMasterValues: object): Observable<RecipeMaster> {
    try {
      const newMaster: RecipeMaster = this.formatNewRecipeMaster(newMasterValues);

      return this.imageService.storeImageToLocalDir(newMaster.labelImage)
        .pipe(
          mergeMap((): Observable<RecipeMaster> => this.addRecipeMasterToList(newMaster)),
          tap(() => {
            if (this.canSendRequest()) {
              this.requestInBackground('post', newMaster);
            } else {
              this.addSyncFlag('create', newMaster.cid);
            }
          })
        );
    } catch (error) {
      return throwError(error.message);
    }
  }

  /**
   * Create a new recipe variant
   *
   * @params: masterId - recipe master id to add variant to
   * @params: variant - the new RecipeVariant to add
   *
   * @return: observable of new variant
   */
  createRecipeVariant(masterId: string, recipeVariant: RecipeVariant): Observable<RecipeVariant> {
    const recipeMaster$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (!recipeMaster$) {
      return throwError(`Recipe master with id ${masterId} not found`);
    }
    const recipeMaster: RecipeMaster = recipeMaster$.value;

    this.setRecipeIds(recipeVariant);

    return this.addRecipeVariantToMasterInList(masterId, recipeVariant)
      .pipe(
        tap(() => {
          if (this.canSendRequest([masterId])) {
            this.requestInBackground('post', recipeMaster, recipeVariant);
          } else {
            this.addSyncFlag('update', masterId);
          }
        })
      );
  }

  /**
   * Remove a recipe master and its variants
   *
   * @params: masterId - if of recipe master to delete
   *
   * @return: observable resulting data not required; using for error throw/handling
   */
  removeRecipeMasterById(masterId: string): Observable<boolean> {
    const recipeMaster$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (!recipeMaster$) {
      return throwError('Master recipe not found');
    }

    const recipeMaster: RecipeMaster = recipeMaster$.value;

    return this.removeRecipeMasterFromList(masterId)
      .pipe(
        tap((): void => {
          if (recipeMaster.labelImage && !this.imageService.hasDefaultImage(recipeMaster.labelImage)) {
            this.imageService.deleteLocalImage(recipeMaster.labelImage.filePath)
              .subscribe((errMsg: string) => console.log('image deletion', errMsg));
          }

          if (this.canSendRequest([masterId])) {
            this.requestInBackground('delete', recipeMaster);
          } else {
            this.addSyncFlag('delete', masterId);
          }
        })
      );
  }

  /**
   * Remove a recipe variant from its parent
   *
   * @params: masterId - recipe variant's master's id
   * @params: variantId - id of variant to delete
   *
   * @return: observable resulting data not required; using for error throw/handling
   */
  removeRecipeVariantById(masterId: string, variantId: string): Observable<boolean> {
    const recipeMaster$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (!recipeMaster$) {
      return throwError('Variant\'s master recipe not found');
    }

    const recipeMaster: RecipeMaster = recipeMaster$.value;
    const recipeVariant: RecipeVariant = recipeMaster.variants
      .find((variant: RecipeVariant): boolean => {
        return hasId(variant, variantId);
      });

    return this.removeRecipeFromMasterInList(masterId, variantId)
      .pipe(
        tap((): void => {
          if (this.canSendRequest([masterId])) {
            this.requestInBackground('delete', recipeMaster, recipeVariant);
          } else {
            this.addSyncFlag('update', masterId);
          }
        })
      );
  }

  /**
   * Update a recipe master
   *
   * @params: masterId - recipe master's id
   * @params: update - object containing update data
   *
   * @return: observable of updated recipe master
   */
  updateRecipeMasterById(masterId: string, update: object): Observable<RecipeMaster> {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);

    if (!master$) {
      return throwError(`Update error: Recipe master with id ${masterId} not found`);
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
        })
      );
  }

  /**
   * Update a recipe variant
   *
   * @params: masterId - if of recipe variant's parent master
   * @params: variantId - if of variant to update
   * @params: update - object containing update data
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
          const recipeMaster$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
          const recipeMaster: RecipeMaster = recipeMaster$.value;

          if (this.canSendRequest([masterId, variantId])) {
            this.requestInBackground('patch', recipeMaster, recipeVariant);
          } else {
            this.addSyncFlag('update', masterId);
          }
        })
      );
  }

  /***** END private API *****/


  /***** Background Server Update Methods *****/

  /**
   * Configure a background request while defining which error handling method to use
   *
   * @params: syncMethod - the http method to apply
   * @params: recipeMaster - the RecipeMaster to use in request
   * @params: shouldResolveError - true if error should return the error response as an observable
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
   * @params: syncMethod - the http method: 'post', 'patch', and 'delete' are valid
   * @params: recipeMaster - the recipe master to base the request on
   * @params: [recipeVariant] - optional recipe variant to base the request on
   * @params: [deletionId] - optional id for deletion if client side doc has already been deleted
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
      imageRequest.push({ image: recipeMaster['labelImage'], name: 'labelImage'});
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
          } else {
            return throwError('Invalid http method');
          }
        })
      );
  }

  /**
   * Handle updating client doc with server response
   *
   * @params: masterId - recipe master's id to update or variant's master's id
   * @params: variantId - recipe variant id to update
   * @params: recipeResponse - the updated recipe master or variant
   *
   * @return: observable of the updated recipe master or variant
   */
  handleBackgroundUpdateResponse(
    masterId: string,
    variantId: string,
    recipeResponse: RecipeMaster | RecipeVariant
  ): Observable<RecipeMaster | RecipeVariant> {
    if (!variantId) {
      return this.updateRecipeMasterInList(masterId, <RecipeMaster>recipeResponse);
    }
    return this.updateRecipeVariantOfMasterInList(masterId, variantId, <RecipeVariant>recipeResponse);
  }

  /**
   * Update server in background
   *
   * @params: syncMethod - the http method to apply
   * @params: recipeMaster - the RecipeMaster to base request on
   * @params: [recipeVariant] - optional RecipeVariant to base request on
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
      syncRequest = throwError('Unknown sync type');
    }

    syncRequest
      .pipe(
        map((recipeResponse: RecipeMaster | RecipeVariant): Observable<RecipeMaster | RecipeVariant> => {
          const variantId: string = recipeVariant ? recipeVariant.cid : null;
          return this.handleBackgroundUpdateResponse(recipeMaster.cid, variantId, recipeResponse);
        }),
        catchError((error: HttpErrorResponse): Observable<never> => {
          if (!(error instanceof HttpErrorResponse)) {
            return throwError(error);
          }
          return this.httpError.handleError(error);
        })
      )
      .subscribe(
        (): void => console.log(`Recipe: background ${syncMethod} request successful`),
        (error: string): void => {
          console.log(`Recipe: background ${syncMethod} request error`, error);
          this.toastService.presentErrorToast('Recipe: update failed to save to server');
        }
      );
  }

  /***** End Background Server Update Methods *****/


  /***** Sync Methods *****/

  /**
   * Add a sync flag for a recipe
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
      docType: 'recipe'
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
   * @params: index - error array index to remove
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

        if (hasDefaultIdType(recipeMaster.owner)) {
          const user$: BehaviorSubject<User> = this.userService.getUser();

          if (user$ === undefined || user$.value._id === undefined) {
            const errMsg: string = 'Sync error: Cannot get recipe owner\'s id';
            errors.push(this.syncService.constructSyncError(errMsg));
            return;
          }
          recipeMaster.owner = user$.value._id;
        }

        if (syncFlag.method === 'update' && isMissingServerId(recipeMaster._id)) {
          const errMsg: string = `Recipe with id: ${recipeMaster.cid} is missing its server id`;
          errors.push(this.syncService.constructSyncError(errMsg));
        } else if (syncFlag.method === 'create') {
          recipeMaster['forSync'] = true;
          requests.push(this.configureBackgroundRequest<RecipeMaster>('post', true, recipeMaster, null));
        } else if (syncFlag.method === 'update' && !isMissingServerId(recipeMaster._id)) {
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
   * @params: syncedData - an array of successfully synced docs; deleted docs
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
          recipeMaster$.next(<RecipeMaster>_syncData);
        }
      }
    });

    this.emitListUpdate();
  }

  /**
   * Process all sync flags on login or reconnect; ignore reconnects if not logged in
   *
   * @params: onLogin - true if calling sync at login, false for sync on reconnect
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
        (): void => console.log('sync on reconnect complete'),
        (error: string): void => {
          // TODO error feedback (toast?)
          console.log(`${error}: error on reconnect sync`);
          this.toastService.presentErrorToast('Error syncing recipes with server');
        }
      );
  }

  /**
   * Post all stored recipes to server
   *
   * @params: none
   * @return: none
   */
  syncOnSignup(): void {
    const requests: (Observable<HttpErrorResponse | RecipeMaster>)[] = [];

    const masterList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = this.getMasterList();
    const masterList: BehaviorSubject<RecipeMaster>[] = masterList$.value;
    const user$: BehaviorSubject<User> = this.userService.getUser();

    if (user$ === undefined || user$.value._id === undefined) {
      requests.push(throwError('Sync error: Cannot get recipe owner\'s id'));
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
        })
      )
      .subscribe(
        (): void => console.log('sync on signup complete'),
        (error: string): void => {
          console.log('Recipe sync error; continuing other sync events', error);
          this.toastService.presentErrorToast('Error syncing recipes with server');
        }
      );
  }

  /***** End Sync Methods *****/


  /***** Utility methods *****/

  /**
   * Convert new recipe master to a behavior subject then push to master list
   *
   * @params: recipeMaster - the new recipe master
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
   * @params: masterId - recipe's master's id
   * @params: variant - new RecipeVariant to add to a master
   *
   * @return: Observable of new recipe
   */
  addRecipeVariantToMasterInList(
    masterId: string,
    variant: RecipeVariant
  ): Observable<RecipeVariant> {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);

    if (!master$) {
      return throwError(`Recipe master with id ${masterId} not found`);
    }

    const master: RecipeMaster = master$.value;

    variant.owner = getId(master);
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
   * Call complete for all recipe subjects and clear recipeMasterList array
   *
   * @params: none
   * @return: none
   */
  clearRecipes(): void {
    this.getMasterList().value
      .forEach((recipeMaster$: BehaviorSubject<RecipeMaster>) => {
        recipeMaster$.complete();
      });
    this.getMasterList().next([]);
    this.storageService.removeRecipes();
  }

  /**
   * Format a new RecipeMaster from initial values
   *
   * @params: newMasterValues - object with recipe master and initial recipe variant values
   *
   * @return: a new recipe master
   */
  formatNewRecipeMaster(newMasterValues: object): RecipeMaster {
    const user: User = this.userService.getUser().value;

    if (getId(user) === undefined) {
      throw new Error('Client Validation Error: Missing User ID');
    }

    const recipeMasterId: string = this.clientIdService.getNewId();
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
      owner: getId(user),
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
   * @params: none
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
   * @params: hopsSchedule - the recipe's hops schedule
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
   * Get a recipe master by its id
   *
   * @params: masterId - recipe master server id or client id string to search
   *
   * @return: the recipe master subject if found, else undefined
   */
  getRecipeMasterById(masterId: string): BehaviorSubject<RecipeMaster> {
    return this.getMasterList().value
      .find((recipeMaster$: BehaviorSubject<RecipeMaster>): boolean => {
        return hasId(recipeMaster$.value, masterId);
      });
  }

  /**
   * Get list of recipe masters, fetch from server if list is empty
   *
   * @params: none
   *
   * @return: subject of array of recipe master subjects
   */
  getMasterList(): BehaviorSubject<BehaviorSubject<RecipeMaster>[]> {
    return this.recipeMasterList$;
  }

  /**
   * Get a recipe by its id using its master's id to help search
   *
   * @params: masterId - recipe variant's master's id
   * @params: variantId - recipe variant's id
   *
   * @return: observable of requested recipe variant
   */
  getRecipeVariantById(masterId: string, variantId: string): Observable<RecipeVariant> {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (!master$) {
      return throwError(`Recipe master with id ${masterId} not found`);
    }
    const master: RecipeMaster = master$.value;

    return of(master.variants.find((variant: RecipeVariant): boolean => hasId(variant, variantId)));
  }

  /**
   * Check if there is a process schedule available for a recipe variant. A
   * recipe will have a process if processSchedule has content
   *
   * @params: variant - recipe variant to check for a process
   *
   * @return: true if at least one process is in the schedule
   */
  isRecipeProcessPresent(variant: RecipeVariant): boolean {
    return variant
      && variant.processSchedule !== undefined
      && variant.processSchedule.length > 0;
  }

  /**
   * Convert an array of recipe masters into a BehaviorSubject of an array of
   * BehaviorSubjects of recipe masters; concat the current recipe master
   * subjects that have a sync flag.
   *
   * @params: recipeMasterList - array of recipe masters
   *
   * @return: none
   */
  mapRecipeMasterArrayToSubjects(recipeMasterList: RecipeMaster[]): void {
    this.getMasterList().next(toSubjectArray<RecipeMaster>(recipeMasterList));
  }

  /**
   * Remove a recipe variant from a recipe master
   *
   * @params: master$ - the recipe's master subject
   * @params: variantId - recipe variant to remove
   *
   * @return: Observable - success requires no data, using for error throw/handling
   */
  removeRecipeFromMasterInList(masterId: string, variantId: string): Observable<boolean> {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (master$ === undefined) {
      return throwError(`Recipe master with id ${masterId} not found`);
    }
    const master: RecipeMaster = master$.value;
    const recipeIndex: number = getIndexById(variantId, master.variants);

    if (recipeIndex === -1) {
      return throwError(`Delete error: recipe with id ${variantId} not found`);
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
   * @params: masterId - the recipe master to delete
   *
   * @return: Observable - success requires no data, using for error throw/handling
   */
  removeRecipeMasterFromList(masterId: string): Observable<boolean> {
    const masterList: BehaviorSubject<RecipeMaster>[] = this.getMasterList().value;

    const indexToRemove: number = getIndexById(
      masterId,
      getArrayFromSubjects(masterList)
    );

    if (indexToRemove === -1) {
      return throwError(`Delete error: Recipe master with id ${masterId} not found`);
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
   * @params: recipeMaster - the recipe master that the recipe variant belongs to
   * @params: changeIndex - the index of the recipe master's recipes array which
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
   * @params: recipeMaster - the recipe master that the recipe variant belongs to
   * @params: changeIndex - the index of the recipe master's recipes array which
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
   * @params: variant - RecipeVariant to update
   *
   * @return: none
   */
  setRecipeIds(variant: RecipeVariant): void {
    variant.cid = this.clientIdService.getNewId();
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
   * @params: itemArray - array of objects that require a cid field
   *
   * @return: none
   */
  setRecipeNestedIds<T>(itemArray: T[]): void {
    itemArray.forEach((item: T): void => { item['cid'] = this.clientIdService.getNewId(); });
  }

  /**
   * Store the current recipe master list in storage
   *
   * @params: none
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
      (error: string): void => console.log(`recipe store error: ${error}`)
    );
  }

  /**
   * Update a recipe master subject in the master list
   *
   * @params: masterId - id of recipe master to update
   * @params: update - update may be either a complete or partial RecipeMaster
   *
   * @return: Observable of updated recipe master
   */
  updateRecipeMasterInList(masterId: string, update: RecipeMaster): Observable<RecipeMaster> {
    console.log('updating recipe master in list', masterId, update);

    const recipeMaster$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (!recipeMaster$) {
      return throwError(`Update error: Recipe master with id ${masterId} not found`);
    }

    recipeMaster$.next(update);
    this.emitListUpdate();
    this.updateRecipeStorage();

    return of(recipeMaster$.value);
  }

  /**
   * Update a recipe variant within a recipe master in list and update the subject
   *
   * @params: masterId - recipe master of variant
   * @params: variantId - recipe variant id to update
   * @params: update - may be either a complete or partial RecipeVariant
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
      return throwError(`Recipe master with id ${masterId} not found`);
    }
    const master: RecipeMaster = master$.value;

    const recipeIndex: number = getIndexById(variantId, master.variants);
    if (recipeIndex === -1) {
      return throwError(`Recipe with id ${variantId} not found`);
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

    master$.next(master);
    this.emitListUpdate();
    this.updateRecipeStorage();

    return of(variant);
  }

  /***** End utility methods *****/

}
