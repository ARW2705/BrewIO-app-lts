import { Injectable } from '@angular/core';

@Injectable()
export class SyncServiceStub {
  public clearSyncData() {}
  public clearSyncFlagByType(...options) {}
  public constructSyncError(...options) {}
  public getAllSyncFlags() {}
  public getSyncFlagsByType(...options) {}
  public addSyncFlag(...options) {}
  public processSyncErrors(...options) {}
  public sync<T>(...options) {}
  public updateStorage() {}
}
