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
  itemIBU?: number;
  itemLabelImage?: Image;
  itemSRM?: number;
  itemSubname?: string;
  originalRecipe?: string;
  packagingDate?: string;
  remainingColor?: string;
  srmColor?: string;
  supplierLabelImage?: Image;
  supplierURL?: string;
}
