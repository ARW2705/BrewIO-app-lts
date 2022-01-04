import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProcessSyncServiceStub {
  public addSyncFlag(...options: any) {}
  public convertRequestMethodToSyncMethod(...options: any) {}
  public dismissAllSyncErrors() {}
  public dismissSyncError(...options: any) {}
  public generateSyncRequests(...options: any) {}
  public processSyncSuccess(...options: any) {}
  public syncOnConnection(...options: any) {}
  public syncOnSignup(...options: any) {}
}
