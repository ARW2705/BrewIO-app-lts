/* Interface imports */
import { PrimaryValues } from '../../src/app/shared/interfaces';

export const mockPrimaryValues: () => PrimaryValues = (): PrimaryValues => {
  const mock: PrimaryValues = {
    originalGravity: 1.050,
    finalGravity: 1.010,
    batchVolume: 5,
    ABV: 5,
    IBU: 20,
    SRM: 10
  };
  return mock;
};
