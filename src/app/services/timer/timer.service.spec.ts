/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockBatch, mockErrorReport, mockProcessSchedule, mockTimer, mockConcurrentTimers, mockBatchTimer } from '@test/mock-models';
import { PlatformStub } from '@test/ionic-stubs';
import { BackgroundModeServiceStub, IdServiceStub, ErrorReportingServiceStub, LocalNotificationServiceStub, ProcessServiceStub, UtilityServiceStub } from '@test/service-stubs';

/* Interface imports */
import { Batch, BatchTimer, ErrorReport, Process, Timer, TimerProcess } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { BackgroundModeService, ErrorReportingService, IdService, LocalNotificationService, ProcessService, UtilityService } from '@services/public';
import { TimerService } from './timer.service';


describe('TimerService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: TimerService;
  let originalMissingError: any;

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
    global.setInterval = jest.fn();
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(TimerService);
    originalMissingError = service.getMissingError;
    service.getMissingError = jest
      .fn()
      .mockImplementation((base: string, additional: string): CustomError => {
        const message: string = `${base} ${additional}`;
        return new CustomError('TimerError', message, 2, message);
      });
    Object.assign(service.errorReporter, { highSeverity: 2 });
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  describe('Timer Operation', (): void => {

    test('should add time to a timer', (done: jest.DoneCallback): void => {
      const _mockTimer: Timer = mockTimer();
      const _mockTimer$: BehaviorSubject<Timer> = new BehaviorSubject<Timer>(_mockTimer);
      service.getTimerSubjectById = jest.fn().mockReturnValue(_mockTimer$);
      const initialDuration: number = _mockTimer.timer.duration;
      const initialTimeRemaining: number = _mockTimer.timeRemaining;
      service.getTimerSubjectById = jest.fn().mockReturnValue(_mockTimer$);
      service.setProgress = jest.fn();

      _mockTimer$
        .pipe(skip(1))
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
      service.addTimeToTimer('timer-id');
    });

    test('should get an error adding time to a missing timer', (): void => {
      service.getTimerSubjectById = jest.fn().mockReturnValue(undefined);
      service.errorReporter.setErrorReport = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'setErrorReport');
      const _mockErrorReport: ErrorReport = mockErrorReport();
      service.errorReporter.getCustomReportFromError = jest.fn().mockReturnValue(_mockErrorReport);
      const getSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'getCustomReportFromError');
      const _mockError: Error = new Error('test-error');
      service.getMissingError = jest.fn().mockReturnValue(_mockError);
      const missingSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      service.addTimeToTimer('timer-id');

      expect(missingSpy).toHaveBeenCalledWith(
        'An error occurred trying to add time to timer',
        'Timer with id timer-id not found'
      );
      expect(getSpy).toHaveBeenCalledWith(_mockError);
      expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
    });

    test('should reset a timer', (done: jest.DoneCallback): void => {
      const _mockTimer: Timer = mockTimer();
      const _mockTimer$: BehaviorSubject<Timer> = new BehaviorSubject<Timer>(_mockTimer);
      service.getTimerSubjectById = jest.fn().mockReturnValue(_mockTimer$);
      const initialDuration: number = _mockTimer.timer.duration;
      const initialTimeRemaining: number = _mockTimer.timer.duration * 60;
      _mockTimer.timer.duration++;
      _mockTimer.timeRemaining = 10;
      service.getTimerSubjectById = jest.fn().mockReturnValue(_mockTimer$);
      service.setProgress = jest.fn();

      _mockTimer$
        .pipe(skip(1))
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

      service.resetTimer('timer-id', initialDuration)
    });

    test('should get an error resetting a missing timer', (): void => {
      service.getTimerSubjectById = jest.fn().mockReturnValue(undefined);
      service.errorReporter.setErrorReport = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'setErrorReport');
      const _mockErrorReport: ErrorReport = mockErrorReport();
      service.errorReporter.getCustomReportFromError = jest.fn().mockReturnValue(_mockErrorReport);
      const getSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'getCustomReportFromError');
      const _mockError: Error = new Error('test-error');
      service.getMissingError = jest.fn().mockReturnValue(_mockError);
      const missingSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      service.resetTimer('timer-id', 60);

      expect(missingSpy).toHaveBeenCalledWith(
        'An error occurred trying to reset timer',
        'Timer with id timer-id not found'
      );
      expect(getSpy).toHaveBeenCalledWith(_mockError);
      expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
    });

    test('should start a timer', (): void => {
      service.switchTimer = jest.fn();
      const switchSpy: jest.SpyInstance = jest.spyOn(service, 'switchTimer');

      service.startTimer('test-id');
      expect(switchSpy).toHaveBeenCalledWith('test-id', true);
    });

    test('should stop a timer', (): void => {
      service.switchTimer = jest.fn();
      const switchSpy: jest.SpyInstance = jest.spyOn(service, 'switchTimer');

      service.stopTimer('test-id');
      expect(switchSpy).toHaveBeenCalledWith('test-id', false);
    });

    test('should switch timer running status', (done: jest.DoneCallback): void => {
      const _mockTimer: Timer = mockTimer();
      _mockTimer.isRunning = false;
      const _mockTimer$: BehaviorSubject<Timer> = new BehaviorSubject<Timer>(_mockTimer);
      service.getTimerSubjectById = jest.fn().mockReturnValue(_mockTimer$);
      service.setProgress = jest.fn();

      let run: boolean = true;
      _mockTimer$
        .pipe(skip(1))
        .subscribe(
          (timer: Timer): void => {
            expect(timer.isRunning).toBe(run);
          },
          (error: any): void => {
            console.log(`Error in 'should switch timer running status'`, error);
            expect(true).toBe(false);
          },
          (): void => done()
        );

      service.switchTimer('timer-id', run);
      run = false;
      service.switchTimer('timer-id', run);
      run = true;
      service.switchTimer('timer-id', run);
      setTimeout((): void => {
        _mockTimer$.complete();
      }, 10);
    });

    test('should get an error switching a missing timer', (): void => {
      service.getTimerSubjectById = jest.fn().mockReturnValue(undefined);
      service.errorReporter.setErrorReport = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'setErrorReport');
      const _mockErrorReport: ErrorReport = mockErrorReport();
      service.errorReporter.getCustomReportFromError = jest.fn().mockReturnValue(_mockErrorReport);
      const getSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'getCustomReportFromError');
      const _mockError: Error = new Error('test-error');
      service.getMissingError = jest.fn().mockReturnValue(_mockError);
      const missingSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      service.switchTimer('timer-id', true);

      expect(missingSpy).toHaveBeenNthCalledWith(
        1,
        'An error occurred trying to start timer',
        'Timer with id timer-id not found'
      );
      expect(getSpy).toHaveBeenCalledWith(_mockError);
      expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);

      service.switchTimer('timer-id', false);

      expect(missingSpy).toHaveBeenNthCalledWith(
        2,
        'An error occurred trying to stop timer',
        'Timer with id timer-id not found'
      );
    });

  });


  describe('Timer Handling', (): void => {

    test('add a batch timer', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockTimer: Timer = mockTimer();

      service.getBatchTimerById = jest
        .fn()
        .mockReturnValue(undefined);

      service.generateNewTimerSubject = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<Timer>(_mockTimer));

      service.isConcurrent = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      expect(service.batchTimers.length).toEqual(0);

      service.addBatchTimer(_mockBatch);

      expect(service.batchTimers.length).toEqual(1);
      expect(service.batchTimers[0].timers.length).toEqual(7);
    });

    test('should generate a new (non-concurrent) Timer subject', (): void => {
      const _mockBatch: Batch = mockBatch();
      const schedule: Process[] = _mockBatch.process.schedule;
      const testIndex: number = 10;

      service.idService.getNewId = jest
        .fn()
        .mockReturnValue('1234567890123');

      service.getSettings = jest
        .fn()
        .mockReturnValue(null);

      service.utilService.clone = jest
        .fn()
        .mockImplementation((obj: any): any => obj);

      const newTimer$: BehaviorSubject<Timer> = service.generateNewTimerSubject(_mockBatch, testIndex, 0);
      const newTimer: Timer = newTimer$.value;

      expect(newTimer.first).toMatch(schedule[testIndex].cid);
      expect(newTimer.timer).toStrictEqual(schedule[testIndex]);
      expect(newTimer.show).toBe(false);
    });

    test('should generage a new (concurrent) Timer subject', (): void => {
      const _mockBatch: Batch = mockBatch();
      const schedule: Process[] = _mockBatch.process.schedule;
      const testIndex: number = 2;

      service.idService.getNewId = jest
        .fn()
        .mockReturnValue('1234567890123');

      service.getSettings = jest
        .fn()
        .mockReturnValue(null);

      service.utilService.clone = jest
        .fn()
        .mockImplementation((obj: any): any => obj);

      const newTimer$: BehaviorSubject<Timer> = service.generateNewTimerSubject(_mockBatch, testIndex, 1);
      const newTimer: Timer = newTimer$.value;

      expect(newTimer.first).toMatch(schedule[testIndex - 1].cid);
      expect(newTimer.timer).toStrictEqual(schedule[testIndex]);
      expect(newTimer.show).toBe(false);
    });

    test('should get a batch timer by batch id', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatchTimer: BatchTimer = mockBatchTimer();

      service.batchTimers.push(_mockBatchTimer);

      const batchTimer: BatchTimer = service.getBatchTimerById(_mockBatch.cid);

      expect(batchTimer).toStrictEqual(_mockBatchTimer);

      const notFound: BatchTimer = service.getBatchTimerById('not-found');

      expect(notFound).toBeUndefined();
    });

    test('should get all timers by the process id', (): void => {
      const _mockBatchTimer: BatchTimer = mockBatchTimer(true);
      const _mockProcess: Process = mockProcessSchedule()[2];

      service.getBatchTimerById = jest
        .fn()
        .mockReturnValue(_mockBatchTimer);

      expect(service.getTimersByProcessId('batch-id', _mockProcess.cid).length).toEqual(2);
      expect(service.getTimersByProcessId('batch-id', 'not-found-id').length).toEqual(0);
    });

    test('should get undefined if getting timers by process id and missing timer', (): void => {
      service.getBatchTimerById = jest
        .fn()
        .mockReturnValue(undefined);

      expect(service.getTimersByProcessId('batch-id', 'process-id')).toBeUndefined();
    });

    test('should get a timer subject by id', (): void => {
      const _mockTimer: Timer = mockTimer();
      const _mockConcurrentTimers: Timer[] = mockConcurrentTimers();
      const _mockConcurrentTimer: Timer = _mockConcurrentTimers[0];
      const _mockBatchTimer: BatchTimer = mockBatchTimer();
      const _mockBatchTimerConcurrent: BatchTimer = mockBatchTimer(true);
      service.idService.hasId = jest.fn()
        .mockImplementation((obj: any, id: string): boolean => obj['cid'] === id);
      service.batchTimers = [_mockBatchTimer, _mockBatchTimerConcurrent];

      const timer$: BehaviorSubject<Timer> = service.getTimerSubjectById(_mockTimer.cid);
      expect(timer$.value).toStrictEqual(_mockTimer);
      const concurrentTimer$: BehaviorSubject<Timer> = service.getTimerSubjectById(_mockConcurrentTimer.cid);
      expect(concurrentTimer$.value).toStrictEqual(_mockConcurrentTimer);
    });

    test('should get undefined if getting timer subject id and missing batch timer', (): void => {
      service.batchTimers = [];
      expect(service.getTimerSubjectById('process-id')).toBeUndefined();
    });

    test('should check if process is concurrent', (): void => {
      const _mockBatch: Batch = mockBatch();
      const invalidIndex: number = _mockBatch.process.schedule.length;
      const concurrentIndex: number = 2;
      const endConcurrentIndex: number = 3;

      service.isConcurrentTimer = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      expect(service.isConcurrent(_mockBatch, invalidIndex)).toBe(false);
      expect(service.isConcurrent(_mockBatch, concurrentIndex)).toBe(true);
      expect(service.isConcurrent(_mockBatch, endConcurrentIndex)).toBe(false);
    });

    test('should check if a process is a concurrent timer', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const _mockTimerProcess: TimerProcess = <TimerProcess>_mockProcessSchedule[2];
      _mockTimerProcess.concurrent = true;

      expect(service.isConcurrentTimer(_mockTimerProcess)).toBe(true);

      _mockTimerProcess.concurrent = false;
      expect(service.isConcurrentTimer(_mockTimerProcess)).toBe(false);

      const _mockNonTimerProcess: Process = _mockProcessSchedule[0];
      expect(service.isConcurrentTimer(_mockNonTimerProcess)).toBe(false);
    });

    test('should remove a batch timer', (): void => {
      const _mockBatchTimer: BatchTimer = mockBatchTimer();

      const completeSpy: jest.SpyInstance = jest.spyOn(_mockBatchTimer.timers[0], 'complete');

      service.batchTimers = [_mockBatchTimer];

      service.removeBatchTimer(_mockBatchTimer.batchId);

      expect(service.batchTimers.length).toEqual(0);
      expect(completeSpy).toHaveBeenCalled();
    });

    test('should perform no actions removing a batch timer that is missing', (): void => {
      const _mockBatchTimer: BatchTimer = mockBatchTimer();

      const completeSpy: jest.SpyInstance = jest.spyOn(_mockBatchTimer.timers[0], 'complete');

      service.removeBatchTimer(_mockBatchTimer.batchId);

      expect(service.batchTimers.length).toEqual(0);
      expect(completeSpy).not.toHaveBeenCalled();
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

      service.batchTimers = [ _mockBatchTimer, _mockBatchTimerConcurrent ];

      service.backgroundModeService.enableBackgroundMode = jest
        .fn();

      service.setProgress = jest
        .fn();

      service.updatedBackgroundNotifications = jest
        .fn();

      const enableSpy: jest.SpyInstance = jest.spyOn(service.backgroundModeService, 'enableBackgroundMode');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updatedBackgroundNotifications');

      service.tick();

      expect(_mockBatchTimerConcurrent.timers[1].value.isRunning).toBe(false);
      expect(_mockBatchTimerConcurrent.timers[0].value.timeRemaining).toEqual(99);
      expect(enableSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith([_mockBatchTimerConcurrent.timers[0].value]);
    });

  });


  describe('Progress Circle', (): void => {

    test('should format text of a progress circle', (): void => {
      expect(service.formatProgressCircleText(3700)).toMatch('1:01:40');
      expect(service.formatProgressCircleText(1800)).toMatch('30:00');
      expect(service.formatProgressCircleText(3600)).toMatch('1:00:00');
      expect(service.formatProgressCircleText(-1).length).toEqual(0);
    });

    test('should get font size as css value string', (): void => {
      service.timerWidth = 360;

      expect(service.getFontSize(3700)).toMatch('72px');
      expect(service.getFontSize(1500)).toMatch('90px');
      expect(service.getFontSize(10)).toMatch('120px');
    });

    test('should get a formatted duration string', (): void => {
      expect(service.getFormattedDurationString(100)).toMatch('Duration: 1 hour 40 minutes');
      expect(service.getFormattedDurationString(120)).toMatch('Duration: 2 hours');
      expect(service.getFormattedDurationString(1)).toMatch('Duration: 1 minute');
      expect(service.getFormattedDurationString(0)).toMatch('Duration: 0 minutes')
    });

    test('get process circle settings', (): void => {
      const _mockProcess: TimerProcess = <TimerProcess>mockProcessSchedule()[10];

      service.timerHeight = 360;
      service.timerWidth = 360;
      service.circumference = 100;
      service.timerStroke = '2';
      service.timerStrokeWidth = 4;
      service.timerCircleFill = 'circle-fill';
      service.timerRadius = 30;
      service.timerOriginX = 50;
      service.timerOriginY = 50;
      service.timerTextXY = '50%';
      service.timerTextAnchor = 'middle';
      service.timerTextFill = 'text-fill';
      service.timerFontFamily = 'family';
      service.timerDY = 'dy';

      service.getFontSize = jest
        .fn()
        .mockReturnValue('72px');

      service.formatProgressCircleText = jest
        .fn()
        .mockReturnValue('1:00:00');

      expect(service.getSettings(_mockProcess))
        .toStrictEqual({
          height: 360,
          width: 360,
          circle: {
            strokeDasharray: '100',
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

    test('should initialize settings', (): void => {
      service.platform.width = jest
        .fn()
        .mockReturnValue(600);

      service.initializeSettings();

      const expectedWidth: number = 400;
      const expectedRadius: number = 184;
      const expectedCircumference: number = expectedRadius * 2 * Math.PI;

      expect(service.circumference).toEqual(expectedCircumference);
      expect(service.timerHeight).toEqual(expectedWidth);
      expect(service.timerWidth).toEqual(expectedWidth);
      expect(service.timerStrokeWidth).toEqual(8);
      expect(service.timerRadius).toEqual(expectedRadius);
      expect(service.timerOriginX).toEqual(expectedWidth / 2);
      expect(service.timerOriginY).toEqual(expectedWidth / 2);
      expect(service.timerDY).toMatch('0.5em');
    });

    test('should set timer progress', (): void => {
      const _mockTimer: Timer = mockTimer();
      _mockTimer.isRunning = true;
      _mockTimer.timer.duration = 60;
      _mockTimer.timeRemaining = 1801;
      service.getFontSize = jest.fn().mockReturnValue('90px');
      service.formatProgressCircleText = jest.fn().mockReturnValue('30:00');
      service.notificationService.setLocalNotification = jest.fn();
      const localSpy: jest.SpyInstance = jest.spyOn(service.notificationService, 'setLocalNotification');

      service.setProgress(_mockTimer);
      expect(_mockTimer.settings.text.content).toMatch('30:00');
      expect(localSpy).not.toHaveBeenCalled();

      _mockTimer.timer.splitInterval = 2;
      service.setProgress(_mockTimer);
      expect(localSpy).not.toHaveBeenCalled();

      _mockTimer.timeRemaining = 1800;
      service.setProgress(_mockTimer);
      expect(localSpy).toHaveBeenCalledWith(`${_mockTimer.timer.name} interval complete!`);

      expect(_mockTimer.settings.text.content).toMatch('30:00');
      expect(localSpy).toHaveBeenCalledWith(`${_mockTimer.timer.name} interval complete!`);

      _mockTimer.timeRemaining = 0;
      service.setProgress(_mockTimer);
      expect(_mockTimer.isRunning).toBe(false);
      expect(localSpy).toHaveBeenCalledWith(`${_mockTimer.timer.name} complete!`);
    });

  });


  describe('Other Methods', (): void => {

    test('should get index skipping concurrent timer', (): void => {
      service.getNextIndexSkippingConcurrent = jest.fn().mockReturnValue(12);
      const nextSpy: jest.SpyInstance = jest.spyOn(service, 'getNextIndexSkippingConcurrent');
      service.getPreviousIndexSkippingConcurrent = jest.fn().mockReturnValue(5);
      const previousSpy: jest.SpyInstance = jest.spyOn(service, 'getPreviousIndexSkippingConcurrent');
      const _mockProcessSchedule: Process[] = mockProcessSchedule();

      expect(service.getIndexSkippingConcurrent(true, 10, _mockProcessSchedule)).toEqual(12);
      expect(nextSpy).toHaveBeenCalledWith(10, _mockProcessSchedule);
      expect(service.getIndexSkippingConcurrent(false, 10, _mockProcessSchedule)).toEqual(5);
      expect(previousSpy).toHaveBeenCalledWith(10, _mockProcessSchedule);
    });

    test('should get the next index after skipping concurrent timers', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      expect(service.getNextIndexSkippingConcurrent(2, _mockProcessSchedule)).toEqual(4);
    });

    test('should get the previous index after skipping concurrent timers', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      expect(service.getPreviousIndexSkippingConcurrent(4, _mockProcessSchedule)).toEqual(2);
    });

    test('should get a custom error for missing timer', (): void => {
      service.getMissingError = originalMissingError;
      const baseMessage: string = 'test base message';
      const additionalMessage: string = 'test additional message';
      const customError: CustomError = <CustomError>service.getMissingError(baseMessage, additionalMessage);

      expect(customError.name).toMatch('TimerError');
      expect(customError.message).toMatch(`${baseMessage} ${additionalMessage}`);
      expect(customError.severity).toEqual(2);
      expect(customError.userMessage).toMatch(baseMessage);
    });

    test('should get timer step data', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const expected: TimerProcess[] = <TimerProcess[]>_mockProcessSchedule.slice(2, 4);

      expect(service.getTimerStepData(_mockProcessSchedule, 2)).toStrictEqual(expected);
    });

    test('should update background notifications', (): void => {
      const _mockConcurrentTimers: Timer[] = mockConcurrentTimers();
      _mockConcurrentTimers[0].timeRemaining = 200;
      _mockConcurrentTimers[0].settings.text.content = '200';
      _mockConcurrentTimers[1].timeRemaining = 100;
      _mockConcurrentTimers[1].settings.text.content = '100';

      service.platform.is = jest
        .fn()
        .mockReturnValue(true);

      service.backgroundModeService.isActive = jest
        .fn()
        .mockReturnValue(true);

      service.backgroundModeService.setNotification = jest
        .fn();

      const notifySpy: jest.SpyInstance = jest.spyOn(service.backgroundModeService, 'setNotification');
      const disableSpy: jest.SpyInstance = jest.spyOn(service.backgroundModeService, 'disableBackgroundMode');

      service.updatedBackgroundNotifications(_mockConcurrentTimers);

      expect(notifySpy).toHaveBeenCalledWith(
        `${_mockConcurrentTimers[1].timer.name}: 100`,
        '2 timers running'
      );
      expect(disableSpy).not.toHaveBeenCalled();

      service.updatedBackgroundNotifications([]);

      expect(disableSpy).toHaveBeenCalled();
    });

  });

});
