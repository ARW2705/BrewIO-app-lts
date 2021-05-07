import { Injectable } from '@angular/core';

@Injectable()
export class BackgroundModeServiceStub {
  public disableBackgroundMode() {}
  public enableBackgroundMode() {}
  public initBackgroundMode() {}
  public isActive() {}
  public onActivate() {}
  public onDeactivate() {}
  public setNotification(...options) {}
}
