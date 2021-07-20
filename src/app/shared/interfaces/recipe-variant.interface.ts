import { GrainBill } from './grain-bill.interface';
import { HopsSchedule } from './hops-schedule.interface';
import { YeastBatch } from './yeast-batch.interface';
import { OtherIngredients } from './other-ingredients.interface';
import { Process } from './process.interface';

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
