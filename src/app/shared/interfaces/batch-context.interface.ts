import { GrainBill } from './grain-bill.interface';
import { HopsSchedule } from './hops-schedule.interface';
import { Image } from './image.interface';
import { YeastBatch } from './yeast-batch.interface';
import { OtherIngredients } from './other-ingredients.interface';

export interface BatchContext {
  recipeMasterName: string;
  recipeVariantName: string;
  recipeImage: Image;
  boilVolume: number;
  batchVolume: number;
  grains: GrainBill[];
  hops: HopsSchedule[];
  yeast: YeastBatch[];
  otherIngredients: OtherIngredients[];
}
