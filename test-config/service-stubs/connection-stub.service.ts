import { Injectable } from '@angular/core';

@Injectable()
export class ConnectionServiceStub {
  public isConnected() {}
  public monitor() {}
  public setOfflineMode(...options) {}
}
