/* Module imports */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/* Interface imports*/
import { Batch, InventoryItem } from '@shared/interfaces';

/* Service imports */
import { InventoryStateService } from '@services/inventory/state/inventory-state.service';


@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(public inventoryStateService: InventoryStateService) {}

  /**
   * Create a new inventory item
   *
   * @param: newItemValues - values to construct the new inventory item
   * @return: observable of boolean on success
   */
  createItem(newItemValues: object): Observable<null> {
    return this.inventoryStateService.createItem(newItemValues);
  }

  /**
   * Create a new inventory item based on a given batch
   *
   * @param: batch - batch to base item from
   * @param: newItemValues - values not contained in batch
   * @return: observable of boolean on success
   */
  createItemFromBatch(batch: Batch, newItemValues: object): Observable<boolean> {
    return this.inventoryStateService.createItemFromBatch(batch, newItemValues);
  }

  /**
   * Get the inventory list
   *
   * @param: none
   * @return: BehaviorSubject of inventory item list
   */
  getInventoryList(): BehaviorSubject<InventoryItem[]> {
    return this.inventoryStateService.getInventoryList();
  }

  /**
   * Remove an item from inventory
   *
   * @param: itemId - id of item to remove
   * @return: observable of null on completion
   */
  removeItem(itemId: string): Observable<null> {
    return this.inventoryStateService.removeItem(itemId);
  }

  /**
   * Update an item
   *
   * @param: itemId - the item id to update
   * @param: update - updated values to apply
   * @return: observable of updated item
   */
  updateItem(itemId: string, update: object): Observable<InventoryItem> {
    return this.inventoryStateService.updateItem(itemId, update);
  }

  /**
   * Check if inventory stock type is based on capacity instead of discrete units
   *
   * @param: item - item with stock data
   * @return: true if stock type is 'growler' or 'keg'
   */
  isCapacityBased(item: InventoryItem): boolean {
    const stockType: string = item.stockType.toLowerCase();
    return stockType === 'growler' || stockType === 'keg';
  }

}
