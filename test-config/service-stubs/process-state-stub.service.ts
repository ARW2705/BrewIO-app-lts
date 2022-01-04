import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProcessStateServiceStub {
  public initFromServer() {}
  public initFromStorage() {}
  public initBatchLists() {}
  public registerEvents() {}
  public syncOnSignup() {}
  public clearAllBatchLists() {}
  public getAllBatchesList() {}
  public setBatchLists(...options: any) {}
  public setBatch(...options: any) {}
  public syncOnConnection(...options: any) {}
  public handleBackgroundUpdateResponse(...options: any) {}
  public sendBackgroundRequest(...options: any) {}
  public addBatchToActiveList(...options: any) {}
  public archiveActiveBatch(...options: any) {}
  public canSendRequest(...options: any) {}
  public clearBatchList(...options: any) {}
  public emitBatchListUpdate(...options: any) {}
  public generateBatchFromRecipe(...options: any) {}
  public getBatchById(...options: any) {}
  public getBatchSubjectById(...options: any) {}
  public getBatchList(...options: any) {}
  public getMissingError(...options: any) {}
  public mapBatchArrayToSubjectArray(...options: any) {}
  public removeBatchFromList(...options: any) {}
  public updateBatchStorage(...options: any) {}
}
