import { GrainBill } from './grain-bill';
import { HopsSchedule } from './hops-schedule';
import { YeastBatch } from './yeast-batch';
import { OtherIngredients } from './other-ingredients';
import { Process } from './process';

export interface RecipeVariant {
  _id?: string;
  cid: string;
  variantName: string;
  notes: string[];
  isFavorite: boolean;
  isMaster: boolean;
  rating?: number;
  owner?: string;
  efficiency: number;
  brewingType: string;
  mashDuration: number;
  boilDuration: number;
  batchVolume: number;
  boilVolume: number;
  mashVolume: number;
  originalGravity: number;
  finalGravity: number;
  ABV: number;
  IBU: number;
  SRM: number;
  grains: GrainBill[];
  hops: HopsSchedule[];
  yeast: YeastBatch[];
  otherIngredients: OtherIngredients[];
  processSchedule: Process[];
}
