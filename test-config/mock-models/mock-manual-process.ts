/* Interface imports */
import { ManualProcess } from '../../src/app/shared/interfaces';

export const mockManualProcess: () => ManualProcess = (): ManualProcess => {
  const mock: ManualProcess = {
    _id: 'manual-step',
    cid: '0123456789012',
    type: 'manual',
    name: 'mock-manual-step',
    description: 'a mock manual step',
    expectedDuration: 30
  };
  return mock;
};
