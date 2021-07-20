import { SelectedUnits } from '../interfaces';
import {
  SMALL_METRIC_VOLUME,
  SMALL_METRIC_WEIGHT,
  LARGE_METRIC_VOLUME,
  LARGE_METRIC_WEIGHT,
  METRIC_TEMPERATURE,
  SPECIFIC_GRAVITY
} from '../constants';

export const defaultMetricUnits = (): SelectedUnits => {
  const _default: SelectedUnits = {
    system: 'metric',
    weightSmall: SMALL_METRIC_WEIGHT,
    weightLarge: LARGE_METRIC_WEIGHT,
    volumeSmall: SMALL_METRIC_VOLUME,
    volumeLarge: LARGE_METRIC_VOLUME,
    temperature: METRIC_TEMPERATURE,
    density: SPECIFIC_GRAVITY
  };
  return _default;
};
