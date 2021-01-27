import { Process } from './process';
import { Alert } from './alert';
import { Image } from './image';
import { PrimaryValues } from './primary-values';
import { Syncable } from './sync';
import { GrainBill } from './grain-bill';
import { HopsSchedule } from './hops-schedule';
import { YeastBatch } from './yeast-batch';
import { OtherIngredients } from './other-ingredients';

export interface Batch extends Syncable {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  cid: string;
  owner: string; // owner id of the batch, not author of recipe
  recipeMasterId: string;
  recipeVariantId: string;
  isArchived: boolean;
  annotations: BatchAnnotations;
  process: BatchProcess;
  contextInfo: BatchContext;
}

export interface BatchAnnotations {
  styleId: string;
  targetValues: PrimaryValues;
  measuredValues: PrimaryValues;
  notes: string[];
  packagingDate?: string;
}

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

export interface BatchProcess {
  currentStep: number;
  schedule: Process[];
  alerts: Alert[];
}
