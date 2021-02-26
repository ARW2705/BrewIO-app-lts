/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { BehaviorSubject, Observable, forkJoin, throwError, combineLatest, of, concat } from 'rxjs';
import { catchError, defaultIfEmpty, finalize, first, map, mergeMap } from 'rxjs/operators';

/* Constant imports */
import { API_VERSION } from '../../shared/constants/api-version';
import { BASE_URL } from '../../shared/constants/base-url';
import { OPTIONAL_INVENTORY_DATA_KEYS } from '../../shared/constants/optional-inventory-data-keys';
import { SRM_HEX_CHART } from '../../shared/constants/srm-hex-chart';

/* Utility function imports */
import { clone } from '../../shared/utility-functions/clone';
import { getId, hasDefaultIdType, hasId, isMissingServerId } from '../../shared/utility-functions/id-helpers';

/* Default imports */
import { defaultImage } from '../../shared/defaults/default-image';

/* Interface imports*/
import { Author } from '../../shared/interfaces/author';
import { Batch, BatchContext } from '../../shared/interfaces/batch';
import { Image, ImageRequestFormData, ImageRequestMetadata, PendingImageFlag } from '../../shared/interfaces/image';
import { InventoryItem } from '../../shared/interfaces/inventory-item';
import { PrimaryValues } from '../../shared/interfaces/primary-values';
import { RecipeMaster } from '../../shared/interfaces/recipe-master';
import { Style } from '../../shared/interfaces/library';
import { SyncData, SyncError, SyncMetadata, SyncRequests, SyncResponse } from '../../shared/interfaces/sync';

/* Service imports */
import { ClientIdService } from '../client-id/client-id.service';
import { ConnectionService } from '../connection/connection.service';
import { EventService } from '../event/event.service';
import { ImageService } from '../image/image.service';
import { LibraryService } from '../library/library.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { ProcessService } from '../process/process.service';
import { RecipeService } from '../recipe/recipe.service';
import { StorageService } from '../storage/storage.service';
import { SyncService } from '../sync/sync.service';
import { ToastService } from '../toast/toast.service';
import { UserService } from '../user/user.service';


@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  inventory$: BehaviorSubject<InventoryItem[]>
    = new BehaviorSubject<InventoryItem[]>([]);
  syncBaseRoute: string = 'inventory';
  syncErrors: SyncError[] = [];

  constructor(
    public http: HttpClient,
    public clientIdService: ClientIdService,
    public connectionService: ConnectionService,
    public event: EventService,
    public imageService: ImageService,
    public libraryService: LibraryService,
    public processHttpError: HttpErrorService,
    public processService: ProcessService,
    public recipeService: RecipeService,
    public splashScreen: SplashScreen,
    public storageService: StorageService,
    public syncService: SyncService,
    public toastService: ToastService,
    public userService: UserService
  ) {
    this.registerEvents();
  }

  /***** Inventory Actions *****/

  /**
   * Create a new inventory item
   *
   * @params: newItemValues - values to construct the new inventory item
   *
   * @return: observable of boolean on success
   */
  addItem(newItemValues: object): Observable<boolean> {
    const newItem: InventoryItem = {
      cid: this.clientIdService.getNewId(),
      createdAt: (new Date()).toISOString(),
      supplierName: newItemValues['supplierName'],
      stockType: newItemValues['stockType'],
      initialQuantity: newItemValues['initialQuantity'],
      currentQuantity: newItemValues['initialQuantity'],
      description: newItemValues['description'],
      itemName: newItemValues['itemName'],
      itemStyleId: newItemValues['itemStyleId'],
      itemStyleName: newItemValues['itemStyleName'],
      itemABV: newItemValues['itemABV'],
      sourceType: newItemValues['sourceType'],
      optionalItemData: {}
    };

    const pendingImages: PendingImageFlag[] = this.mapOptionalData(newItem, newItemValues);

    const storeImages: Observable<Image>[] = this.composeImageStoreRequests(newItem, pendingImages);

    return forkJoin(storeImages)
      .pipe(
        defaultIfEmpty(null),
        mergeMap((): Observable<boolean> => {
          console.log('finished image store');
          if (this.connectionService.isConnected() && this.userService.isLoggedIn()) {
            this.postInBackground(newItem, pendingImages);
          } else {
            this.addSyncFlag('create', getId(newItem));
          }

          return this.addItemToList(newItem);
        })
      );
  }

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
   * Compose image function calls to persistently store image
   * If a persistent image is to be overridden, provide new path
   *
   * @params: item - item that contains the image(s)
   * @params: pendingImages - array of flags detailing what images should be uploaded
   * @params: overridePaths - new file path for overriding persistent image
   *
   * @return: array of persisten image observables
   */
  composeImageStoreRequests(
    item: InventoryItem,
    pendingImages: PendingImageFlag[],
    overridePaths: { name: string, path: string }[] = []
  ): Observable<Image>[] {
    const storeImages: Observable<Image>[] = [];

    pendingImages.forEach((pending: PendingImageFlag): void => {
      if (pending.hasTemp) {
        const overridePath: { name: string, path: string } = overridePaths
          .find((pathData: { name: string, path: string }): boolean => {
            return pathData.name === pending.name;
          });
        const replacedPath: string = overridePath ? overridePath.path : null;
        storeImages.push(
          this.imageService.storeFileToLocalDir(
            item.optionalItemData[pending.name],
            replacedPath
          )
        );
      }
    });

    return storeImages;
  }

  /**
   * Create a new inventory item based on a given batch
   *
   * @params: batch - batch to base item from
   * @params: newItemValues - values not contained in batch
   *
   * @return: observable of boolean on success
   */
  generateItemFromBatch(
    batch: Batch,
    newItemValues: object
  ): Observable<boolean> {
    return combineLatest(
      this.recipeService.getPublicAuthorByRecipeId(batch.recipeMasterId),
      this.recipeService.getRecipeMasterById(batch.recipeMasterId),
      this.libraryService.getStyleById(batch.annotations.styleId)
    )
    .pipe(
      first(),
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
          currentQuantity: newItemValues['initialQuantity'],
          description: newItemValues['description'],
          itemName: contextInfo.recipeMasterName,
          itemSubname: contextInfo.recipeVariantName,
          itemStyleId: batch.annotations.styleId,
          itemStyleName: style.name,
          itemABV: measuredValues.ABV,
          itemIBU: measuredValues.IBU,
          itemSRM: measuredValues.SRM,
          itemLabelImage: contextInfo.recipeImage,
          batchId: getId(batch),
          originalRecipeId: getId(recipeMaster),
          sourceType:
            batch.owner === 'offline' || batch.owner === recipeMaster.owner
            ? 'self'
            : 'other'
        };

        if (batch.annotations.packagingDate !== undefined) {
          generatedItemValues['packagingDate'] = batch.annotations.packagingDate;
        }

        return this.addItem(generatedItemValues);
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
    return this.getInventoryList().value
      .find((item: InventoryItem): boolean => hasId(item, itemId));
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
   * Get the inventory from storage and server
   * Note - call splashscreen hide method on get inventory finalize to avoid
   * white screen between loading splash screen and app ready;
   * investigating alternatives
   *
   * @params: none
   * @return: none
   */
  initializeInventory(): void {
    console.log('init inventory');
    this.storageService.getInventory()
      .pipe(finalize((): void => this.splashScreen.hide()))
      .subscribe(
        (inventory: InventoryItem[]): void => {
          const list$: BehaviorSubject<InventoryItem[]> = this.getInventoryList();
          if (list$.value.length === 0 && inventory.length > 0) {
            list$.next(inventory);
          }
        },
        (error: string): void => console.log(`${error}: awaiting data from server`)
      );
    if (this.connectionService.isConnected() && this.userService.isLoggedIn()) {
      concat(
        this.syncOnConnection(true),
        this.http.get<InventoryItem[]>(`${BASE_URL}/${API_VERSION}/inventory`)
          .pipe(
            map((inventory: InventoryItem[]): void => {
              console.log('inventory from server');
              this.getInventoryList().next(inventory);
              this.updateInventoryStorage();
            }),
            catchError((error: HttpErrorResponse): Observable<never> => {
              return this.processHttpError.handleError(error);
            })
          )
      )
      .subscribe(
        (): void => {}, // no further actions needed on success
        (error: string): void => console.log(`Initialization error: ${error}`)
      );
    }
  }

  /**
   * Map any optional data to an item
   *
   * @params: item - the target item
   * @params: optionalData - contains optional properties to copy
   *
   * @return: object with pending image metadata
   */
  mapOptionalData(item: InventoryItem, optionalData: object): PendingImageFlag[] {
    const pendingImages: PendingImageFlag[] = [
      {
        name: 'itemLabelImage',
        hasPending: this.imageService.hasPendingImage(
          item.optionalItemData,
          optionalData,
          'itemLabelImage'
        ),
        hasTemp: this.imageService.isTempImage(optionalData['itemLabelImage'])
      },
      {
        name: 'supplierLabelImage',
        hasPending: this.imageService.hasPendingImage(
          item.optionalItemData,
          optionalData,
          'supplierLabelImage'
        ),
        hasTemp: this.imageService.isTempImage(optionalData['supplierLabelImage'])
      }
    ];

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

    return pendingImages;
  }

  /**
   * Update an item
   *
   * @params: itemId - the item id to update
   * @params: update - object with updated values
   *
   * @return: observable of updated item
   */
  patchItem(itemId: string, update: object): Observable<InventoryItem> {
    if (update.hasOwnProperty('currentQuantity') && update['currentQuantity'] <= 0) {
      return this.removeItem(itemId);
    }

    const list$: BehaviorSubject<InventoryItem[]> = this.getInventoryList();
    const list: InventoryItem[] = list$.value;
    const toUpdate: InventoryItem = list
      .find((item: InventoryItem): boolean => hasId(item, itemId));

    const previousItemImagePath: string = toUpdate.optionalItemData.itemLabelImage.filePath;
    const previousSupplierImagePath: string = toUpdate.optionalItemData.supplierLabelImage.filePath;

    for (const key in toUpdate) {
      if (update.hasOwnProperty(key)) {
        toUpdate[key] = update[key];
      }
    }

    const pendingImages: PendingImageFlag[] = this.mapOptionalData(toUpdate, update);

    const storeImages: Observable<Image>[] = this.composeImageStoreRequests(
      toUpdate,
      pendingImages,
      [
        {
          name: 'itemLabelImage',
          path: previousItemImagePath
        },
        {
          name: 'suppilerLabelImage',
          path: previousSupplierImagePath
        }
      ]
    );

    return forkJoin(storeImages)
      .pipe(
        defaultIfEmpty(null),
        mergeMap((): Observable<InventoryItem> => {
          if (this.connectionService.isConnected() && this.userService.isLoggedIn()) {
            this.patchInBackground(toUpdate, pendingImages);
          } else {
            this.addSyncFlag('update', getId(toUpdate));
          }

          list$.next(list);
          this.updateInventoryStorage();
          return of(toUpdate);
        })
      );
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
      .findIndex((item: InventoryItem): boolean => hasId(item, itemId));

    if (this.connectionService.isConnected() && this.userService.isLoggedIn()) {
      this.deleteInBackground(list[removeIndex]._id);
    } else {
      this.addSyncFlag('delete', getId(list[removeIndex]));
    }

    list.splice(removeIndex, 1);
    list$.next(list);
    this.updateInventoryStorage();
    return of(null);
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

  /***** End Inventory Actions *****/


  /***** Server Background Updates *****/

  /**
   * Set up image upload request data
   *
   * @params: item - parent item to images
   * @params: pendingImages - contains flags to determine if image should be uploaded
   *
   * @return: array of objects with image and its formdata name
   */
  composeImageUploadRequests(
    item: InventoryItem,
    pendingImages: PendingImageFlag[]
  ): ImageRequestFormData[] {
    const imageRequests: ImageRequestFormData[] = [];
    pendingImages.forEach((pending: PendingImageFlag): void => {
      if (item.optionalItemData[pending.name] && pending.hasPending) {
        imageRequests.push({
          image: item.optionalItemData[pending.name],
          name: pending.name
        });
      }
    });
    return imageRequests;
  }

  /**
   * Update server on item deletion
   *
   * @params: itemId - item doc id to delete
   *
   * @return: none
   */
  deleteInBackground(itemId: string): void {
    this.http.delete<InventoryItem>(`${BASE_URL}/${API_VERSION}/inventory/${itemId}`)
      .pipe(catchError((error: HttpErrorResponse): Observable<never> => {
        return this.processHttpError.handleError(error);
      }))
      .subscribe(
        (): void => console.log('Inventory: background delete request successful'),
        (error: string): void => {
          console.log('Inventory: background delete request error', error);
          this.toastService.presentErrorToast(error);
        }
      );
  }

  /**
   * Update in memory item with update from server
   *
   * @params: itemResponse - server response with item
   *
   * @return: none
   */
  handleBackgroundUpdateResponse(itemResponse: InventoryItem): Observable<never> {
    console.log('got background response', itemResponse);
    const itemList$: BehaviorSubject<InventoryItem[]> = this.getInventoryList();
    const itemList: InventoryItem[] = itemList$.value;
    const updateIndex: number = itemList
      .findIndex((item: InventoryItem): boolean => {
        return hasId(item, itemResponse.cid);
      });

    if (updateIndex === -1) {
      // TODO offer option to add instead
      return throwError('Inventory item is missing and cannot be updated');
    } else {
      itemList[updateIndex] = itemResponse;
    }

    itemList$.next(itemList);
  }

  /**
   * Update server on item update
   *
   * @params: updatedItem - updated item to apply to server doc
   * @params: pendingImages - object containing image metadata for conversion,
   * storage, and/or upload
   *
   * @return: none
   */
  patchInBackground(updatedItem: InventoryItem, pendingImages: PendingImageFlag[]): void {
    console.log('patching in background');

    const formData: FormData = new FormData();
    formData.append('inventoryItem', JSON.stringify(updatedItem));

    const imageRequests: ImageRequestFormData[]
      = this.composeImageUploadRequests(updatedItem, pendingImages);

    this.imageService.blobbifyImages(imageRequests)
      .pipe(
        mergeMap((imageData: ImageRequestMetadata[]): Observable<InventoryItem> => {
          imageData.forEach((imageDatum: ImageRequestMetadata): void => {
            formData.append(imageDatum.name, imageDatum.blob, imageDatum.filename);
          });

          return this.http.patch<InventoryItem>(
            `${BASE_URL}/${API_VERSION}/inventory/${updatedItem._id}`,
            formData
          );
        }),
        map((itemResponse: InventoryItem) => {
          return this.handleBackgroundUpdateResponse(itemResponse);
        }),
        catchError((error: HttpErrorResponse): Observable<never> => {
          return this.processHttpError.handleError(error);
        })
      )
      .subscribe(
        (): void => console.log('Inventory: background patch request successful'),
        (error: string): void => {
          console.log('Inventory: background patch request error', error);
          this.toastService.presentErrorToast('Inventory item failed to save to server');
        }
      );
  }

  /**
   * Update server on new item
   *
   * @params: newItem - new item to add to server
   * @params: pendingImages - object containing image metadata for conversion,
   * storage, and/or upload
   *
   * @return: none
   */
  postInBackground(newItem: InventoryItem, pendingImages: PendingImageFlag[]): void {
    console.log('posting in background');

    const formData: FormData = new FormData();
    formData.append('inventoryItem', JSON.stringify(newItem));

    const imageRequests: ImageRequestFormData[]
      = this.composeImageUploadRequests(newItem, pendingImages);

    this.imageService.blobbifyImages(imageRequests)
      .pipe(
        mergeMap((imageData: ImageRequestMetadata[]): Observable<InventoryItem> => {
          imageData.forEach((imageDatum: ImageRequestMetadata): void => {
            formData.append(imageDatum.name, imageDatum.blob, imageDatum.filename);
          });

          return this.http.post<InventoryItem>(
            `${BASE_URL}/${API_VERSION}/inventory`,
            formData
          );
        }),
        map((itemResponse: InventoryItem): Observable<never> => {
          return this.handleBackgroundUpdateResponse(itemResponse);
        }),
        catchError((error: HttpErrorResponse): Observable<never> => {
          return this.processHttpError.handleError(error);
        })
      )
      .subscribe(
        (): void => console.log('Inventory: background post request successful'),
        (error: string): void => {
          console.log('Inventory: background post request error', error);
          this.toastService.presentErrorToast('Inventory item failed to save to server');
        }
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
    this.syncService.addSyncFlag({
      method: method,
      docId: docId,
      docType: 'inventory'
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
   * Generate a new sync request based on syncFlag and associated item
   *
   * @params: syncFlag - sync metadata to derive the request from
   *
   * @return: observable of inventory item, syncable data, or http error
   */
  generateSyncRequests(): SyncRequests<InventoryItem> {
    const errors: SyncError[] = [];
    const requests: Observable<HttpErrorResponse | InventoryItem | SyncData<InventoryItem>>[] = [];

    this.syncService.getSyncFlagsByType('inventory')
      .forEach((syncFlag: SyncMetadata): void => {
        const item: InventoryItem = this.getItemById(syncFlag.docId);
        console.log('inv sync flag', syncFlag, item);
        if (item === undefined && syncFlag.method !== 'delete') {
          errors.push(
            this.syncService.constructSyncError(
              `Sync error: Item with id '${syncFlag.docId}' not found`
            )
          );
          return;
        } else if (syncFlag.method === 'delete') {
          requests.push(
            this.syncService.deleteSync<InventoryItem>(`${this.syncBaseRoute}/${syncFlag.docId}`)
          );
          return;
        }

        if (
          item.optionalItemData.batchId !== undefined
          && hasDefaultIdType(item.optionalItemData.batchId)
        ) {
          const batch$: BehaviorSubject<Batch> = this.processService
            .getBatchById(item.optionalItemData.batchId);

          if (batch$ !== undefined && !hasDefaultIdType(batch$.value._id)) {
            item.optionalItemData.batchId = batch$.value._id;
          }
        }

        if (syncFlag.method === 'update' && isMissingServerId(item._id)) {
          errors.push(
            this.syncService.constructSyncError(`Item with id: ${item.cid} is missing its server id`)
          );
        } else if (syncFlag.method === 'create') {
          item['forSync'] = true;
          requests.push(this.syncService.postSync<InventoryItem>(this.syncBaseRoute, item, 'inventoryItem'));
        } else if (syncFlag.method === 'update' && !isMissingServerId(item._id)) {
          requests.push(this.syncService.patchSync<InventoryItem>(`${this.syncBaseRoute}/${item._id}`, item, 'inventoryItem'));
        } else {
          errors.push(
            this.syncService.constructSyncError(
              `Sync error: Unknown sync flag method '${syncFlag.method}'`
            )
          );
        }
      });

    console.log('requests', requests.length);

    return { syncRequests: requests, syncErrors: errors };
  }

  /**
   * Process sync successes to update in memory docs
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
            return hasId(item, (<InventoryItem>_syncData).cid);
          });

        if (itemIndex === -1) {
          this.syncErrors.push({
            errCode: -1,
            message: `Inventory item with id: ${(<InventoryItem>_syncData).cid} not found`
          });
        } else {
          list[itemIndex] = <InventoryItem>_syncData;
        }
        // TODO handle image uploads on sync
      }
    });

    list$.next(list); // call next on list subject to update subscribers
  }

  /**
   * Process all sync flags on a login or reconnect event
   *
   * @params: onLogin - true if calling sync at login,
   * false for sync on reconnect
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
          console.log(`error on reconnect sync: ${error}`);
          this.toastService.presentErrorToast('Sync error: some inventory items did not update');
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
    const list$: BehaviorSubject<InventoryItem[]> = this.getInventoryList();
    const list: InventoryItem[] = list$.value;

    const requests: (Observable<HttpErrorResponse | InventoryItem>)[] = list
      .map((item: InventoryItem): Observable<HttpErrorResponse | InventoryItem> => {
        const payload: InventoryItem = clone(item);

        const batch$: BehaviorSubject<Batch> = this.processService
          .getBatchById(item.optionalItemData.batchId);

        if (batch$) {
          payload['optionalItemData']['batchId'] = getId(batch$.value);
        }

        payload['forSync'] = true;
        return this.syncService.postSync<InventoryItem>(`${this.syncBaseRoute}`, payload, 'inventoryItem');
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
   * Get the appropriate quantity color by item
   *
   * @params: item - item instance to get count from item quantity counts
   *
   * @return: style color
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
   * Register to necessary events
   *
   * @params: none
   * @return: none
   */
  registerEvents(): void {
    this.event.register('init-inventory')
      .subscribe((): void => this.initializeInventory());

    this.event.register('clear-data')
      .subscribe((): void => this.clearInventory());

    this.event.register('sync-inventory-on-signup')
      .subscribe((): void => this.syncOnSignup());

    this.event.register('connected')
      .subscribe((): void => this.syncOnReconnect());
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
        (error: string): void => console.log(`inventory store error: ${error}`)
      );
  }

  /***** End Other Operations *****/

}
