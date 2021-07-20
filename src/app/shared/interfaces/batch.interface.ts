import { BatchAnnotations } from './batch-annotations.interface';
import { BatchContext } from './batch-context.interface';
import { BatchProcess } from './batch-process.interface';

export interface Batch {
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
