import { BatchAnnotations } from '../../src/app/shared/interfaces';

import { mockStyles } from './mock-styles';

export const mockBatchAnnotations: () => BatchAnnotations = (): BatchAnnotations => {
  const mock: BatchAnnotations = {
    styleId: mockStyles()[0]._id,
    targetValues: {
      originalGravity: 1.050,
      finalGravity: 1.010,
      efficiency: 70,
      batchVolume: 5,
      ABV: 5.25,
      IBU: 30,
      SRM: 20
    },
    measuredValues: {
      originalGravity: 1.055,
      finalGravity: 1.012,
      efficiency: 70,
      batchVolume: 5,
      ABV: 5.64,
      IBU: 30,
      SRM: 20
    },
    notes: [],
    packagingDate: 'package-date'
  };
  return mock;
};
