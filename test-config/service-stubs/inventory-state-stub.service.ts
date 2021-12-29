import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InventoryStateServiceStub {
  public initFromServer() {}
  public initFromStorage() {}
  public initInventory() {}
  public registerEvents() {}
  public addItemToList(...options) {}
  public clearInventory() {}
  public createBaseItem(...options) {}
  public createItem(...options) {}
  public createItemFromBatch(...options) {}
  public getInventoryList() {}
  public getItemIndexById(...options) {}
  public removeItem(...options) {}
  public updateItem(...options) {}
  public setInventory(...options) {}
  public syncOnSignup() {}
  public handleBackgroundUpdateResponse(...options) {}
  public sendBackgroundRequest(...options) {}
  public canSendRequest(...options) {}
  public getMissingError(...options) {}
  public getRemainingColor(...options) {}
  public getSRMColor(...options) {}
  public hasMappableKey(...options) {}
  public mapOptionalData(...options) {}
}
