import { SelectedUnits } from '../interfaces';
import {
  SMALL_ENGLISH_VOLUME,
  SMALL_ENGLISH_WEIGHT,
  LARGE_ENGLISH_VOLUME,
  LARGE_ENGLISH_WEIGHT,
  ENGLISH_TEMPERATURE,
  SPECIFIC_GRAVITY
} from '../constants';

export const defaultEnglishUnits = (): SelectedUnits => {
  const _default: SelectedUnits = {
    system: 'englishStandard',
    weightSmall: SMALL_ENGLISH_WEIGHT,
    weightLarge: LARGE_ENGLISH_WEIGHT,
    volumeSmall: SMALL_ENGLISH_VOLUME,
    volumeLarge: LARGE_ENGLISH_VOLUME,
    temperature: ENGLISH_TEMPERATURE,
    density: SPECIFIC_GRAVITY
  };
  return _default;
};
