import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InventoryTypeGuardServiceStub {
  public checkTypeSafety(...options: any) {}
  public getUnsafeError(...options: any) {}
  public isSafeInventoryItem(...options: any) {}
  public isSafeOptionalItemData(...options: any) {}
}
