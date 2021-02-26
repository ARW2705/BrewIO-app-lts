/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concat, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, finalize } from 'rxjs/operators';

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
import { getArrayFromObservables } from '../../shared/utility-functions/observable-helpers';

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
   * Retrieve recipes from server; perform any pending sync operations first, then fetch recipes;
   * create recipe master subjects, then populate recipeMasterList
   *
   * @params: none
   * @return: none
   */
  initFromServer(): void {
    concat(
      this.syncOnConnection(true),
      this.http.get(`${BASE_URL}/${API_VERSION}/recipes/private`)
        .pipe(
          map((recipeMasterArrayResponse: Array<RecipeMaster>): void => {
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
   * Retrieve recipes from storage; create recipe master subjects, then populate recipeMasterList
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
   * Get all recipe masters for user from storage and/or server
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
    this.event.register('init-recipes')
      .subscribe((): void => this.initializeRecipeMasterList());
    this.event.register('clear-data')
      .subscribe((): void => this.clearRecipes());
    this.event.register('sync-recipes-on-signup')
      .subscribe((): void => this.syncOnSignup());
    this.event.register('connected')
      .subscribe((): void => this.syncOnReconnect());
  }

  /***** End Initializations *****/

  /***** Public api access methods *****/

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
      const master$: BehaviorSubject<RecipeMaster>
        = this.getRecipeMasterById(searchId);

      const user$: BehaviorSubject<User> = this.userService.getUser();
      const user: User = user$.value;

      if (hasId(user, master$.value.owner)) {
        return of({
          username: user.username,
          userImage: user.userImage,
          breweryLabelImage: user.breweryLabelImage
        });
      }

      if (hasDefaultIdType(searchId)) {
        searchId = master$.value._id;
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
      .pipe(
        catchError((error: HttpErrorResponse): Observable<never> => {
          return this.httpError.handleError(error);
        })
      );
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
    .pipe(
      catchError((error: HttpErrorResponse): Observable<never> => {
        return this.httpError.handleError(error);
      })
    );
  }

  /***** END public api access methods *****/


  /***** Private api access methods *****/

  /**
   * Delete a recipe master and its variants; then update database if logged in
   * and connected to internet or flag for sync otherwise
   *
   * @params: masterId - recipe master id string to search and delete
   *
   * @return: Observable - success does not need data, using for error throw/handling
   */
  deleteRecipeMasterById(masterId: string): Observable<boolean> {
    if (this.canSendRequest([masterId])) {
      this.deleteMasterInBackground(masterId);
    } else {
      this.addSyncFlag('delete', masterId);
    }
    return this.removeRecipeMasterFromList(masterId);
  }

  /**
   * Delete a recipe variant from its master; then update database if logged in and
   * connected to internet or flag for sync otherwise
   *
   * @params: masterId - recipe's master's id
   * @params: variantId - recipe id to delete
   *
   * @return: Observable - success does not need data, using for error throw/handling
   */
  deleteRecipeVariantById(masterId: string, variantId: string): Observable<boolean> {
    if (this.canSendRequest([masterId, variantId])) {
      this.deleteVariantInBackground(masterId, variantId);
    } else {
      this.addSyncFlag('update', masterId);
    }
    return this.removeRecipeFromMasterInList(masterId, variantId);
  }

  /**
   * Update a recipe master; then update database if logged in and connected to
   * internet or flag for sync otherwise
   *
   * @params: masterId - recipe master id string to search
   * @params: update - object containing update data
   *
   * @return: observable of updated recipe master
   */
  patchRecipeMasterById(masterId: string, update: object): Observable<RecipeMaster> {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);

    if (master$ === undefined) {
      return throwError(`Update error: Recipe master with id ${masterId} not found`);
    }

    const master: RecipeMaster = master$.value;

    const previousImagePath: string = master.labelImage.filePath;
    const isTemp: boolean = this.imageService.isTempImage(master.labelImage);
    const hasPending = this.imageService.hasPendingImage(master, update, 'labelImage');

    for (const key in update) {
      if (master.hasOwnProperty(key) && key !== 'variants') {
        master[key] = update[key];
      }
    }

    let storeImage: Observable<Image>;
    if (hasPending) {
      storeImage = this.imageService.storeFileToLocalDir(
        update['labelImage'],
        isTemp ? null : previousImagePath
      );
    } else {
      storeImage = of(null);
    }

    return storeImage
      .pipe(
        mergeMap((): Observable<RecipeMaster> => {
          if (this.canSendRequest([masterId])) {
            this.patchMasterInBackground(masterId, update, hasPending);
          } else {
            this.addSyncFlag('update', masterId);
          }
          master$.next(master);
          this.emitListUpdate();
          this.updateRecipeStorage();
          return of(master);
        })
      );
  }

  /**
   * Update a recipe variant; update database if logged in and connected to
   * internet or flag for sync otherwise
   *
   * @params: masterId - recipe variant's parent master id
   * @params: variantId - variant to update id
   * @params: update - object containing update data
   *
   * @return: observable of the updated recipe
   */
  patchRecipeVariantById(
    masterId: string,
    variantId: string,
    update: object
  ): Observable<RecipeVariant> {
    if (this.canSendRequest([masterId, variantId])) {
      this.patchVariantInBackground(masterId, variantId, update);
    } else {
      this.addSyncFlag('update', masterId);
    }
    return this.updateRecipeVariantOfMasterInList(masterId, variantId, update);
  }

  /**
   * Create a new recipe master and add to recipeMasterList; then update database
   * and ids if logged in and connected to internet or flag for sync otherwise
   *
   * @params: newMasterValues - object with master data and an initial recipe
   * variant, but is not yet formatted as a RecipeMaster and RecipeVariant
   *
   * @return: observable of new recipe master
   */
  postRecipeMaster(newMasterValues: object): Observable<RecipeMaster> {
    try {
      const newMaster: RecipeMaster = this.formatNewRecipeMaster(newMasterValues);
      const hasPendingImage: boolean = this.imageService
        .hasPendingImage({}, newMaster, 'labelImage');

      return this.imageService.storeFileToLocalDir(newMaster.labelImage)
        .pipe(
          mergeMap((): Observable<RecipeMaster> => {
            if (this.canSendRequest()) {
              this.postMasterInBackground(newMaster, hasPendingImage);
            } else {
              this.addSyncFlag('create', newMaster.cid);
            }
            return this.addRecipeMasterToList(newMaster);
          })
        );
    } catch (error) {
      return throwError(error.message);
    }
  }

  /**
   * Create a new recipe; then update database and update ids if logged in and
   * connected to internet
   *
   * @params: masterId - recipe master id string to search
   * @params: variant - the new RecipeVariant to add
   *
   * @return: observable of new variant
   */
  postRecipeToMasterById(masterId: string, variant: RecipeVariant): Observable<RecipeVariant> {
    this.populateRecipeIds(variant);

    if (this.canSendRequest([masterId])) {
      this.postVariantInBackground(masterId, variant);
    } else {
      this.addSyncFlag('update', masterId);
    }
    return this.addRecipeVariantToMasterInList(masterId, variant);
  }

  /***** END private access methods *****/


  /***** Background Server Update Methods *****/

  deleteMasterInBackground(masterId: string): void {
    console.log('deleting in background');
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    const master: RecipeMaster = master$.value;
    const hasImageToDelete: boolean = !this.imageService.hasDefaultImage(master.labelImage);
    console.log(master, hasImageToDelete);
    if (hasImageToDelete) {
      this.imageService.deleteLocalImage(master.labelImage.filePath);
    }

    this.http.delete(`${BASE_URL}/${API_VERSION}/recipes/private/master/${masterId}`)
      .pipe(catchError((error: HttpErrorResponse): Observable<never> => {
        return this.httpError.handleError(error);
      }))
      .subscribe(
        (): void => console.log('Recipe master: background delete request successful'),
        (error: string): void => {
          console.log('Recipe master: background delete request error', error);
          this.toastService.presentErrorToast('Recipe failed to delete from server');
        }
      );
  }

  deleteVariantInBackground(masterId: string, variantId: string): void {
    console.log('deleting in background');
    this.http
      .delete(`${BASE_URL}/${API_VERSION}/recipes/private/master/${masterId}/variant/${variantId}`)
      .pipe(catchError((error: HttpErrorResponse): Observable<never> => {
        return this.httpError.handleError(error);
      }))
      .subscribe(
        (): void => console.log('Recipe variant: background delete request successful'),
        (error: string): void => {
          console.log('Recipe variant: background delete request error', error);
          this.toastService.presentErrorToast('Recipe failed to delete from server');
        }
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
      return this.updateRecipeMasterInList(masterId, recipeResponse);
    }
    return this.updateRecipeVariantOfMasterInList(masterId, variantId, recipeResponse);
  }

  /**
   * Perform server post in background - update client data with response
   *
   * @params: masterId - recipe master's id to update or variant's master's id
   * @params: variantId - recipe variant id to update
   * @params: update - object containing master or variant updated data
   * @params: hasPendingUpload - true if there is an image to upload
   *
   * @return: none
   */
  patchInBackground(
    masterId: string,
    variantId: string,
    update: object,
    hasPendingUpload: boolean = false
  ): void {
    console.log('patching in background');
    const isMaster: boolean = !variantId;

    const formData: FormData = new FormData();
    formData.append(
      isMaster ? 'recipeMaster' : 'recipeVariant',
      JSON.stringify(update)
    );

    const imageRequest: ImageRequestFormData[] = [];
    if (hasPendingUpload && isMaster) {
      imageRequest.push({ image: update['labelImage'], name: 'labelImage'});
    }

    this.imageService.blobbifyImages(imageRequest)
      .pipe(
        mergeMap((imageData: ImageRequestMetadata[]): Observable<RecipeMaster | RecipeVariant> => {
          if (imageData.length) {
            formData.append(imageData[0].name, imageData[0].blob, imageData[0].filename);
          }

          return this.http.patch<RecipeMaster | RecipeVariant>(
            `${BASE_URL}/${API_VERSION}/recipes/private/master/${masterId}${isMaster ? '' : `/variant/${variantId}`}`,
            formData
          );
        }),
        map((recipeResponse: RecipeMaster | RecipeVariant): Observable<RecipeMaster | RecipeVariant> => {
          return this.handleBackgroundUpdateResponse(masterId, variantId, recipeResponse);
        }),
        catchError((error: HttpErrorResponse): Observable<never> => {
          return this.httpError.handleError(error);
        })
      )
      .subscribe(
        () => console.log(`Recipe ${isMaster ? 'Master' : 'Variant'}: background patch request successful`),
        (error: string): void => {
          console.log(`Recipe ${isMaster ? 'Master' : 'Variant'}: background patch request error`, error);
          this.toastService.presentErrorToast('Recipe failed to save to server');
        }
      );
  }

  /**
   * Handle patching a master to server
   *
   * @params: masterId - the master's id
   * @params: update - contains updated master data
   * @params: hasPending - true if patch has an image to upload
   *
   * @return: none
   */
  patchMasterInBackground(masterId: string, update: object, hasPending: boolean): void {
    let requestId: string = masterId;

    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (master$ === undefined) {
      this.toastService.presentErrorToast(`Recipe with id: ${masterId} not found`);
      return;
    }
    const master: RecipeMaster = master$.value;

    if (hasDefaultIdType(masterId)) {
      const id: string = getId(master);
      if (hasDefaultIdType(id)) {
        this.toastService.presentErrorToast(`Found recipe with id: ${masterId}, but missing server id`);
        return;
      } else {
        requestId = id;
      }
    }

    this.patchInBackground(requestId, null, update, hasPending);
  }

  /**
   * Handle patching a variant to server
   *
   * @params: masterId - variant's master's id
   * @params: variantId - the variant's id
   * @params: update - contains updated variant data
   *
   * @return: none
   */
  patchVariantInBackground(masterId: string, variantId: string, update: object): void {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (master$ === undefined) {
      this.toastService.presentErrorToast(`Recipe with id: ${masterId} not found`);
    }
    const master: RecipeMaster = master$.value;

    // ensure at least one recipe is marked as master
    if (this.meetsMinimumVariantCount(update, master)) {
      this.toastService.presentErrorToast('At least one recipe is required to be set as master');
    }

    this.patchInBackground(masterId, variantId, update);
  }

  /**
   * Perform server post in background - update client data with response
   *
   * @params: recipeMaster - a new recipe master
   * @params: hasPendingUpload - true if recipe master has an image to upload
   * @params: masterId - the id of a variant's master
   * @params: recipeVariant - a new recipe variant
   *
   * @return: none
   */
  postInBackground(
    recipeMaster: RecipeMaster,
    hasPendingUpload: boolean,
    masterId: string,
    recipeVariant: RecipeVariant
  ): void {
    console.log('posting in background');
    const isMaster: boolean = !masterId;

    const formData: FormData = new FormData();
    formData.append(
      isMaster ? 'recipeMaster' : 'recipeVariant',
      JSON.stringify(isMaster ? recipeMaster : recipeVariant)
    );

    const imageRequest: ImageRequestFormData[] = [];
    if (hasPendingUpload && isMaster) {
      imageRequest.push({ image: recipeMaster.labelImage, name: 'labelImage' });
    }

    this.imageService.blobbifyImages(imageRequest)
      .pipe(
        mergeMap((imageData: ImageRequestMetadata[]): Observable<RecipeMaster | RecipeVariant> => {
          if (imageData.length) {
            formData.append(imageData[0].name, imageData[0].blob, imageData[0].filename);
          }

          return this.http.post<RecipeMaster | RecipeVariant>(
            `${BASE_URL}/${API_VERSION}/recipes/private${isMaster ? '' : `/master/${masterId}`}`,
            formData
          );
        }),
        map((recipeResponse: RecipeMaster | RecipeVariant): Observable<RecipeMaster | RecipeVariant> => {
          return this.handleBackgroundUpdateResponse(
            masterId || getId(recipeMaster),
            getId(recipeVariant),
            recipeResponse
          );
        }),
        catchError((error: HttpErrorResponse): Observable<never> => {
          return this.httpError.handleError(error);
        })
      )
      .subscribe(
        () => console.log(`Recipe ${isMaster ? 'Master' : 'Variant'}: background post request successful`),
        (error: string): void => {
          console.log(`Recipe ${isMaster ? 'Master' : 'Variant'}: background post request error`, error);
          this.toastService.presentErrorToast('Recipe failed to save to server');
        }
      );
  }

  /**
   * Handle posting a new master to server
   *
   * @params: recipeMaster - the new recipe master
   * @params: hasPendingUpload - true if there is an image to upload
   *
   * @return: none
   */
  postMasterInBackground(recipeMaster: RecipeMaster, hasPendingUpload: boolean): void {
    this.postInBackground(recipeMaster, hasPendingUpload, null, null);
  }

  /**
   * Handle posting a new variant to server
   *
   * @params: masterId - variant's master
   * @params: recipeVariant - the new variant
   *
   * @return: none
   */
  postVariantInBackground(masterId: string, recipeVariant: RecipeVariant): void {
    this.postInBackground(null, false, masterId, recipeVariant);
  }

  /***** End Background Server Update Methods *****/


  /***** Sync pending requests to server *****/

  /**
   * Add a sync flag for a recipe
   *
   * @params: method - options: 'create', 'update', or 'delete'
   * @params: docId - document id to apply sync
   *
   * @return: none
   */
  addSyncFlag(method: string, docId: string): void {
    this.syncService.addSyncFlag({
      method: method,
      docId: docId,
      docType: 'recipe'
    });
  }

  /**
   * Clear all sync errors
   *
   * @params: none
   * @return: none
   */
  dismissAllErrors(): void {
    this.syncErrors = [];
  }

  /**
   * Clear a sync error at the given index
   *
   * @params: index - error array index to remove
   *
   * @return: none
   */
  dismissError(index: number): void {
    if (index >= this.syncErrors.length || index < 0) {
      throw new Error('Invalid sync error index');
    }

    this.syncErrors.splice(index, 1);
  }

  /**
   * Get an array of recipe masters that have sync flags
   *
   * @params: none
   *
   * @return: Array of behavior subjects of recipe masters
   */
  getFlaggedRecipeMasters(): BehaviorSubject<RecipeMaster>[] {
    return this.getMasterList()
      .value
      .filter((recipeMaster$: BehaviorSubject<RecipeMaster>): boolean => {
        return this.syncService
          .getAllSyncFlags()
          .some((syncFlag: SyncMetadata): boolean => {
            return hasId(recipeMaster$.value, syncFlag.docId);
          });
      });
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
    console.log('processing recipe sync successes');
    syncData.forEach((_syncData: (RecipeMaster | SyncData<RecipeMaster>)): void => {
      if (_syncData['isDeleted'] === undefined) {
        const recipeMaster$: BehaviorSubject<RecipeMaster>
          = this.getRecipeMasterById((<RecipeMaster>_syncData).cid);

        if (recipeMaster$ === undefined) {
          this.syncErrors.push({
            errCode: -1,
            message: `Recipe with id: '${(<RecipeMaster>_syncData).cid}' not found`
          });
        } else {
          recipeMaster$.next(<RecipeMaster>_syncData);
        }
      }
    });

    // Must call next on the list subject to trigger subscribers with new data
    this.emitListUpdate();
  }

  generateSyncRequests(): SyncRequests<RecipeMaster> {
    const errors: SyncError[] = [];
    const requests: Observable<HttpErrorResponse | RecipeMaster | SyncData<RecipeMaster>>[] = [];

    this.syncService.getSyncFlagsByType('recipe')
      .forEach((syncFlag: SyncMetadata): void => {
        const recipeMaster$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(syncFlag.docId);

        if (recipeMaster$ === undefined && syncFlag.method !== 'delete') {
          errors.push(
            this.syncService.constructSyncError(
              `Sync error: Recipe master with id '${syncFlag.docId}' not found`
            )
          );
          return;
        } else if (syncFlag.method === 'delete') {
          requests.push(
            this.syncService.deleteSync<RecipeMaster>(`${this.syncBaseRoute}/master/${syncFlag.docId}`)
          );
          return;
        }

        const recipeMaster: RecipeMaster = recipeMaster$.value;

        if (hasDefaultIdType(recipeMaster.owner)) {
          const user$: BehaviorSubject<User> = this.userService.getUser();

          if (user$ === undefined || user$.value._id === undefined) {
            errors.push(this.syncService.constructSyncError('Sync error: Cannot get recipe owner\'s id'));
            return;
          }
          recipeMaster.owner = user$.value._id;
        }

        if (syncFlag.method === 'update' && isMissingServerId(recipeMaster._id)) {
          errors.push(
            this.syncService.constructSyncError(
              `Recipe with id: ${recipeMaster.cid} is missing its server id`
            )
          );
        } else if (syncFlag.method === 'create') {
          recipeMaster['forSync'] = true;
          requests.push(
            this.syncService.postSync<RecipeMaster>(this.syncBaseRoute, recipeMaster, 'recipeMaster')
          );
        } else if (syncFlag.method === 'update' && !isMissingServerId(recipeMaster._id)) {
          requests.push(
            this.syncService.patchSync<RecipeMaster>(
              `${this.syncBaseRoute}/master/${recipeMaster._id}`,
              recipeMaster,
              'recipeMaster'
            )
          );
        } else {
          errors.push(
            this.syncService.constructSyncError(
              `Sync error: Unknown sync flag method '${syncFlag.method}'`
            )
          );
        }
      });

    return { syncRequests: requests, syncErrors: errors };
  }

  /**
   * Process all sync flags on a login or reconnect event
   *
   * @params: onLogin - true if calling sync at login, false for sync on reconnect
   *
   * @return: none
   */
  syncOnConnection(onLogin: boolean): Observable<boolean> {
    // Ignore reconnects if not logged in
    if (!onLogin && !this.userService.isLoggedIn()) {
      return of(false);
    }

    const syncRequests: SyncRequests<RecipeMaster> = this.generateSyncRequests();
    const errors: SyncError[] = syncRequests.syncErrors;
    const requests: Observable<HttpErrorResponse | RecipeMaster | SyncData<RecipeMaster>>[] = syncRequests.syncRequests;

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
   * Process sync flags on reconnect only if signed in
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
          console.log(`${error}: error on reconnect sync`);
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
        requests.push(
          this.syncService.postSync<RecipeMaster>(
            `${this.syncBaseRoute}`,
            payload,
            'recipeMaster'
          )
        );
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
        (): void => {},
        (error: string): void => {
          console.log('Recipe sync error; continuing other sync events', error);
        }
      );
  }

  /***** End sync pending requests to server *****/


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

    if (master$ === undefined) {
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
    console.log('checking ids', ids);
    let idsOk: boolean = !ids;
    if (ids && ids.length) {
      idsOk = ids.every((id: string): boolean => id && !hasDefaultIdType(id));
    }

    console.log(this.connectionService.isConnected() && this.userService.isLoggedIn() && idsOk);

    return this.connectionService.isConnected() && this.userService.isLoggedIn() && idsOk;
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

    console.log('formatting', newMasterValues);

    const recipeMasterId: string = this.clientIdService.getNewId();
    const initialRecipe: RecipeVariant = newMasterValues['variant'];

    this.populateRecipeIds(initialRecipe);

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
   * Trigger an emit event of the master list behavior subject
   *
   * @params: none
   * @return: none
   */
  emitListUpdate(): void {
    const masterList$ = this.getMasterList();
    masterList$.next(masterList$.value);
  }

  /**
   * Combine hops schedule instances of the same type; e.g. if the hops
   * schedule contains two separate additions of the same type of hops (say
   * cascade), combine the two addition amounts and keep one instance of that
   * type of hops
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

    combined.sort(
      (h1: HopsSchedule, h2: HopsSchedule): number => {
        if (h1.quantity > h2.quantity) {
          return -1;
        } else if (h1.quantity < h2.quantity) {
          return 1;
        } else {
          return 0;
        }
      }
    );

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
  getRecipeVariantById(
    masterId: string,
    variantId: string
  ): Observable<RecipeVariant> {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);

    if (master$ === undefined) {
      return throwError(`Recipe master with id ${masterId} not found`);
    }

    return of(
      master$.value.variants
        .find((_recipe: RecipeVariant): boolean => hasId(_recipe, variantId))
    );
  }

  /**
   * Get the recipe master that stores the given variant id
   *
   * @params: variantId - recipe variant to search for
   *
   * @return: the owner recipe master subject
   */
  getRecipeMasterByRecipeId(variantId: string): BehaviorSubject<RecipeMaster> {
    return this.recipeMasterList$.value
      .find((recipeMaster$: BehaviorSubject<RecipeMaster>): boolean => {
        return recipeMaster$.value.variants
          .some((variant: RecipeVariant): boolean => {
            return hasId(variant, variantId);
          });
      });
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
    const currentMasterList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]>
      = this.getMasterList();

    const syncList: BehaviorSubject<RecipeMaster>[]
      = this.getFlaggedRecipeMasters();

    currentMasterList$.next(
      recipeMasterList
        .map((recipeMaster: RecipeMaster): BehaviorSubject<RecipeMaster> => {
          return new BehaviorSubject<RecipeMaster>(recipeMaster);
        })
        .concat(syncList)
    );
  }

  /**
   * Check if recipe master and proposed update leaves at least one variant
   *
   * @params: update - update that is trying to be applied
   * @params: master - recipe master to check against
   *
   * @return: true if update can proceed
   */
  meetsMinimumVariantCount(update: object, master: RecipeMaster): boolean {
    return update.hasOwnProperty('isMaster')
      && !update['isMaster']
      && master.variants.length < 2;
  }

  /**
   * Populate recipe variant and child property cid fields
   *
   * @params: variant - RecipeVariant to update
   *
   * @return: none
   */
  populateRecipeIds(variant: RecipeVariant): void {
    variant.cid = this.clientIdService.getNewId();
    if (variant.grains.length) {
      this.populateRecipeNestedIds(variant.grains);
    }
    if (variant.hops.length) {
      this.populateRecipeNestedIds(variant.hops);
    }
    if (variant.yeast.length) {
      this.populateRecipeNestedIds(variant.yeast);
    }
    if (variant.otherIngredients.length) {
      this.populateRecipeNestedIds(variant.otherIngredients);
    }
    if (variant.processSchedule.length) {
      this.populateRecipeNestedIds(variant.processSchedule);
    }
  }

  /**
   * Populate all cid fields of each object in array
   *
   * @params: innerArr - array of objects that require a cid field
   *
   * @return: none
   */
  populateRecipeNestedIds(
    innerArr: (GrainBill | HopsSchedule | YeastBatch | OtherIngredients | Process)[]
  ): void {
    innerArr
      .forEach((item: GrainBill | HopsSchedule | YeastBatch | OtherIngredients | Process): void => {
        item.cid = this.clientIdService.getNewId();
      });
  }

  /**
   * Remove a recipe variant from a recipe master
   *
   * @params: master$ - the recipe's master subject
   * @params: variantId - recipe variant to remove
   *
   * @return: Observable - success requires no data, using for error throw/handling
   */
  removeRecipeFromMasterInList(
    // master$: BehaviorSubject<RecipeMaster>,
    masterId: string,
    variantId: string
  ): Observable<boolean> {
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
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
    const masterList: BehaviorSubject<RecipeMaster>[]
      = this.getMasterList().value;

    const indexToRemove: number = getIndexById(
      masterId,
      getArrayFromObservables(masterList)
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

      const newMaster: RecipeVariant
        = recipeMaster.variants[changeIndex === 0 ? 1 : 0];

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
   * Store the current recipe master list in storage
   *
   * @params: none
   * @return: none
   */
  updateRecipeStorage(): void {
    this.storageService.setRecipes(
      this.recipeMasterList$.value
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
  updateRecipeMasterInList(
    masterId: string,
    update: RecipeMaster | object
  ): Observable<RecipeMaster> {
    console.log('updating recipe master in list', masterId, update);
    const masterList: BehaviorSubject<RecipeMaster>[] = this.getMasterList().value;

    const masterIndex: number = masterList
      .findIndex((recipeMaster$: BehaviorSubject<RecipeMaster>): boolean => {
        return hasId(recipeMaster$.value, masterId);
      });
    console.log('master index', masterIndex);
    if (masterIndex === -1) {
      return throwError(`Update error: Recipe master with id ${masterId} not found`);
    }

    const master$: BehaviorSubject<RecipeMaster> = masterList[masterIndex];
    const master: RecipeMaster = master$.value;

    console.log('found master');

    for (const key in update) {
      if (update.hasOwnProperty(key) && key !== 'variants') {
        master[key] = update[key];
      }
    }

    console.log('finished updating master', master);

    master$.next(master);
    this.emitListUpdate();
    this.updateRecipeStorage();

    return of(master);
  }

  /**
   * Update a recipe variant within a recipe master in list and update the subject
   *
   * @params: masterId - recipe master to variant
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
    console.log('updating recipe variant of master in list', update);
    const master$: BehaviorSubject<RecipeMaster> = this.getRecipeMasterById(masterId);
    if (master$ === undefined) {
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

    console.log('finished updating variant', variant);

    master$.next(master);
    this.emitListUpdate();
    this.updateRecipeStorage();

    return of(variant);
  }

  /***** End utility methods *****/

}
