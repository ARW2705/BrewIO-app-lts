/* Interface imports */
import { SelectedUnits } from '../../src/app/shared/interfaces/units';

/* Constant imports */
import * as units from '../../src/app/shared/constants/units';

export const mockMetricUnits: () => SelectedUnits = (): SelectedUnits => {
  const mock: SelectedUnits = {
    system: 'metric',
    weightSmall: units.WEIGHT_METRIC_SMALL,
    weightLarge: units.WEIGHT_METRIC_LARGE,
    volumeSmall: units.VOLUME_METRIC_SMALL,
    volumeLarge: units.VOLUME_METRIC_LARGE,
    temperature: units.TEMPERATURE_METRIC,
    density: units.SPECIFIC_GRAVITY
  };
  return mock;
};
