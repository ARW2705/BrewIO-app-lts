import { Unit } from './unit.interface';

export interface SelectedUnits {
  system: string;
  weightSmall: Unit;
  weightLarge: Unit;
  volumeSmall: Unit;
  volumeLarge: Unit;
  temperature: Unit;
  density: Unit;
}
