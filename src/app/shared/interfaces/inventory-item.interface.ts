import { OptionalItemData } from './optional-item-data.interface';

export interface InventoryItem {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  cid: string;
  currentQuantity: number;
  description: string;
  initialQuantity: number;
  itemABV: number;
  itemName: string;
  itemStyleId: string;
  itemStyleName: string;
  optionalItemData: OptionalItemData;
  sourceType: string;
  stockType: string;
  supplierName: string;
}
