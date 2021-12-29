/* Module imports */
import { Injectable } from '@angular/core';

/* Constant imports */
import { HIGH_SEVERITY } from '@shared/constants';

/* Type Guards */
import { InventoryItemGuardMetadata, OptionalItemDataGuardMetadata } from '@shared/type-guard-metadata';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { TypeGuardService } from '@services/type-guard/type-guard.service';


@Injectable({
  providedIn: 'root'
})
export class InventoryTypeGuardService {

  constructor(public typeGuard: TypeGuardService) { }

  /**
   * Runtime check given InventoryItem for type correctness; throws error on check failed
   *
   * @param: inventoryItem - the item to check
   * @return: none
   */
  checkTypeSafety(inventoryItem: any): void {
    if (!this.isSafeInventoryItem(inventoryItem)) {
      throw this.getUnsafeError(inventoryItem);
    }
  }

  /**
   * Get a custom error on unsafe inventory item type
   *
   * @param: thrownFor - the original error thrown
   * @return: new custom error
   */
  getUnsafeError(thrownFor: any): Error {
    return new CustomError(
      'InventoryError',
      `Given inventory item is invalid: got ${JSON.stringify(thrownFor, null, 2)}`,
      HIGH_SEVERITY,
      'An internal error occurred: invalid inventory item'
    );
  }

  /**
   * Check if given inventory item is type safe at runtime
   *
   * @param: inventoryItem - the item to check
   * @return: true if item and component property types are valid
   */
  isSafeInventoryItem(inventoryItem: any): boolean {
    if (!this.typeGuard.hasValidProperties(inventoryItem, InventoryItemGuardMetadata)) {
      return false;
    }
    return this.isSafeOptionalItemData(inventoryItem.optionalItemData);
  }

  /**
   * Check if given inventory item optional item data is type safe at runtime
   *
   * @param: optionalItemData - the optional data object to check
   * @return: true if optional item data types are valid
   */
  isSafeOptionalItemData(optionalItemData: any): boolean {
    return this.typeGuard.hasValidProperties(optionalItemData, OptionalItemDataGuardMetadata);
  }
}
