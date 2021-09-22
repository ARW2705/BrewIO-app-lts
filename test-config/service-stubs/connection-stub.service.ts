import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConnectionServiceStub {
  public isConnected() {}
  public monitor() {}
  public setOfflineMode(...options) {}
}
