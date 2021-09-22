import { TimerProcess } from '../../src/app/shared/interfaces';

export const mockTimerProcess: () => TimerProcess = (): TimerProcess => {
  const mock: TimerProcess = {
    _id: 'timer-step',
    cid: '0123456789012',
    type: 'timer',
    name: 'mock-timer-step',
    description: 'a mock timer step',
    duration: 30,
    concurrent: false,
    splitInterval: 1
  };
  return mock;
};
