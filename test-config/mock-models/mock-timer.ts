/* Interface imports */
import { Process } from '../../src/app/shared/interfaces/process';
import { Timer } from '../../src/app/shared/interfaces/timer';

/* Mock imports */
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
