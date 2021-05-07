/* Interface imports */
import { SelectedUnits } from '../../src/app/shared/interfaces/units';

/* Constant imports */
import * as units from '../../src/app/shared/constants/units';

export const mockEnglishUnits: () => SelectedUnits = (): SelectedUnits => {
  const mock: SelectedUnits = {
    system: 'englishStandard',
    weightSmall: units.WEIGHT_ENGLISH_SMALL,
    weightLarge: units.WEIGHT_ENGLISH_LARGE,
    volumeSmall: units.VOLUME_ENGLISH_SMALL,
    volumeLarge: units.VOLUME_ENGLISH_LARGE,
    temperature: units.TEMPERATURE_ENGLISH,
    density: units.SPECIFIC_GRAVITY
  };
  return mock;
};
