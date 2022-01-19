import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecipeSyncServiceStub {
  public addSyncFlag(...options) {}
  public convertRequestMethodToSyncMethod(...options) {}
  public dismissAllSyncErrors() {}
  public dismissSyncError(...options) {}
  public generateSyncRequests(...options) {}
  public processSyncSuccess(...options) {}
  public syncOnConnection(...options) {}
  public syncOnSignup(...options) {}
}
