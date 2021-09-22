import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProcessServiceStub {
  public initFromServer() {}
  public initFromStorage() {}
  public initializeBatchLists() {}
  public registerEvents() {}
  public endBatchById(...options) {}
  public startNewBatch(...options) {}
  public updateBatch(...options) {}
  public updateMeasuredValues(...options) {}
  public updateStepById(...options) {}
  public configureBackgroundRequest(...options) {}
  public getBackgroundRequest(...options) {}
  public requestInBackground(...options) {}
  public addSyncFlag(...options) {}
  public dismissAllErrors() {}
  public dismissSyncError(...options) {}
  public generateSyncRequests() {}
  public processSyncSuccess(...options) {}
  public syncOnConnection(...options) {}
  public syncOnReconnect(...options) {}
  public syncOnSignup() {}
  public addBatchToActiveList(...options) {}
  public archiveActiveBatch(...options) {}
  public canSendRequest(...options) {}
  public clearBatchList(...options) {}
  public clearAllBatchLists() {}
  public emitBatchListUpdate(...options) {}
  public generateBatchFromRecipe(...options) {}
  public getAllBatchesList() {}
  public getBatchById(...options) {}
  public getBatchList(...options) {}
  public mapBatchArrayToSubjectArray(...options) {}
  public removeBatchFromList(...options) {}
  public updateBatchStorage(...options) {}
}
