/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, concat, of } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockBatch, mockProcessSchedule, mockTimer, mockConcurrentTimers, mockBatchTimer } from '../../../../test-config/mock-models';
import { PlatformStub } from '../../../../test-config/ionic-stubs';
import { BackgroundModeServiceStub, IdServiceStub, ErrorReportingServiceStub, LocalNotificationServiceStub, ProcessServiceStub, UtilityServiceStub } from '../../../../test-config/service-stubs';

/* Interface imports */
import { Batch, BatchTimer, Process, Timer, TimerProcess } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Service imports */
import { TimerService } from './timer.service';
import { BackgroundModeService, ErrorReportingService, IdService, LocalNotificationService, ProcessService, UtilityService } from '../services';


describe('TimerService', (): void => {
  let injector: TestBed;
  let timerService: TimerService;
  let originalMissingError: any;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        TimerService,
        { provide: Platform, useClass: PlatformStub },
        { provide: BackgroundModeService, useClass: BackgroundModeServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: LocalNotificationService, useClass: LocalNotificationServiceStub },
        { provide: ProcessService, useClass: ProcessServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ]
    });
    global.setInterval = jest
      .fn();
  }));

  beforeEach((): void => {
    injector = getTestBed();
    timerService = injector.get(TimerService);
    originalMissingError = timerService.getMissingError;
    timerService.getMissingError = jest
      .fn()
      .mockImplementation((base: string, additional: string): CustomError => {
        const message: string = `${base} ${additional}`;
        return new CustomError('TimerError', message, 2, message);
      });
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
        (error: Error): void => {
          expect(error.message).toMatch('An error occurred trying to add time to timer: missing timer Timer with id timer-id not found');
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

    timerService.idService.getNewId = jest
      .fn()
      .mockReturnValue('1234567890123');

    timerService.getSettings = jest
      .fn()
      .mockReturnValue(null);

    timerService.utilService.clone = jest
      .fn()
      .mockImplementation((obj: any): any => obj);

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

    timerService.idService.getNewId = jest
      .fn()
      .mockReturnValue('1234567890123');

    timerService.getSettings = jest
      .fn()
      .mockReturnValue(null);

    timerService.utilService.clone = jest
      .fn()
      .mockImplementation((obj: any): any => obj);

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
    const _mockProcess: TimerProcess = <TimerProcess>mockProcessSchedule()[10];

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

    timerService.idService.hasId = jest
      .fn()
      .mockReturnValue(true);

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

    timerService.isConcurrentTimer = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    expect(timerService.isConcurrent(_mockBatch, invalidIndex)).toBe(false);
    expect(timerService.isConcurrent(_mockBatch, concurrentIndex)).toBe(true);
    expect(timerService.isConcurrent(_mockBatch, endConcurrentIndex)).toBe(false);
  });

  test('should check if a process is a concurrent timer', (): void => {
    const _mockTimerProcess: TimerProcess = <TimerProcess>mockProcessSchedule()[2];
    _mockTimerProcess.concurrent = true;

    timerService.processService.isTimerProcess = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    expect(timerService.isConcurrentTimer(_mockTimerProcess)).toBe(true);
    expect(timerService.isConcurrentTimer(_mockTimerProcess)).toBe(false);
    _mockTimerProcess.concurrent = false;
    expect(timerService.isConcurrentTimer(_mockTimerProcess)).toBe(false);
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
        (error: Error): void => {
          expect(error.message).toMatch('An error occurred trying to reset timer: missing timer Timer with id timer-id not found');
          done();
        }
      );
  });

  test('should set timer progress', (): void => {
    const _mockTimer: Timer = mockTimer();
    _mockTimer.isRunning = true;
    _mockTimer.timer.duration = 60;
    _mockTimer.timeRemaining = 1801;

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
        (error: Error): void => {
          expect(error.message).toMatch('An error occurred trying to start timer Timer with id timer-id not found');
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

  test('should get a custom error for missing timer', (): void => {
    timerService.getMissingError = originalMissingError;
    const baseMessage: string = 'test base message';
    const additionalMessage: string = 'test additional message';
    const customError: CustomError = <CustomError>timerService.getMissingError(baseMessage, additionalMessage);

    expect(customError.name).toMatch('TimerError');
    expect(customError.message).toMatch(`${baseMessage} ${additionalMessage}`);
    expect(customError.severity).toEqual(2);
    expect(customError.userMessage).toMatch(baseMessage);
  });

});
