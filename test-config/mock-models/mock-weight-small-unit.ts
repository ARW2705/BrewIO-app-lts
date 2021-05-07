/* Interface imports */
import { Unit } from '../../src/app/shared/interfaces/units';

export const mockWeightSmallUnit: () => Unit = (): Unit => {
  const mock: Unit = {
    system: 'englishStandard',
    longName: 'ounce',
    shortName: 'oz'
  };
  return mock;
};
