/* Interface imports */
import { SelectedUnits } from '../../src/app/shared/interfaces';

/* Constant imports */
import {
  ENGLISH_TEMPERATURE,
  LARGE_ENGLISH_VOLUME,
  LARGE_ENGLISH_WEIGHT,
  SMALL_ENGLISH_VOLUME,
  SMALL_ENGLISH_WEIGHT,
  SPECIFIC_GRAVITY
} from '../../src/app/shared/constants';

export const mockEnglishUnits: () => SelectedUnits = (): SelectedUnits => {
  const mock: SelectedUnits = {
    system: 'englishStandard',
    weightSmall: SMALL_ENGLISH_WEIGHT,
    weightLarge: LARGE_ENGLISH_WEIGHT,
    volumeSmall: SMALL_ENGLISH_VOLUME,
    volumeLarge: LARGE_ENGLISH_VOLUME,
    temperature: ENGLISH_TEMPERATURE,
    density: SPECIFIC_GRAVITY
  };
  return mock;
};
