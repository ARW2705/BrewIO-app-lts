import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InventoryHttpServiceStub {
  public configureSyncBackgroundRequest(...options: any) {}
  public getBackgroundRequest(...options: any) {}
  public getInventoryFromServer() {}
  public requestInBackground(...options: any) {}
}
