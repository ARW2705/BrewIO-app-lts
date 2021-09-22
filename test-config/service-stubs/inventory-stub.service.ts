import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InventoryServiceStub {
  public initFromServer() {}
  public initFromStorage() {}
  public initializeInventory() {}
  public registerEvents() {}
  public addItemToList(...options) {}
  public clearInventory() {}
  public createItem(...options) {}
  public createItemFromBatch(...options) {}
  public getInventoryList() {}
  public getItemById(...options) {}
  public removeItem(...options) {}
  public updateItem(...options) {}
  public composeImageUploadRequests(...options) {}
  public composeImageStoreRequests(...options) {}
  public configureBackgroundRequest(...options) {}
  public getBackgroundRequest(...options) {}
  public handleBackgroundUpdateResponse(...options) {}
  public requestInBackground(...options) {}
  public addSyncFlag(...options) {}
  public dismissAllErrors() {}
  public dismissSyncError(...options) {}
  public generateSyncRequests() {}
  public processSyncSuccess(...options) {}
  public syncOnConnection(...options) {}
  public syncOnReconnect() {}
  public syncOnSignup() {}
  public canSendRequest(...options) {}
  public getRemainingColor(...options) {}
  public getSRMColor(...options) {}
  public hasMappableKey(...options) {}
  public mapOptionalData(...options) {}
  public updateInventoryStorage() {}
}
