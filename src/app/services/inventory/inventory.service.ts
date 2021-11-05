/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { BehaviorSubject, Observable, forkJoin, throwError, combineLatest, of, concat } from 'rxjs';
import { catchError, defaultIfEmpty, finalize, map, mergeMap, take, tap } from 'rxjs/operators';

/* Constant imports */
import { API_VERSION, BASE_URL, OPTIONAL_INVENTORY_DATA_KEYS, SRM_HEX_CHART } from '../../shared/constants';

/* Default imports */
import { defaultImage } from '../../shared/defaults';

/* Interface imports*/
import { Author, Batch, BatchContext, Image, ImageRequestFormData, ImageRequestMetadata, InventoryItem, PrimaryValues, RecipeMaster, Style, SyncData, SyncError, SyncMetadata, SyncRequests, SyncResponse } from '../../shared/interfaces';

/* Type Guards */
import { InventoryItemGuardMetadata, OptionalItemDataGuardMetadata } from '../../shared/type-guard-metadata';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Service imports */
import { ConnectionService } from '../connection/connection.service';
import { ErrorReportingService } from '../error-reporting/error-reporting.service';
import { EventService } from '../event/event.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { IdService } from '../id/id.service';
import { ImageService } from '../image/image.service';
import { LibraryService } from '../library/library.service';
import { ProcessService } from '../process/process.service';
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
export class InventoryService {
  inventory$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);
  syncBaseRoute: string = 'inventory';
  syncErrors: SyncError[] = [];

  constructor(
    public connectionService: ConnectionService,
    public errorReporter: ErrorReportingService,
    public event: EventService,
    public http: HttpClient,
    public httpError: HttpErrorService,
    public idService: IdService,
    public imageService: ImageService,
    public libraryService: LibraryService,
    public processService: ProcessService,
    public recipeService: RecipeService,
    public splashScreen: SplashScreen,
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
   * Perform any pending sync operations then fetch inventory from server
   *
   * @params: none
   * @return: none
   */
  initFromServer(): void {
    concat(
      this.syncOnConnection(true),
      this.http.get<InventoryItem[]>(`${BASE_URL}/${API_VERSION}/inventory`)
        .pipe(
          tap((inventory: InventoryItem[]): void => {
            console.log('inventory from server');
            inventory.forEach((item: InventoryItem): void => this.checkTypeSafety(item));
            this.getInventoryList().next(inventory);
            this.updateInventoryStorage();
          }),
          catchError(this.errorReporter.handleGenericCatchError())
        )
    )
    .subscribe(
      (): void => {}, // no further actions needed on success
      (error: any): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Get inventory items from storage - use these items if there has not been a server response
   * Note - call splashscreen hide method on get inventory finalize to avoid
   * white screen between loading splash screen and app ready;
   * investigating alternatives
   *
   * @params: none
   * @return: none
   */
  initFromStorage(): void {
    this.storageService.getInventory()
      .pipe(finalize((): void => this.splashScreen.hide()))
      .subscribe(
        (inventory: InventoryItem[]): void => {
          const list$: BehaviorSubject<InventoryItem[]> = this.getInventoryList();
          if (list$.value.length === 0) {
            inventory.forEach((item: InventoryItem): void => this.checkTypeSafety(item));
            list$.next(inventory);
          }
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Get the inventory list
   *
   * @params: none
   * @return: none
   */
  initializeInventory(): void {
    console.log('init inventory');
    this.initFromStorage();

    if (this.canSendRequest()) {
      this.initFromServer();
    }
  }

  /**
   * Set up to necessary events
   *
   * @params: none
   * @return: none
   */
  registerEvents(): void {
    this.event.register('init-inventory').subscribe((): void => this.initializeInventory());
    this.event.register('clear-data').subscribe((): void => this.clearInventory());
    this.event.register('sync-inventory-on-signup').subscribe((): void => this.syncOnSignup());
    this.event.register('connected').subscribe((): void => this.syncOnReconnect());
  }

  /***** Initializations *****/


  /***** Inventory Actions *****/

  /**
   * Add item to the inventory list
   *
   * @params: item - the item to add to list
   *
   * @return: observable of boolean on success
   */
  addItemToList(item: InventoryItem): Observable<boolean> {
    const list$: BehaviorSubject<InventoryItem[]> = this.getInventoryList();
    const list: InventoryItem[] = list$.value;
    list.push(item);
    list$.next(list);
    this.updateInventoryStorage();
    return of(true);
  }

  /**
   * Clear all inventory items
   *
   * @params: none
   * @return: none
   */
  clearInventory(): void {
    this.getInventoryList().next([]);
    this.storageService.removeInventory();
  }

  /**
   * Create a new inventory item
   *
   * @params: newItemValues - values to construct the new inventory item
   *
   * @return: observable of boolean on success
   */
  createItem(newItemValues: object): Observable<boolean> {
    const newItem: InventoryItem = {
      cid: this.idService.getNewId(),
      createdAt: (new Date()).toISOString(),
      supplierName: newItemValues['supplierName'],
      stockType: newItemValues['stockType'],
      initialQuantity: newItemValues['initialQuantity'],
      currentQuantity: newItemValues['currentQuantity'],
      description: newItemValues['description'],
      itemName: newItemValues['itemName'],
      itemStyleId: newItemValues['itemStyleId'],
      itemStyleName: newItemValues['itemStyleName'],
      itemABV: newItemValues['itemABV'],
      sourceType: newItemValues['sourceType'],
      optionalItemData: {}
    };

    this.mapOptionalData(newItem, newItemValues);

    return forkJoin(this.composeImageStoreRequests(newItem))
      .pipe(
        defaultIfEmpty(null),
        mergeMap((): Observable<boolean> => this.addItemToList(newItem)),
        tap((): void => {
          if (this.canSendRequest()) {
            this.requestInBackground('post', newItem);
          } else {
            this.addSyncFlag('create', this.idService.getId(newItem));
          }
        })
      );
  }

  /**
   * Create a new inventory item based on a given batch
   *
   * @params: batch - batch to base item from
   * @params: newItemValues - values not contained in batch
   *
   * @return: observable of boolean on success
   */
  createItemFromBatch(batch: Batch, newItemValues: object): Observable<boolean> {
    console.log('creating item from batch');
    return combineLatest(
      this.recipeService.getPublicAuthorByRecipeId(batch.recipeMasterId),
      this.recipeService.getRecipeMasterById(batch.recipeMasterId) || of(undefined),
      this.libraryService.getStyleById(batch.annotations.styleId)
    )
    .pipe(
      take(1),
      mergeMap(([_author, _recipeMaster, _style]: [Author, RecipeMaster, Style]): Observable<boolean> => {
        const author: Author = _author;
        const recipeMaster: RecipeMaster = _recipeMaster;
        const style: Style = _style;
        const measuredValues: PrimaryValues = batch.annotations.measuredValues;
        const contextInfo: BatchContext = batch.contextInfo;
        const generatedItemValues: object = {
          supplierName: author.username !== '' ? author.username : 'pending',
          supplierLabelImage: author.breweryLabelImage,
          stockType: newItemValues['stockType'],
          initialQuantity: newItemValues['initialQuantity'],
          currentQuantity: newItemValues['currentQuantity'] || newItemValues['initialQuantity'],
          description: newItemValues['description'] || '',
          itemName: contextInfo.recipeMasterName,
          itemSubname: contextInfo.recipeVariantName,
          itemStyleId: batch.annotations.styleId,
          itemStyleName: style.name,
          itemABV: measuredValues.ABV,
          itemIBU: measuredValues.IBU,
          itemSRM: measuredValues.SRM,
          itemLabelImage: contextInfo.recipeImage,
          batchId: this.idService.getId(batch),
          originalRecipeId: this.idService.getId(recipeMaster),
          sourceType:
            batch.owner === 'offline' || (recipeMaster && batch.owner === recipeMaster.owner)
              ? 'self'
              : 'other'
        };

        if (batch.annotations.packagingDate !== undefined) {
          generatedItemValues['packagingDate'] = batch.annotations.packagingDate;
        }

        return this.createItem(generatedItemValues);
      })
    );
  }

  /**
   * Get the inventory list
   *
   * @params: none
   *
   * @return: BehaviorSubject of inventory item list
   */
  getInventoryList(): BehaviorSubject<InventoryItem[]> {
    return this.inventory$;
  }

  /**
   * Get an inventory item by its id
   *
   * @params: itemId - the item's id
   *
   * @return: the InventoryItem or undefined if not found
   */
  getItemById(itemId: string): InventoryItem {
    return this.getInventoryList().value.find((item: InventoryItem): boolean => this.idService.hasId(item, itemId));
  }

  /**
   * Remove an item from inventory
   *
   * @params: itemId - id of item to remove
   *
   * @return: observable of null on completion
   */
  removeItem(itemId: string): Observable<InventoryItem> {
    const list$: BehaviorSubject<InventoryItem[]> = this.getInventoryList();
    const list: InventoryItem[] = list$.value;
    const removeIndex: number = list
      .findIndex((item: InventoryItem): boolean => {
        return this.idService.hasId(item, itemId);
      });

    if (removeIndex === -1) {
      const message: string = 'An error occurred trying to remove an item from inventory: missing item';
      const additionalMessage: string = `Item with id ${itemId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    const toDelete: InventoryItem = list[removeIndex];

    // delete item label image file
    const itemImage: Image = toDelete.optionalItemData.itemLabelImage;
    if (itemImage && !this.imageService.hasDefaultImage(itemImage)) {
      this.imageService.deleteLocalImage(itemImage.filePath)
        .subscribe((errMsg: string) => console.log('image deleted', errMsg));
    }

    // delete supplier label image file
    const supplierImage: Image = toDelete.optionalItemData.supplierLabelImage;
    if (toDelete.optionalItemData && !this.imageService.hasDefaultImage(supplierImage)) {
      this.imageService.deleteLocalImage(supplierImage.filePath)
        .subscribe((errMsg: string) => console.log('image deleted', errMsg));
    }

    if (this.canSendRequest([this.idService.getId(toDelete)])) {
      this.requestInBackground('delete', toDelete);
    } else {
      this.addSyncFlag('delete', this.idService.getId(toDelete));
    }

    list.splice(removeIndex, 1);
    list$.next(list);
    this.updateInventoryStorage();
    return of(null);
  }

  /**
   * Update an item
   *
   * @params: itemId - the item id to update
   * @params: update - updated values to apply
   *
   * @return: observable of updated item
   */
  updateItem(itemId: string, update: object): Observable<InventoryItem> {
    if (update.hasOwnProperty('currentQuantity') && update['currentQuantity'] <= 0) {
      return this.removeItem(itemId);
    }

    const list$: BehaviorSubject<InventoryItem[]> = this.getInventoryList();
    const list: InventoryItem[] = list$.value;
    const toUpdate: InventoryItem = list
      .find((item: InventoryItem): boolean => {
        return this.idService.hasId(item, itemId);
      });

    if (!toUpdate) {
      const message: string = 'An error occurred trying to update an item from inventory: missing item';
      const additionalMessage: string = `Item with id ${itemId} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    }

    const previousItemImagePath: string = toUpdate.optionalItemData.itemLabelImage.filePath;
    const previousSupplierImagePath: string = toUpdate.optionalItemData.supplierLabelImage.filePath;

    for (const key in toUpdate) {
      if (update.hasOwnProperty(key)) {
        toUpdate[key] = update[key];
      }
    }

    this.mapOptionalData(toUpdate, update);

    this.checkTypeSafety(toUpdate);

    const storeImages: Observable<Image>[] = this.composeImageStoreRequests(
      toUpdate,
      {
        itemLabelImage: previousItemImagePath,
        supplierLabelImage: previousSupplierImagePath
      }
    );

    return forkJoin(storeImages)
      .pipe(
        defaultIfEmpty(null),
        mergeMap((): Observable<InventoryItem> => {
          if (this.canSendRequest([this.idService.getId(toUpdate)])) {
            this.requestInBackground('patch', toUpdate);
          } else {
            this.addSyncFlag('update', this.idService.getId(toUpdate));
          }

          list$.next(list);
          this.updateInventoryStorage();
          return of(toUpdate);
        })
      );
  }

  /***** End Inventory Actions *****/


  /***** Server Background Updates *****/

  /**
   * Set up image upload request data
   *
   * @params: item - parent item to images
   *
   * @return: array of objects with image and its formdata name
   */
  composeImageUploadRequests(item: InventoryItem): ImageRequestFormData[] {
    const imageRequests: ImageRequestFormData[] = [];

    let imageName: string = 'itemLabelImage';
    let image: Image = item.optionalItemData[imageName];

    if (image && image.hasPending) {
      imageRequests.push({ image: item.optionalItemData[imageName], name: imageName });
    }

    imageName = 'supplierLabelImage';
    image = item.optionalItemData[imageName];

    if (image && image.hasPending) {
      imageRequests.push({ image: item.optionalItemData[imageName], name: imageName });
    }

    return imageRequests;
  }

  /**
   * Set up image storage function calls to persistently store image
   * If an existing persistent image is to be overridden, provide new path
   *
   * @params: item - item that contains the image(s)
   * @params: replacementPaths - object with original paths for overriding persistent image
   *
   * @return: array of persistent image observables
   */
  composeImageStoreRequests(item: InventoryItem, replacementPaths: object = {}): Observable<Image>[] {
    const storeImages: Observable<Image>[] = [];

    let imageName: string = 'itemLabelImage';
    let image: Image = item.optionalItemData[imageName];

    if (image && image.hasPending) {
      storeImages.push(this.imageService.storeImageToLocalDir(image, replacementPaths[imageName]));
    }

    imageName = 'supplierLabelImage';
    image = item.optionalItemData[imageName];

    if (image && image.hasPending) {
      storeImages.push(this.imageService.storeImageToLocalDir(image, replacementPaths[imageName]));
    }

    return storeImages;
  }

  /**
   * Configure a background request while defining which error handling method to use
   *
   * @params: syncMethod - the http method to apply
   * @params: item - the InventoryItem to use in request
   * @params: shouldResolveError - true if error should return the error response as an observable
   * or false if error should be handled as an error
   *
   * @return: observable of InventoryItem or HttpErrorResponse
   */
  configureBackgroundRequest(
    syncMethod: string,
    shouldResolveError: boolean,
    item: InventoryItem,
    deletionId?: string
  ): Observable<InventoryItem | HttpErrorResponse> {
    return this.getBackgroundRequest(syncMethod, item, deletionId)
      .pipe(
        catchError(this.errorReporter.handleResolvableCatchError<InventoryItem>(shouldResolveError))
      );
  }

  /**
   * Construct a server request
   *
   * @params: requestMethod - the http method to call
   * @params: item - item to use in request
   * @params: [deletionId] - id to delete if item has already been deleted locally
   *
   * @return: observable of server request
   */
  getBackgroundRequest(
    requestMethod: string,
    item: InventoryItem,
    deletionId?: string
  ): Observable<InventoryItem> {
    let route: string = `${BASE_URL}/${API_VERSION}/inventory`;

    if (requestMethod === 'delete') {
      if (deletionId) {
        route += `/${deletionId}`;
      } else {
        route += `/${item._id}`;
      }
      return this.http.delete<InventoryItem>(route);
    }

    const formData: FormData = new FormData();
    formData.append('inventoryItem', JSON.stringify(item));

    const imageRequests: ImageRequestFormData[] = this.composeImageUploadRequests(item);

    return this.imageService.blobbifyImages(imageRequests)
      .pipe(
        mergeMap((imageData: ImageRequestMetadata[]): Observable<InventoryItem> => {
          imageData.forEach((imageDatum: ImageRequestMetadata): void => {
            formData.append(imageDatum.name, imageDatum.blob, imageDatum.filename);
          });

          if (requestMethod === 'post') {
            return this.http.post<InventoryItem>(route, formData);
          } else if (requestMethod === 'patch') {
            route += `/${item._id}`;
            return this.http.patch<InventoryItem>(route, formData);
          } else {
            const message: string = `Invalid http method: ${requestMethod}`;
            return throwError(new CustomError('HttpRequestError', message, 2, message));
          }
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Update in memory item with update response from server
   *
   * @params: itemResponse - server response with item
   *
   * @return: none
   */
  handleBackgroundUpdateResponse(itemResponse: InventoryItem, isDeletion: boolean): Observable<boolean> {
    const itemList$: BehaviorSubject<InventoryItem[]> = this.getInventoryList();
    const itemList: InventoryItem[] = itemList$.value;
    const updateIndex: number = itemList
      .findIndex((item: InventoryItem): boolean => {
        return this.idService.hasId(item, itemResponse.cid);
      });

    if (isDeletion && updateIndex === -1) {
      return of(true);
    } else if (updateIndex === -1) {
      const message: string = 'An error occurred trying to update an item from inventory: missing item';
      const additionalMessage: string = `Item with id ${itemResponse._id} not found`;
      return throwError(this.getMissingError(message, additionalMessage));
    } else {
      this.checkTypeSafety(itemResponse);
      itemList[updateIndex] = itemResponse;
    }

    itemList$.next(itemList);
    return of(true);
  }

  /**
   * Send a server request in background
   *
   * @params: syncMethod - http request method
   * @params: item - inventory item request body
   *
   * @return: none
   */
  requestInBackground(syncMethod: string, item: InventoryItem): void {
    let syncRequest: Observable<InventoryItem>;

    if (syncMethod === 'post' || syncMethod === 'patch' || syncMethod === 'delete') {
      syncRequest = this.getBackgroundRequest(syncMethod, item);
    } else {
      const message: string = `Unknown sync type: ${syncMethod}`;
      syncRequest = throwError(new CustomError('SyncError', message, 2, message));
    }

    syncRequest
      .pipe(
        mergeMap((itemResponse: InventoryItem): Observable<boolean> => {
          return this.handleBackgroundUpdateResponse(itemResponse, syncMethod === 'delete');
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      )
      .subscribe(
        (): void => console.log(`Inventory: background ${syncMethod} request successful`),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Server Background Updates *****/


  /***** Sync Operations *****/

  /**
   * Add a sync flag for inventory
   *
   * @params: method - the sync action
   * @params: docId - the id of the sync target
   *
   * @return: none
   */
  addSyncFlag(method: string, docId: string): void {
    const syncFlag: SyncMetadata = {
      method: method,
      docId: docId,
      docType: 'inventory'
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
    this.syncErrors.splice(index, 1);
  }

  /**
   * Generate a new sync request based on syncFlag and associated item
   *
   * @params: none
   *
   * @return: observable of sync requests and any non-server errors
   */
  generateSyncRequests(): SyncRequests<InventoryItem> {
    const errors: SyncError[] = [];
    const requests: Observable<HttpErrorResponse | InventoryItem | SyncData<InventoryItem>>[] = [];

    this.syncService.getSyncFlagsByType('inventory')
      .forEach((syncFlag: SyncMetadata): void => {
        const item: InventoryItem = this.getItemById(syncFlag.docId);

        if (item === undefined && syncFlag.method !== 'delete') {
          const errMsg: string = `Sync error: Item with id '${syncFlag.docId}' not found`;
          errors.push(this.syncService.constructSyncError(errMsg));
          return;
        } else if (syncFlag.method === 'delete') {
          requests.push(this.configureBackgroundRequest('delete', true, null, syncFlag.docId));
          return;
        }

        // TODO extract to its own method
        if (item.optionalItemData.batchId !== undefined && this.idService.hasDefaultIdType(item.optionalItemData.batchId)) {
          const batch$: BehaviorSubject<Batch> = this.processService
            .getBatchById(item.optionalItemData.batchId);

          if (batch$ !== undefined && !this.idService.hasDefaultIdType(batch$.value._id)) {
            item.optionalItemData.batchId = batch$.value._id;
          }
        }

        if (syncFlag.method === 'update' && this.idService.isMissingServerId(item._id)) {
          const errMsg: string = `Item with id: '${item.cid}' is missing its server id`;
          errors.push(this.syncService.constructSyncError(errMsg));
        } else if (syncFlag.method === 'create') {
          item['forSync'] = true;
          requests.push(this.configureBackgroundRequest('post', true, item));
        } else if (syncFlag.method === 'update' && !this.idService.isMissingServerId(item._id)) {
          requests.push(this.configureBackgroundRequest('patch', true, item));
        } else {
          const errMsg: string = `Sync error: Unknown sync flag method '${syncFlag.method}'`;
          errors.push(this.syncService.constructSyncError(errMsg));
        }
      });

    console.log('requests', requests.length);

    return { syncRequests: requests, syncErrors: errors };
  }

  /**
   * Process sync successes to update in memory items
   *
   * @params: syncData - an array of successfully synced docs; deleted docs
   * will contain a special flag to avoid searching for a removed doc in memory
   *
   * @return: none
   */
  processSyncSuccess(syncData: (InventoryItem | SyncData<InventoryItem>)[]): void {
    const list$: BehaviorSubject<InventoryItem[]> = this.getInventoryList();
    const list: InventoryItem[] = list$.value;

    syncData.forEach((_syncData: InventoryItem | SyncData<InventoryItem>): void => {
      if (_syncData['isDeleted'] === undefined) {
        const itemIndex: number = list
          .findIndex((item: InventoryItem): boolean => {
            return this.idService.hasId(item, (<InventoryItem>_syncData).cid);
          });

        if (itemIndex === -1) {
          this.syncErrors.push({
            errCode: -1,
            message: `Inventory item with id: ${(<InventoryItem>_syncData).cid} not found`
          });
        } else {
          this.checkTypeSafety(_syncData);
          list[itemIndex] = <InventoryItem>_syncData;
        }
      }
    });

    list$.next(list); // call next on list subject to update subscribers
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

    const syncRequests: SyncRequests<InventoryItem> = this.generateSyncRequests();
    const errors: SyncError[] = syncRequests.syncErrors;
    const requests: Observable<HttpErrorResponse | InventoryItem | SyncData<InventoryItem>>[]
      = syncRequests.syncRequests;

    console.log('inventory sync on connection', onLogin, requests.length);

    return this.syncService.sync('inventory', requests)
      .pipe(
        map((responses: SyncResponse<InventoryItem>): boolean => {
          if (!onLogin) {
            this.processSyncSuccess(<(InventoryItem | SyncData<InventoryItem>)[]>responses.successes);
            this.updateInventoryStorage();
          }
          this.syncErrors = responses.errors.concat(errors);
          console.log('inventory sync complete', this.syncErrors);
          return true;
        })
      );
  }

  /**
   * Network reconnect event handler - process sync flags on reconnect only if signed in
   *
   * @params: none
   * @params: none
   */
  syncOnReconnect(): void {
    this.syncOnConnection(false)
      .subscribe(
        (): void => {}, // Nothing further required if successful
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Post all stored inventory items to server
   *
   * @params: none
   * @return: none
   */
  syncOnSignup(): void {
    const list$: BehaviorSubject<InventoryItem[]> = this.getInventoryList();
    const list: InventoryItem[] = list$.value;

    const requests: (Observable<HttpErrorResponse | InventoryItem>)[] = list
      .map((item: InventoryItem): Observable<HttpErrorResponse | InventoryItem> => {
        const payload: InventoryItem = this.utilService.clone(item);

        const batch$: BehaviorSubject<Batch> = this.processService
          .getBatchById(item.optionalItemData.batchId);

        if (batch$) {
          payload['optionalItemData']['batchId'] = this.idService.getId(batch$.value);
        }

        payload['forSync'] = true;

        return this.configureBackgroundRequest('post', false, payload);
      });

    this.syncService.sync('inventory', requests)
      .subscribe((responses: SyncResponse<InventoryItem>): void => {
        this.processSyncSuccess(<(InventoryItem | SyncData<InventoryItem>)[]>responses.successes);
        this.syncErrors = responses.errors;
        this.updateInventoryStorage();
      });
  }

  /***** End Sync Operations *****/


  /***** Other Operations *****/

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
      idsOk = ids.every((id: string): boolean => id && !this.idService.hasDefaultIdType(id));
    }

    return this.connectionService.isConnected() && this.userService.isLoggedIn() && idsOk;
  }

  /**
   * Get an item missing custom error
   *
   * @param: baseMessage - primary error user message
   * @param: additionalMessage - additional message not shown to user
   *
   * @return: new custom error for missing inventory item
   */
  getMissingError(baseMessage: string, additionalMessage: string = ''): Error {
    return new CustomError(
      'InventoryError',
      `${baseMessage} ${additionalMessage}`,
      2,
      baseMessage
    );
  }

  /**
   * Get the appropriate quantity color by item
   *
   * @params: item - item instance to get count from item quantity counts
   *
   * @return: style color hex
   */
  getRemainingColor(item: InventoryItem): string {
    const remaining: number = item.currentQuantity / item.initialQuantity;

    if (remaining > 0.5) {
      return '#f4f4f4';
    } else if (remaining > 0.25) {
      return '#ff9649';
    } else {
      return '#fd4855';
    }
  }

  /**
   * Get the appropriate SRM color by item
   *
   * @params: item - item instance to get count from item quantity counts
   *
   * @return: style color value
   */
  getSRMColor(item: InventoryItem): string {
    const srm: number = item.optionalItemData.itemSRM;

    if (srm !== undefined) {
      if (srm < SRM_HEX_CHART.length) {
        return SRM_HEX_CHART[Math.floor(srm)];
      } else {
        return '#140303';
      }
    }

    return '#f4f4f4';
  }

  /**
   * Check if given key should be mapped to the optionalData object
   *
   * @params: key - key to check
   * @params: optionalData - object to check
   *
   * @return: true if key should be mapped to given object
   */
  hasMappableKey(key: string, optionalData: object): boolean {
    return OPTIONAL_INVENTORY_DATA_KEYS.includes(key) && optionalData.hasOwnProperty(key);
  }

  /**
   * Check if inventory stock type is based on capacity instead of discrete units
   *
   * @params: item - item with stock data
   *
   * @return: true if stock type is 'growler' or 'keg'
   */
  isCapacityBased(item: InventoryItem): boolean {
    const stockType: string = item.stockType.toLowerCase();
    return stockType === 'growler' || stockType === 'keg';
  }

  /**
   * Map any optional data to an item
   *
   * @params: item - the target item
   * @params: optionalData - contains optional properties to copy
   *
   * @return: none
   */
  mapOptionalData(item: InventoryItem, optionalData: object): void {
    for (const key in optionalData) {
      if (this.hasMappableKey(key, optionalData)) {
        if (
          item.optionalItemData[key]
          && optionalData[key]
          && typeof optionalData[key] === 'object'
        ) {
          for (const innerKey in optionalData[key]) {
            if (optionalData[key].hasOwnProperty(innerKey)) {
              item.optionalItemData[key][innerKey] = optionalData[key][innerKey];
            }
          }
        } else {
          item.optionalItemData[key] = optionalData[key];
        }
      }
    }

    if (!item.optionalItemData.supplierLabelImage) {
      item.optionalItemData.supplierLabelImage = defaultImage();
    }
    if (!item.optionalItemData.itemLabelImage) {
      item.optionalItemData.itemLabelImage = defaultImage();
    }

    if (item.optionalItemData.itemSRM) {
      item.optionalItemData.srmColor = this.getSRMColor(item);
    }
    if (item.initialQuantity && item.currentQuantity) {
      item.optionalItemData.remainingColor = this.getRemainingColor(item);
    }
  }

  /**
   * Update inventory storage
   *
   * @params: none
   * @return: none
   */
  updateInventoryStorage(): void {
    this.storageService.setInventory(this.getInventoryList().value)
      .subscribe(
        (): void => console.log('stored inventory'),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Other Operations *****/


  /***** Type Guards *****/

  /**
   * Runtime check given InventoryItem for type correctness; throws error on check failed
   *
   * @param: inventoryItem - the item to check
   *
   * @return: none
   */
  checkTypeSafety(inventoryItem: any): void {
    if (!this.isSafeInventoryItem(inventoryItem)) {
      throw this.getUnsafeError(inventoryItem);
    }
  }

  /**
   * Get a custom error on unsafe inventory item type
   *
   * @param: thrownFor - the original error thrown
   *
   * @return: new custom error
   */
  getUnsafeError(thrownFor: any): Error {
    return new CustomError(
      'InventoryError',
      `Given inventory item is invalid: got ${JSON.stringify(thrownFor, null, 2)}`,
      2,
      'An internal error occurred: invalid inventory item'
    );
  }

  /**
   * Check if given inventory item is type safe at runtime
   *
   * @param: inventoryItem - the item to check
   *
   * @return: true if item and component property types are valid
   */
  isSafeInventoryItem(inventoryItem: any): boolean {
    if (!this.typeGuard.hasValidProperties(inventoryItem, InventoryItemGuardMetadata)) {
      return false;
    }
    return this.isSafeOptionalItemData(inventoryItem.optionalItemData);
  }

  /**
   * Check if given inventory item optional item data is type safe at runtime
   *
   * @param: optionalItemData - the optional data object to check
   *
   * @return: true if optional item data types are valid
   */
  isSafeOptionalItemData(optionalItemData: any): boolean {
    return this.typeGuard.hasValidProperties(optionalItemData, OptionalItemDataGuardMetadata);
  }

  /***** End Type Guards *****/

}
