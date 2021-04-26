/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, concat, forkJoin, of } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockBatch } from '../../../../test-config/mock-models/mock-batch';
import { mockProcessSchedule } from '../../../../test-config/mock-models/mock-process-schedule';
import { mockTimer, mockConcurrentTimers, mockBatchTimer } from '../../../../test-config/mock-models/mock-timer';
import { BackgroundModeServiceMock, ClientIdServiceMock, LocalNotificationServiceMock } from '../../../../test-config/mocks-app';
import { PlatformMock } from '../../../../test-config/mocks-ionic';

/* Interface imports */
import { Batch } from '../../shared/interfaces/batch';
import { Process } from '../../shared/interfaces/process';
import { ProgressCircleSettings } from '../../shared/interfaces/progress-circle';
import { Timer, BatchTimer } from '../../shared/interfaces/timer';

/* Service imports */
import { TimerService } from './timer.service';
import { BackgroundModeService } from '../background-mode/background-mode.service';
import { ClientIdService } from '../client-id/client-id.service';
import { LocalNotificationService } from '../local-notification/local-notification.service';


describe('TimerService', (): void => {
  let injector: TestBed;
  let timerService: TimerService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        TimerService,
        { provide: Platform, useClass: PlatformMock },
        { provide: BackgroundModeService, useClass: BackgroundModeServiceMock },
        { provide: ClientIdService, useClass: ClientIdServiceMock },
        { provide: LocalNotificationService, useClass: LocalNotificationServiceMock }
      ]
    });
    global.setInterval = jest
      .fn();
  }));

  beforeEach((): void => {
    injector = getTestBed();
    timerService = injector.get(TimerService);
  });

  test('should create the service', (): void => {
    expect(timerService).toBeDefined();
  });

  test('add a batch timer', (): void => {
    const _mockBatch: Batch = mockBatch();
    const _mockTimer: Timer = mockTimer();

    timerService.getBatchTimerById = jest
      .fn()
      .mockReturnValue(undefined);

    timerService.generateNewTimerSubject = jest
      .fn()
      .mockReturnValue(new BehaviorSubject<Timer>(_mockTimer));

    timerService.isConcurrent = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);

    expect(timerService.batchTimers.length).toEqual(0);

    timerService.addBatchTimer(_mockBatch);

    expect(timerService.batchTimers.length).toEqual(1);
    expect(timerService.batchTimers[0].timers.length).toEqual(7);
  });

  test('should add time to a timer', (done: jest.DoneCallback): void => {
    const _mockTimer: Timer = mockTimer();
    const _mockTimer$: BehaviorSubject<Timer> = new BehaviorSubject<Timer>(_mockTimer);
    const initialDuration: number = _mockTimer.timer.duration;
    const initialTimeRemaining: number = _mockTimer.timeRemaining;

    timerService.getTimerSubjectById = jest
      .fn()
      .mockReturnValue(_mockTimer$);

    timerService.setProgress = jest
      .fn();

    timerService.addTimeToTimer('batch-id', 'timer-id')
      .subscribe(
        (updated: Timer): void => {
          expect(updated.timer.duration).toEqual(initialDuration + 1);
          expect(updated.timeRemaining).toEqual(initialTimeRemaining + 60);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should add time to a timer'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get an error adding time to a missing timer', (done: jest.DoneCallback): void => {
    timerService.getTimerSubjectById = jest
      .fn()
      .mockReturnValue(undefined);

    timerService.addTimeToTimer('batch-id', 'timer-id')
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('Error adding time: timer not found');
          done();
        }
      );
  });

  test('should format text of a progress circle', (): void => {
    expect(timerService.formatProgressCircleText(3700)).toMatch('1:01:40');
    expect(timerService.formatProgressCircleText(1800)).toMatch('30:00');
    expect(timerService.formatProgressCircleText(3600)).toMatch('1:00:00');
    expect(timerService.formatProgressCircleText(-1).length).toEqual(0);
  });

  test('should generate a new (non-concurrent) Timer subject', (): void => {
    const _mockBatch: Batch = mockBatch();
    const schedule: Process[] = _mockBatch.process.schedule;
    const testIndex: number = 10;

    timerService.clientIdService.getNewId = jest
      .fn()
      .mockReturnValue('1234567890123');

    timerService.getSettings = jest
      .fn()
      .mockReturnValue(null);

    const newTimer$: BehaviorSubject<Timer> = timerService.generateNewTimerSubject(_mockBatch, testIndex, 0);
    const newTimer: Timer = newTimer$.value;

    expect(newTimer.first).toMatch(schedule[testIndex].cid);
    expect(newTimer.timer).toStrictEqual(schedule[testIndex]);
    expect(newTimer.show).toBe(false);
  });

  test('should generage a new (concurrent) Timer subject', (): void => {
    const _mockBatch: Batch = mockBatch();
    const schedule: Process[] = _mockBatch.process.schedule;
    const testIndex: number = 2;

    timerService.clientIdService.getNewId = jest
      .fn()
      .mockReturnValue('1234567890123');

    timerService.getSettings = jest
      .fn()
      .mockReturnValue(null);

    const newTimer$: BehaviorSubject<Timer> = timerService.generateNewTimerSubject(_mockBatch, testIndex, 1);
    const newTimer: Timer = newTimer$.value;

    expect(newTimer.first).toMatch(schedule[testIndex - 1].cid);
    expect(newTimer.timer).toStrictEqual(schedule[testIndex]);
    expect(newTimer.show).toBe(false);
  });

  test('should get a batch timer by batch id', (): void => {
    const _mockBatch: Batch = mockBatch();
    const _mockBatchTimer: BatchTimer = mockBatchTimer();

    timerService.batchTimers.push(_mockBatchTimer);

    const batchTimer: BatchTimer = timerService.getBatchTimerById(_mockBatch.cid);

    expect(batchTimer).toStrictEqual(_mockBatchTimer);

    const notFound: BatchTimer = timerService.getBatchTimerById('not-found');

    expect(notFound).toBeUndefined();
  });

  test('should get font size as css value string', (): void => {
    timerService.timerWidth = 360;

    expect(timerService.getFontSize(3700)).toMatch('72px');
    expect(timerService.getFontSize(1500)).toMatch('90px');
    expect(timerService.getFontSize(10)).toMatch('120px');
  });

  test('should get a formatted duration string', (): void => {
    expect(timerService.getFormattedDurationString(100)).toMatch('1 hour 40 minutes');
    expect(timerService.getFormattedDurationString(120)).toMatch('2 hours');
    expect(timerService.getFormattedDurationString(1)).toMatch('1 minute');
  });

  test('get process circle settings', (): void => {
    const _mockProcess: Process = mockProcessSchedule()[10];

    timerService.timerHeight = 360;
    timerService.timerWidth = 360;
    timerService.circumference = 100;
    timerService.timerStroke = '2';
    timerService.timerStrokeWidth = 4;
    timerService.timerCircleFill = 'circle-fill';
    timerService.timerRadius = 30;
    timerService.timerOriginX = 50;
    timerService.timerOriginY = 50;
    timerService.timerTextXY = '50%';
    timerService.timerTextAnchor = 'middle';
    timerService.timerTextFill = 'text-fill';
    timerService.timerFontFamily = 'family';
    timerService.timerDY = 'dy';

    timerService.getFontSize = jest
      .fn()
      .mockReturnValue('72px');

    timerService.formatProgressCircleText = jest
      .fn()
      .mockReturnValue('1:00:00');

    expect(timerService.getSettings(_mockProcess))
      .toStrictEqual({
        height: 360,
        width: 360,
        circle: {
          strokeDasharray: '100 100',
          strokeDashoffset: '0',
          stroke: '2',
          strokeWidth: 4,
          fill: 'circle-fill',
          radius: 30,
          originX: 50,
          originY: 50
        },
        text: {
          textX: '50%',
          textY: '50%',
          textAnchor: 'middle',
          fill: 'text-fill',
          fontSize: '72px',
          fontFamily: 'family',
          dY: 'dy',
          content: '1:00:00'
        }
      });
  });

  test('should get all timers by the process id', (): void => {
    const _mockBatchTimer: BatchTimer = mockBatchTimer(true);
    const _mockProcess: Process = mockProcessSchedule()[2];

    timerService.getBatchTimerById = jest
      .fn()
      .mockReturnValue(_mockBatchTimer);

    expect(timerService.getTimersByProcessId('batch-id', _mockProcess.cid).length).toEqual(2);
    expect(timerService.getTimersByProcessId('batch-id', 'not-found-id').length).toEqual(0);
  });

  test('should get undefined if getting timers by process id and missing timer', (): void => {
    timerService.getBatchTimerById = jest
      .fn()
      .mockReturnValue(undefined);

    expect(timerService.getTimersByProcessId('batch-id', 'process-id')).toBeUndefined();
  });

  test('should get a timer subject by id', (): void => {
    const _mockBatch: Batch = mockBatch();
    const _mockTimer: Timer = mockTimer();
    const _mockConcurrentTimers: Timer[] = mockConcurrentTimers();
    const _mockConcurrentTimer: Timer = _mockConcurrentTimers[0];
    const _mockBatchTimer: BatchTimer = mockBatchTimer();
    const _mockBatchTimerConcurrent: BatchTimer = mockBatchTimer(true);

    timerService.getBatchTimerById = jest
      .fn()
      .mockReturnValueOnce(_mockBatchTimer)
      .mockReturnValueOnce(_mockBatchTimerConcurrent);

    const timer$: BehaviorSubject<Timer> = timerService.getTimerSubjectById(_mockBatch.cid, _mockTimer.cid);

    expect(timer$.value).toStrictEqual(_mockTimer);

    const concurrentTimer$: BehaviorSubject<Timer> = timerService.getTimerSubjectById(_mockBatch.cid, _mockConcurrentTimer.cid);

    expect(concurrentTimer$.value).toStrictEqual(_mockConcurrentTimer);
  });

  test('should get undefined if getting timer subject id and missing batch timer', (): void => {
    timerService.getBatchTimerById = jest
      .fn()
      .mockReturnValue(undefined);

    expect(timerService.getTimerSubjectById('batch-id', 'process-id')).toBeUndefined();
  });

  test('should initialize settings', (): void => {
    timerService.platform.width = jest
      .fn()
      .mockReturnValue(600);

    timerService.initializeSettings();

    const expectedWidth: number = 400;
    const expectedRadius: number = 184;
    const expectedCircumference: number = expectedRadius * 2 * Math.PI;

    expect(timerService.circumference).toEqual(expectedCircumference);
    expect(timerService.timerHeight).toEqual(expectedWidth);
    expect(timerService.timerWidth).toEqual(expectedWidth);
    expect(timerService.timerStrokeWidth).toEqual(8);
    expect(timerService.timerRadius).toEqual(expectedRadius);
    expect(timerService.timerOriginX).toEqual(expectedWidth / 2);
    expect(timerService.timerOriginY).toEqual(expectedWidth / 2);
    expect(timerService.timerDY).toMatch('0.5em');
  });

  test('should check if process is concurrent', (): void => {
    const _mockBatch: Batch = mockBatch();
    const invalidIndex: number = _mockBatch.process.schedule.length;
    const concurrentIndex: number = 2;
    const endConcurrentIndex: number = 3;

    expect(timerService.isConcurrent(_mockBatch, invalidIndex)).toBe(false);
    expect(timerService.isConcurrent(_mockBatch, concurrentIndex)).toBe(true);
    expect(timerService.isConcurrent(_mockBatch, endConcurrentIndex)).toBe(false);
  });

  test('should remove a batch timer', (): void => {
    const _mockBatchTimer: BatchTimer = mockBatchTimer();

    const completeSpy: jest.SpyInstance = jest.spyOn(_mockBatchTimer.timers[0], 'complete');

    timerService.batchTimers = [_mockBatchTimer];

    timerService.removeBatchTimer(_mockBatchTimer.batchId);

    expect(timerService.batchTimers.length).toEqual(0);
    expect(completeSpy).toHaveBeenCalled();
  });

  test('should perform no actions removing a batch timer that is missing', (): void => {
    const _mockBatchTimer: BatchTimer = mockBatchTimer();

    const completeSpy: jest.SpyInstance = jest.spyOn(_mockBatchTimer.timers[0], 'complete');

    timerService.removeBatchTimer(_mockBatchTimer.batchId);

    expect(timerService.batchTimers.length).toEqual(0);
    expect(completeSpy).not.toHaveBeenCalled();
  });

  test('should reset a timer', (done: jest.DoneCallback): void => {
    const _mockTimer: Timer = mockTimer();
    const _mockTimer$: BehaviorSubject<Timer> = new BehaviorSubject<Timer>(_mockTimer);
    const initialDuration: number = _mockTimer.timer.duration;
    const initialTimeRemaining: number = _mockTimer.timer.duration * 60;
    _mockTimer.timer.duration++;
    _mockTimer.timeRemaining = 10;

    timerService.getTimerSubjectById = jest
      .fn()
      .mockReturnValue(_mockTimer$);

    timerService.setProgress = jest
      .fn();

    timerService.resetTimer('batch-id', 'timer-id', initialDuration)
      .subscribe(
        (updated: Timer): void => {
          expect(updated.timer.duration).toEqual(initialDuration);
          expect(updated.timeRemaining).toEqual(initialTimeRemaining);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should reset a timer'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get an error resetting a missing timer', (done: jest.DoneCallback): void => {
    timerService.getTimerSubjectById = jest
      .fn()
      .mockReturnValue(undefined);

    timerService.resetTimer('batch-id', 'timer-id', 60)
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('Timer not found');
          done();
        }
      );
  });

  test('should set timer progress', (): void => {
    const _mockTimer: Timer = mockTimer();
    _mockTimer.isRunning = true;
    _mockTimer.timer.duration = 60;
    _mockTimer.timeRemaining = 1801;
    // _mockTimer.timer.splitInterval = 2;

    timerService.getFontSize = jest
      .fn()
      .mockReturnValue('90px');

    timerService.formatProgressCircleText = jest
      .fn()
      .mockReturnValue('30:00');

    timerService.notificationService.setLocalNotification = jest
      .fn();

    const localSpy: jest.SpyInstance = jest.spyOn(timerService.notificationService, 'setLocalNotification');

    timerService.setProgress(_mockTimer);
    expect(_mockTimer.settings.text.content).toMatch('30:00');
    expect(localSpy).not.toHaveBeenCalled();

    _mockTimer.timer.splitInterval = 2;
    timerService.setProgress(_mockTimer);
    expect(localSpy).not.toHaveBeenCalled();

    _mockTimer.timeRemaining = 1800;
    timerService.setProgress(_mockTimer);
    expect(localSpy).toHaveBeenCalledWith(`${_mockTimer.timer.name} interval complete!`);

    expect(_mockTimer.settings.text.content).toMatch('30:00');
    expect(localSpy).toHaveBeenCalledWith(`${_mockTimer.timer.name} interval complete!`);

    _mockTimer.timeRemaining = 0;
    timerService.setProgress(_mockTimer);
    expect(_mockTimer.isRunning).toBe(false);
    expect(localSpy).toHaveBeenCalledWith(`${_mockTimer.timer.name} complete!`);
  });

  test('should start a timer', (done: jest.DoneCallback): void => {
    const _mockTimer: Timer = mockTimer();

    timerService.switchTimer = jest
      .fn()
      .mockReturnValue(of(_mockTimer));

    const switchSpy: jest.SpyInstance = jest.spyOn(timerService, 'switchTimer');

    timerService.startTimer('batch-id', 'timer-id')
      .subscribe(
        (): void => {
          expect(switchSpy).toHaveBeenCalledWith('batch-id', 'timer-id', true);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should start a timer'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should stop a timer', (done: jest.DoneCallback): void => {
    const _mockTimer: Timer = mockTimer();

    timerService.switchTimer = jest
      .fn()
      .mockReturnValue(of(_mockTimer));

    const switchSpy: jest.SpyInstance = jest.spyOn(timerService, 'switchTimer');

    timerService.stopTimer('batch-id', 'timer-id')
      .subscribe(
        (): void => {
          expect(switchSpy).toHaveBeenCalledWith('batch-id', 'timer-id', false);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should stop a timer'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should switch timer running status', (done: jest.DoneCallback): void => {
    const _mockTimer: Timer = mockTimer();
    _mockTimer.isRunning = false;
    const _mockTimer$: BehaviorSubject<Timer> = new BehaviorSubject<Timer>(_mockTimer);

    timerService.getTimerSubjectById = jest
      .fn()
      .mockReturnValue(_mockTimer$);

    timerService.setProgress = jest
      .fn();

    let shouldBe: boolean = true;
    concat(
      timerService.switchTimer('batch-id', 'timer-id', shouldBe),
      timerService.switchTimer('batch-id', 'timer-id', shouldBe),
      timerService.switchTimer('batch-id', 'timer-id', shouldBe)
    )
    .subscribe(
      (timer: Timer): void => {
        expect(timer.isRunning).toBe(shouldBe);
        shouldBe = !shouldBe;
        done();
      },
      (error: any): void => {
        console.log(`Error in 'should switch timer running status'`, error);
        expect(true).toBe(false);
      }
    );
  });

  test('should get an error switching a missing timer', (done: jest.DoneCallback): void => {
    timerService.getTimerSubjectById = jest
      .fn()
      .mockReturnValue(undefined);

    timerService.switchTimer('batch-id', 'timer-id', true)
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('Timer switch error: timer not found');
          done();
        }
      );
  });

  test('should perform tick actions', (): void => {
    const _mockBatchTimer: BatchTimer = mockBatchTimer();
    const timer$: BehaviorSubject<Timer> = _mockBatchTimer.timers[0];
    const timer: Timer = timer$.value;
    timer.isRunning = false;
    timer$.next(timer);

    const _mockBatchTimerConcurrent: BatchTimer = mockBatchTimer(true);
    const concurrentTimers: BehaviorSubject<Timer>[] = _mockBatchTimerConcurrent.timers;
    concurrentTimers.forEach((concurrentTimer$: BehaviorSubject<Timer>, index: number): void => {
      const _timer: Timer = concurrentTimer$.value;
      _timer.isRunning = true;
      _timer.timeRemaining = index % 2 === 0 ? 100 : 0;
      concurrentTimer$.next(_timer);
    });
    console.log(concurrentTimers[0].value.timeRemaining, concurrentTimers[1].value.timeRemaining);

    timerService.batchTimers = [ _mockBatchTimer, _mockBatchTimerConcurrent ];

    timerService.backgroundModeService.enableBackgroundMode = jest
      .fn();

    timerService.setProgress = jest
      .fn();

    timerService.updatedBackgroundNotifications = jest
      .fn();

    const enableSpy: jest.SpyInstance = jest.spyOn(timerService.backgroundModeService, 'enableBackgroundMode');
    const updateSpy: jest.SpyInstance = jest.spyOn(timerService, 'updatedBackgroundNotifications');

    timerService.tick();

    expect(_mockBatchTimerConcurrent.timers[1].value.isRunning).toBe(false);
    expect(_mockBatchTimerConcurrent.timers[0].value.timeRemaining).toEqual(99);
    expect(enableSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith([_mockBatchTimerConcurrent.timers[0].value]);
  });

  test('should update background notifications', (): void => {
    const _mockConcurrentTimers: Timer[] = mockConcurrentTimers();
    _mockConcurrentTimers[0].timeRemaining = 200;
    _mockConcurrentTimers[0].settings.text.content = '200';
    _mockConcurrentTimers[1].timeRemaining = 100;
    _mockConcurrentTimers[1].settings.text.content = '100';

    timerService.platform.is = jest
      .fn()
      .mockReturnValue(true);

    timerService.backgroundModeService.isActive = jest
      .fn()
      .mockReturnValue(true);

    timerService.backgroundModeService.setNotification = jest
      .fn();

    const notifySpy: jest.SpyInstance = jest.spyOn(timerService.backgroundModeService, 'setNotification');
    const disableSpy: jest.SpyInstance = jest.spyOn(timerService.backgroundModeService, 'disableBackgroundMode');

    timerService.updatedBackgroundNotifications(_mockConcurrentTimers);

    expect(notifySpy).toHaveBeenCalledWith(
      `${_mockConcurrentTimers[1].timer.name}: 100`,
      '2 timers running'
    );
    expect(disableSpy).not.toHaveBeenCalled();

    timerService.updatedBackgroundNotifications([]);

    expect(disableSpy).toHaveBeenCalled();
  });

});