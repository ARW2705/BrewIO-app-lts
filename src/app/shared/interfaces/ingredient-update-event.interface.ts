import { GrainBill } from './grain-bill.interface';
import { HopsSchedule } from './hops-schedule.interface';
import { OtherIngredients } from './other-ingredients.interface';
import { YeastBatch } from './yeast-batch.interface';

export interface IngredientUpdateEvent {
  ingredient: GrainBill | HopsSchedule | OtherIngredients | YeastBatch | { delete: boolean };
  type: string;
  toUpdate?: GrainBill | HopsSchedule | OtherIngredients | YeastBatch;
}
