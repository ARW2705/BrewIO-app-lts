import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProcessTypeGuardServiceStub {
  public checkTypeSafety(...options: any) {}
  public getUnsafeError(...options: any) {}
  public isSafeAlerts(...options: any) {}
  public isSafeBatch(...options: any) {}
  public isSafeBatchAnnotations(...options: any) {}
  public isSafeBatchContext(...options: any) {}
  public isSafeBatchProcess(...options: any) {}
  public isSafePrimaryValues(...options: any) {}
  public isSafeProcessSchedule(...options: any) {}
}
