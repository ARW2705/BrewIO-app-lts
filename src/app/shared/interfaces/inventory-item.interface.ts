import { OptionalItemData } from './optional-item-data.interface';

export interface InventoryItem {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  cid: string;
  supplierName: string;
  stockType: string;
  initialQuantity: number;
  currentQuantity: number;
  description: string;
  itemName: string;
  itemStyleId: string;
  itemStyleName: string;
  itemABV: number;
  sourceType: string;
  optionalItemData: OptionalItemData;
}
