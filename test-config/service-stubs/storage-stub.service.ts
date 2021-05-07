import { Injectable } from '@angular/core';

@Injectable()
export class StorageServiceStub {
  static _body;

  public getBatches(...options) {}
  public removeBatches(...options) {}
  public setBatches(...options) {}
  public getInventory() {}
  public removeInventory() {}
  public setInventory(...options) {}
  public getLibrary() {}
  public setLibrary(...options) {}
  public getRecipes() {}
  public removeRecipes() {}
  public setRecipes(...options) {}
  public getSyncFlags() {
    return StorageServiceStub._body;
  }
  public removeSyncFlags() {}
  public setSyncFlags(...options) {}
  public getUser() {}
  public removeUser() {}
  public setUser(...options) {}
}
