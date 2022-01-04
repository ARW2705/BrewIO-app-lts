/* Module imports */
import { Injectable } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of, throwError } from 'rxjs';
import { defaultIfEmpty, finalize, map, mergeMap, take, tap } from 'rxjs/operators';

/* Constant imports */
import { HIGH_SEVERITY, OPTIONAL_INVENTORY_DATA_KEYS, SRM_HEX_CHART } from '@shared/constants';

/* Default imports */
import { defaultImage } from '@shared/defaults';

/* Interface imports*/
import { Author, Batch, BatchContext, Image, InventoryItem, PrimaryValues, RecipeMaster, Style } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ConnectionService } from '@services/connection/connection.service';
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { EventService } from '@services/event/event.service';
import { IdService } from '@services/id/id.service';
import { InventoryHttpService } from '@services/inventory/http/inventory-http.service';
import { InventoryImageService } from '@services/inventory/image/inventory-image.service';
import { InventorySyncService } from '@services/inventory/sync/inventory-sync.service';
import { InventoryTypeGuardService } from '@services/inventory/type-guard/inventory-type-guard.service';
import { LibraryService } from '@services/library/library.service';
import { RecipeService } from '@services/recipe/recipe.service';
import { StorageService } from '@services/storage/storage.service';
import { UserService } from '@services/user/user.service';


@Injectable({
  providedIn: 'root'
})
export class InventoryStateService {
  inventory$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);

  constructor(
    public connectionService: ConnectionService,
    public errorReporter: ErrorReportingService,
    public eventService: EventService,
    public idService: IdService,
    public inventoryHttpService: InventoryHttpService,
    public inventoryImageService: InventoryImageService,
    public inventorySyncService: InventorySyncService,
    public inventoryTypeGuardService: InventoryTypeGuardService,
    public libraryService: LibraryService,
    public recipeService: RecipeService,
    public splashScreen: SplashScreen,
    public storageService: StorageService,
    public userService: UserService
  ) {
    this.registerEvents();
  }

  /***** Initializations *****/

  /**
   * Perform any pending sync operations then fetch inventory from server
   *
   * @param: none
   * @return: observable of null on initialization complete
   */
  initFromServer(): Observable<null> {
    if (this.canSendRequest()) {
      return this.syncOnConnection(true)
        .pipe(
          mergeMap((): Observable<InventoryItem[]> => this.inventoryHttpService.getInventoryFromServer()),
          map((inventoryList: InventoryItem[]): null => {
            this.setInventory(inventoryList);
            return null;
          })
        );
    } else {
      return of(null);
    }
  }

  /**
   * Get inventory items from storage - use these items if there has not been a server response
   * Note - call splashscreen hide method on get inventory finalize to avoid white screen
   * between loading splash screen and app ready; investigating alternatives
   *
   * @param: none
   * @return: observable of null on initialization complete
   */
  initFromStorage(): Observable<null> {
    return this.storageService.getInventory()
      .pipe(
        finalize((): void => this.splashScreen.hide()),
        map((inventoryList: InventoryItem[]): null => {
          if (this.getInventoryList().value.length === 0) { // only apply if current list is empty
            this.setInventory(inventoryList);
          }
          return null;
        })
      );
  }

  /**
   * Initialize the inventory
   *
   * @param: none
   * @return: observable of null on initialization complete
   */
  initInventory(): Observable<null> {
    return this.initFromStorage().pipe(mergeMap((): Observable<null> => this.initFromServer()));
  }

  /**
   * Register event listeners
   *
   * @param: none
   * @return: none
   */
  registerEvents(): void {
    console.log('register inventory events');
    this.eventService.register('init-inventory')
      .pipe(mergeMap((): Observable<null> => this.initInventory()))
      .subscribe((): void => console.log('inventory init complete'));
    this.eventService.register('clear-data').subscribe((): void => this.clearInventory());
    this.eventService.register('sync-inventory-on-signup').subscribe((): void => this.syncOnSignup());
    this.eventService.register('connected')
      .pipe(mergeMap((): Observable<null> => this.syncOnConnection(false)))
      .subscribe((): void => console.log('inventory sync on connection complete'));
  }

  /***** End Initializations *****/


  /***** State Management *****/

  /**
   * Add item to the inventory list
   *
   * @param: item - the item to add to list
   * @return: observable of null on success
   */
  addItemToList(item: InventoryItem): Observable<null> {
    const list$: BehaviorSubject<InventoryItem[]> = this.getInventoryList();
    const list: InventoryItem[] = list$.value;
    list.push(item);
    this.setInventory(list);
    return of(null);
  }

  /**
   * Clear all inventory items
   *
   * @param: none
   * @return: none
   */
  clearInventory(): void {
    this.getInventoryList().next([]);
    this.storageService.removeInventory();
  }

  /**
   * Create a minimum basic inventory item
   *
   * @param: newItemValues - values to construct the new inventory item
   * @return: minimum valid inventory item
   */
  createBaseItem(newItemValues: object): InventoryItem {
    return {
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
  }

  /**
   * Create a new inventory item
   *
   * @param: newItemValues - values to construct the new inventory item
   * @return: observable of null on success
   */
  createItem(newItemValues: object): Observable<null> {
    const newItem: InventoryItem = this.createBaseItem(newItemValues);
    this.mapOptionalData(newItem, newItemValues);
    this.inventoryTypeGuardService.checkTypeSafety(newItem);
    return forkJoin(this.inventoryImageService.composeImageStoreRequests(newItem))
      .pipe(
        defaultIfEmpty(null),
        mergeMap((): Observable<null> => this.addItemToList(newItem)),
        tap((): void => this.sendBackgroundRequest('post', newItem))
      );
  }

  /**
   * Create a new inventory item based on a given batch
   *
   * @param: batch - batch to base item from
   * @param: newItemValues - values not contained in batch
   * @return: observable of boolean on success
   */
  createItemFromBatch(batch: Batch, newItemValues: object): Observable<null> {
    return combineLatest(
      this.recipeService.getPublicAuthorByRecipeId(batch.recipeMasterId),
      this.recipeService.getRecipeMasterById(batch.recipeMasterId) || of(undefined),
      this.libraryService.getStyleById(batch.annotations.styleId)
    )
    .pipe(
      take(1),
      mergeMap(([_author, _recipeMaster, _style]: [Author, RecipeMaster, Style]): Observable<null> => {
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
          sourceType: 'self'
        };

        if (batch.owner !== 'offline' && (!recipeMaster || batch.owner !== recipeMaster.owner)) {
          generatedItemValues['sourceType'] = 'other';
        }
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
   * @param: none
   * @return: BehaviorSubject of inventory item list
   */
  getInventoryList(): BehaviorSubject<InventoryItem[]> {
    return this.inventory$;
  }

  /**
   * Get an item's array index
   *
   * @param: itemId - the item id with which to search
   * @return: the item's index or -1 if not found
   */
  getItemIndexById(itemId: string): number {
    return this.getInventoryList().value.findIndex((item: InventoryItem): boolean => {
      return this.idService.hasId(item, itemId);
    });
  }

  /**
   * Remove an item from inventory
   *
   * @param: itemId - id of item to remove
   * @return: observable of null on completion
   */
  removeItem(itemId: string): Observable<null> {
    const list: InventoryItem[] = this.getInventoryList().value;
    const removeIndex: number = this.getItemIndexById(itemId);
    if (removeIndex === -1) {
      return of(null); // do nothing if item doesn't exist
    }

    const toDelete: InventoryItem = list[removeIndex];
    // delete item label image file
    this.inventoryImageService.deleteImage(toDelete.optionalItemData.itemLabelImage);
    // delete supplier label image file
    this.inventoryImageService.deleteImage(toDelete.optionalItemData.supplierLabelImage);
    this.sendBackgroundRequest('delete', toDelete);
    list.splice(removeIndex, 1);
    this.setInventory(list);
    return of(null);
  }

  /**
   * Update an item
   *
   * @param: itemId - the item id to update
   * @param: update - updated values to apply
   * @return: observable of updated item
   */
  updateItem(itemId: string, update: object): Observable<InventoryItem> {
    // if current quantity is changing to 0, remove item instead
    if (update.hasOwnProperty('currentQuantity') && update['currentQuantity'] <= 0) {
      return this.removeItem(itemId);
    }

    const list: InventoryItem[] = this.getInventoryList().value;
    const updateIndex: number = this.getItemIndexById(itemId);
    if (updateIndex === -1) {
      return throwError(this.getMissingError('update', itemId));
    }

    const toUpdate: InventoryItem = list[updateIndex];
    const previousItemImagePath: string = toUpdate.optionalItemData.itemLabelImage.filePath;
    const previousSupplierImagePath: string = toUpdate.optionalItemData.supplierLabelImage.filePath;
    for (const key in toUpdate) {
      if (update.hasOwnProperty(key)) {
        toUpdate[key] = update[key];
      }
    }

    this.mapOptionalData(toUpdate, update);
    this.inventoryTypeGuardService.checkTypeSafety(toUpdate);
    const storeImages: Observable<Image>[] = this.inventoryImageService.composeImageStoreRequests(
      toUpdate,
      { itemLabelImage: previousItemImagePath, supplierLabelImage: previousSupplierImagePath }
    );

    return forkJoin(storeImages)
      .pipe(
        defaultIfEmpty(null),
        mergeMap((): Observable<InventoryItem> => {
          this.sendBackgroundRequest('patch', toUpdate);
          this.setInventory(list);
          return of(toUpdate);
        })
      );
  }

  /**
   * Replace inventory list with given list; perform type guard checks and update storage
   *
   * @param: inventoryList - the new inventory item array to replace the current with
   * @return: none
   */
  setInventory(inventoryList: InventoryItem[]): void {
    if (inventoryList) {
      inventoryList.forEach((item: InventoryItem): void => {
        this.inventoryTypeGuardService.checkTypeSafety(item);
      });
      this.getInventoryList().next(inventoryList);
      this.storageService.setInventory(inventoryList);
    }
  }

  /***** End State Management *****/


  /***** Sync Calls *****/

  /**
   * Perform sync on signup action and apply any results to inventory
   *
   * @param: none
   * @return: none
   */
  syncOnSignup(): void {
    this.inventorySyncService.syncOnSignup(this.getInventoryList().value)
      .subscribe(
        (syncedList: InventoryItem[]): void => this.setInventory(syncedList),
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Perform sync on connection action and apply any results to inventory
   *
   * @param: onLogin - true if connection event was due to user login
   * @return: none
   */
  syncOnConnection(onLogin: boolean): Observable<null> {
    return this.inventorySyncService.syncOnConnection(onLogin, this.getInventoryList().value)
      .pipe(
        map((syncedList: InventoryItem[]): null => {
          this.setInventory(syncedList);
          return null;
        })
      );
  }

  /***** End Sync Calls *****/


  /***** Http Handlers *****/

  /**
   * Update in memory item with update response from server
   *
   * @param: itemResponse - server response with item
   * @param: isDeletion - true if item is being deleted
   * @return: none
   */
  handleBackgroundUpdateResponse(itemResponse: InventoryItem, isDeletion: boolean): void {
    const list: InventoryItem[] = this.getInventoryList().value;
    const updateIndex: number = this.getItemIndexById(itemResponse.cid);
    if (!isDeletion && updateIndex === -1) {
      throw this.getMissingError('update', this.idService.getId(itemResponse));
    } else {
      this.inventoryTypeGuardService.checkTypeSafety(itemResponse);
      list[updateIndex] = itemResponse;
    }

    this.setInventory(list);
  }

  /**
   * Send a background request to server or set sync flag if request cannot be completed
   *
   * @param: requestMethdod - the http request method ('post', 'patch', or 'delete')
   * @param: requestBody - the http body to send
   * @return: none
   */
  sendBackgroundRequest(requestMethod: string, requestBody: InventoryItem): void {
    const ids: string[] = [];
    if (requestMethod === 'patch' || requestMethod === 'delete') {
      ids.push(this.idService.getId(requestBody));
    }
    if (this.canSendRequest(ids)) {
      this.inventoryHttpService.requestInBackground(requestMethod, requestBody)
        .subscribe(
          (item: InventoryItem): void => {
            this.handleBackgroundUpdateResponse(item, requestMethod === 'delete');
          },
          (error: Error): void => this.errorReporter.handleUnhandledError(error)
        );
    } else {
      this.inventorySyncService.addSyncFlag(
        this.inventorySyncService.convertRequestMethodToSyncMethod(requestMethod),
        this.idService.getId(requestBody)
      );
    }
  }

  /***** End Http Handlers *****/


  /***** Helper Methods *****/

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
   * Get a custom inventory error
   *
   * @param: action - the CRUD action that was being performed when the error is to be set
   * @param: id - the id of the item that the action was attempted on
   * @return: new custom error for missing inventory item
   */
  getMissingError(action: string, id: string): CustomError {
    const base: string = `An error occurred trying to ${action} an item ${action === 'create' ? '' : 'in'} inventory`;
    const additional: string = `Item with id ${id} not found`;
    return new CustomError('InventoryError', `${base} ${additional}`, HIGH_SEVERITY, base);
  }

  /**
   * Get the appropriate quantity color by item
   *
   * @param: item - item instance to get count from item quantity counts
   * @return: style color hex
   */
  getRemainingColor(item: InventoryItem): string {
    const remaining: number = item.currentQuantity / item.initialQuantity;
    const half: number = 0.5;
    const quarter: number = 0.25;

    if (remaining > half) {
      return '#f4f4f4';
    } else if (remaining > quarter) {
      return '#ff9649';
    } else {
      return '#fd4855';
    }
  }

  /**
   * Get the appropriate SRM color by item
   *
   * @param: item - item instance to get count from item quantity counts
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
   * @param: key - key to check
   * @param: optionalData - object to check
   * @return: true if key should be mapped to given object
   */
  hasMappableKey(key: string, optionalData: object): boolean {
    return OPTIONAL_INVENTORY_DATA_KEYS.includes(key) && optionalData.hasOwnProperty(key);
  }

  /**
   * Map any optional data to an item
   *
   * @param: item - the target item
   * @param: optionalData - contains optional properties to copy
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

  /***** End Helper Methods *****/

}
