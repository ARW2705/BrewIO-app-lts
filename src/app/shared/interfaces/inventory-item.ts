import { Image } from './image';

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

export interface OptionalItemData {
  batchId?: string;
  supplierURL?: string;
  supplierLabelImage?: Image;
  itemIBU?: number;
  itemSRM?: number;
  itemLabelImage?: Image;
  itemSubname?: string;
  packagingDate?: string;
  originalRecipe?: string;
  srmColor?: string;
  remainingColor?: string;
}
