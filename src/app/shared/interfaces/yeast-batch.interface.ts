import { Yeast } from './yeast.interface';

export interface YeastBatch {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  yeastType: Yeast;
  quantity: number; // packs/vials
  requiresStarter: boolean;
}
