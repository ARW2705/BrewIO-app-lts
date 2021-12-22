/* Interface imports */
import { CalendarProcess, ManualProcess, ProcessUpdateEvent, TimerProcess } from '../../src/app/shared/interfaces';

/* Mock imports */
import { mockCalendarProcess } from './mock-calendar-process';
import { mockManualProcess } from './mock-manual-process';
import { mockTimerProcess } from './mock-timer-process';

export const mockProcessUpdateEvent: (type: string, addUpdate?: boolean, index?: number, deleteProcess?: boolean) => ProcessUpdateEvent = (type: string, addUpdate: boolean = false, index: number = -1, deleteProcess: boolean = false): ProcessUpdateEvent => {
  let process: CalendarProcess | ManualProcess | TimerProcess | { delete: boolean };
  let update: CalendarProcess | ManualProcess | TimerProcess;
  if (type === 'calendar') {
    const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
    _mockCalendarProcess.cid += '1';
    process = _mockCalendarProcess;
    if (addUpdate) {
      update = _mockCalendarProcess;
    }
  } else if (type === 'manual') {
    const _mockManualProcess: ManualProcess = mockManualProcess();
    _mockManualProcess.cid += '1';
    process = _mockManualProcess;
    if (addUpdate) {
      update = process;
    }
  } else if (type === 'timer') {
    const _mockTimerProcess: TimerProcess = mockTimerProcess();
    _mockTimerProcess.cid += '1';
    process = _mockTimerProcess;
    if (addUpdate) {
      update = process;
    }
  }
  const mock: ProcessUpdateEvent = {
    process,
    type
  };
  if (update) {
    Object.assign(mock, { toUpdate: update});
  }
  if (index !== -1) {
    Object.assign(mock, { index });
  }
  if (deleteProcess) {
    mock.process = { delete: true };
  }
  return mock;
};
