/* Module imports */
import { BehaviorSubject } from 'rxjs';

/* Interface imports */
import { Timer, BatchTimer } from '../../src/app/shared/interfaces';

/* Mock imports */
import { mockBatch } from './mock-batch';
import { mockConcurrentTimers } from './mock-concurrent-timers';
import { mockTimer } from './mock-timer';

export const mockBatchTimer: (isConcurrent?: boolean) => BatchTimer = (isConcurrent: boolean = false): BatchTimer => {
  let mock: BatchTimer;

  if (isConcurrent) {
    mock = {
      batchId: mockBatch().cid,
      timers: mockConcurrentTimers().map((timer: Timer): BehaviorSubject<Timer> => new BehaviorSubject<Timer>(timer))
    };
  } else {
    mock = {
      batchId: mockBatch().cid,
      timers: [new BehaviorSubject<Timer>(mockTimer())]
    };
  }

  return mock;
};
