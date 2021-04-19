import { BehaviorSubject } from 'rxjs';
import { Process } from '../../src/app/shared/interfaces/process';
import { Timer, BatchTimer } from '../../src/app/shared/interfaces/timer';
import { mockBatch } from './mock-batch';
import { mockProcessSchedule } from './mock-process-schedule';

export const mockTimer: () => Timer = (): Timer => {
  const _mockTimer: Process = mockProcessSchedule()[10];
  const mock: Timer = {
    first: _mockTimer.cid,
    timer: _mockTimer,
    cid: '0123456789011',
    timeRemaining: _mockTimer.duration / 2,
    show: true,
    expansion: {
      value: 'collapsed',
      params: {
        height: 0,
        speed: 0
      }
    },
    isRunning: false,
    settings: {
      height: 360,
      width: 360,
      circle: {
        strokeDasharray: '5',
        strokeDashoffset: '10',
        stroke: '2',
        strokeWidth: 1,
        fill: 'fill',
        radius: 1,
        originX: 1,
        originY: 1
      },
      text: {
        textX: 'textX',
        textY: 'textY',
        textAnchor: 'textAnchor',
        fill: 'fill',
        fontSize: 'fontSize',
        fontFamily: 'fontFamily',
        dY: 'dY',
        content: 'content'
      }
    }
  };
  return mock;
};

export const mockConcurrentTimers: () => Timer[] = (): Timer[] => {
  const _mockTimer: Process[] = mockProcessSchedule().slice(2, 4);
  const mock1: Timer = {
    first: _mockTimer[0].cid,
    timer: _mockTimer[0],
    cid: '0123456789012',
    timeRemaining: _mockTimer[0].duration / 2,
    show: true,
    expansion: {
      value: 'collapsed',
      params: {
        height: 0,
        speed: 0
      }
    },
    isRunning: false,
    settings: {
      height: 360,
      width: 360,
      circle: {
        strokeDasharray: '5',
        strokeDashoffset: '10',
        stroke: '2',
        strokeWidth: 1,
        fill: 'fill',
        radius: 1,
        originX: 1,
        originY: 1
      },
      text: {
        textX: 'textX',
        textY: 'textY',
        textAnchor: 'textAnchor',
        fill: 'fill',
        fontSize: 'fontSize',
        fontFamily: 'fontFamily',
        dY: 'dY',
        content: 'content'
      }
    }
  };
  const mock2: Timer = {
    first: _mockTimer[0].cid,
    timer: _mockTimer[1],
    cid: '0123456789013',
    timeRemaining: _mockTimer[1].duration / 2,
    show: true,
    expansion: {
      value: 'collapsed',
      params: {
        height: 0,
        speed: 0
      }
    },
    isRunning: false,
    settings: {
      height: 360,
      width: 360,
      circle: {
        strokeDasharray: '5',
        strokeDashoffset: '10',
        stroke: '2',
        strokeWidth: 1,
        fill: 'fill',
        radius: 1,
        originX: 1,
        originY: 1
      },
      text: {
        textX: 'textX',
        textY: 'textY',
        textAnchor: 'textAnchor',
        fill: 'fill',
        fontSize: 'fontSize',
        fontFamily: 'fontFamily',
        dY: 'dY',
        content: 'content'
      }
    }
  };
  return [ mock1, mock2 ];
};

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
