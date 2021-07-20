import { PrimaryValues } from './primary-values.interface';

export interface BatchAnnotations {
  styleId: string;
  targetValues: PrimaryValues;
  measuredValues: PrimaryValues;
  notes: string[];
  packagingDate?: string;
}
