import { Image } from './image.interface';

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
