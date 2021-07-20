/* Interface imports */
import { SelectedUnits } from '../../src/app/shared/interfaces';

/* Constant imports */
import {
  METRIC_TEMPERATURE,
  LARGE_METRIC_VOLUME,
  LARGE_METRIC_WEIGHT,
  SMALL_METRIC_VOLUME,
  SMALL_METRIC_WEIGHT,
  SPECIFIC_GRAVITY
} from '../../src/app/shared/constants';

export const mockMetricUnits: () => SelectedUnits = (): SelectedUnits => {
  const mock: SelectedUnits = {
    system: 'metric',
    weightSmall: SMALL_METRIC_WEIGHT,
    weightLarge: LARGE_METRIC_WEIGHT,
    volumeSmall: SMALL_METRIC_VOLUME,
    volumeLarge: LARGE_METRIC_VOLUME,
    temperature: METRIC_TEMPERATURE,
    density: SPECIFIC_GRAVITY
  };
  return mock;
};
