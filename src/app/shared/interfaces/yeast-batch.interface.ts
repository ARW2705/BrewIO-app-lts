import { Yeast } from './yeast.interface';

export interface YeastBatch {
  yeastType: Yeast;
  quantity: number; // packs/vials
  requiresStarter: boolean;
}
