/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockConcurrentTimers, mockProcessSchedule, mockTimer } from '../../../../test-config/mock-models';
import { TimerComponentStub } from '../../../../test-config/component-stubs';
import { ErrorReportingServiceStub, IdServiceStub, TimerServiceStub, ToastServiceStub } from '../../../../test-config/service-stubs';
import { FormatTimePipeStub, UnitConversionPipeStub } from '../../../../test-config/pipe-stubs';

/* Interface imports */
import { Process, TimerProcess, Timer } from '../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, IdService, TimerService, ToastService } from '../../services/services';

/* Component imports */
import { ProcessTimerComponent } from './process-timer.component';


describe('ProcessTimerComponent', (): void => {
  let fixture: ComponentFixture<ProcessTimerComponent>;
  let processCmp: ProcessTimerComponent;
  let originalOnInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessTimerComponent,
        TimerComponentStub,
        FormatTimePipeStub,
        UnitConversionPipeStub
      ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: TimerService, useClass: TimerServiceStub },
        { provide: ToastService, useClass: ToastServiceStub }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessTimerComponent);
    processCmp = fixture.componentInstance;
    originalOnInit = processCmp.ngOnInit;
    originalOnDestroy = processCmp.ngOnDestroy;
    processCmp.ngOnInit = jest
      .fn();
    processCmp.ngOnDestroy = jest
      .fn();
    processCmp.errorReporter.handleUnhandledError = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(processCmp).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should handle component init', (): void => {
      processCmp.ngOnInit = originalOnInit;

      processCmp.initTimers = jest
        .fn();

      const initSpy: jest.SpyInstance = jest.spyOn(processCmp, 'initTimers');

      fixture.detectChanges();

      expect(initSpy).toHaveBeenCalled();
    });

    test('should handle component destroy', (): void => {
      processCmp.ngOnDestroy = originalOnDestroy;

      const nextSpy: jest.SpyInstance = jest.spyOn(processCmp.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(processCmp.destroy$, 'complete');

      fixture.detectChanges();

      processCmp.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

    test('should update component on changes', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const firstTimerIndex: number = _mockProcessSchedule
        .findIndex((process: Process): boolean => {
          return process.type === 'timer';
        });
      const secondTimerIndex: number = _mockProcessSchedule
        .findIndex((process: Process, index: number): boolean => {
          if (index <= firstTimerIndex) {
            return false;
          }
          return process.type === 'timer';
        });
      const _mockNonTimerProcess: Process = _mockProcessSchedule[0];
      const _mockFirstTimer: Process = _mockProcessSchedule[firstTimerIndex];
      const _mockSecondTimer: Process = _mockProcessSchedule[secondTimerIndex];

      processCmp.stepData = [];

      processCmp.hasChanges = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processCmp.initTimers = jest
        .fn();

      const nextSpy: jest.SpyInstance = jest.spyOn(processCmp.destroy$, 'next');
      const initSpy: jest.SpyInstance = jest.spyOn(processCmp, 'initTimers');

      fixture.detectChanges();

      const firstChange: SimpleChanges = {
        stepData: new SimpleChange(null, [_mockFirstTimer], false)
      };
      const secondChange: SimpleChanges = {
        isPreview: new SimpleChange(null, true, false),
        stepData: new SimpleChange(null, [_mockSecondTimer], false)
      };
      const thirdChange: SimpleChanges = {
        stepData: new SimpleChange(null, [_mockNonTimerProcess], false)
      };
      const fourthChange: SimpleChanges = {
        somethingElse: new SimpleChange(null, null, false)
      };

      processCmp.ngOnChanges(firstChange);

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(initSpy).toHaveBeenCalled();
      expect(processCmp.stepData[0]).toStrictEqual(_mockFirstTimer);

      processCmp.ngOnChanges(secondChange);

      expect(nextSpy).toHaveBeenCalledTimes(2);
      expect(initSpy).toHaveBeenCalledTimes(2);
      expect(processCmp.isPreview).toBe(true);
      expect(processCmp.stepData[0]).toStrictEqual(_mockSecondTimer);

      processCmp.ngOnChanges(thirdChange);

      expect(nextSpy).toHaveBeenCalledTimes(3);
      expect(initSpy).toHaveBeenCalledTimes(2);

      processCmp.ngOnChanges(fourthChange);

      expect(nextSpy).toHaveBeenCalledTimes(3);
      expect(initSpy).toHaveBeenCalledTimes(2);
    });

  });


  describe('Timer Controls', (): void => {

    test('should add time to all timers', (): void => {
      const _mockTimers: Timer[] = mockConcurrentTimers();

      processCmp.timers = _mockTimers;

      processCmp.addToSingleTimer = jest
        .fn();

      const addSpy: jest.SpyInstance = jest.spyOn(processCmp, 'addToSingleTimer');

      fixture.detectChanges();

      processCmp.addToAllTimers();

      _mockTimers.forEach((timer: Timer, index: number): void => {
        expect(addSpy).toHaveBeenNthCalledWith(index + 1, timer);
      });
    });

    test('should add to single timer', (done: jest.DoneCallback): void => {
      const _mockTimer: Timer = mockTimer();

      processCmp.timerService.addTimeToTimer = jest
        .fn()
        .mockReturnValue(of(_mockTimer));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      processCmp.addToSingleTimer(_mockTimer);

      setTimeout((): void => {
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('added time to timer');
        expect(consoleCalls[1]).toMatch(_mockTimer.cid);
        done();
      }, 10);
    });

    test('should get an error adding to single timer', (done: jest.DoneCallback): void => {
      const _mockTimer: Timer = mockTimer();
      const _mockError: Error = new Error('test-error');

      processCmp.timerService.addTimeToTimer = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      // const toastSpy: jest.SpyInstance = jest.spyOn(processCmp.toastService, 'presentErrorToast');

      const errorSpy: jest.SpyInstance = jest.spyOn(processCmp.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      processCmp.addToSingleTimer(_mockTimer);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        // expect(toastSpy).toHaveBeenCalledWith('Error: unable to add time to timer');
        done();
      }, 10);
    });

    test('should reset all timers', (): void => {
      const _mockTimers: Timer[] = mockConcurrentTimers();

      processCmp.timers = _mockTimers;

      processCmp.resetSingleTimer = jest
        .fn();

      const resetSpy: jest.SpyInstance = jest.spyOn(processCmp, 'resetSingleTimer');

      fixture.detectChanges();

      processCmp.resetAllTimers();

      _mockTimers.forEach((timer: Timer, index: number): void => {
        expect(resetSpy).toHaveBeenNthCalledWith(index + 1, timer);
      });
    });

    test('should reset a single timer', (done: jest.DoneCallback): void => {
      const _mockProcessSchedule: TimerProcess[] = <TimerProcess[]>mockProcessSchedule().slice(2, 4);
      const _mockTimer: Timer = mockTimer();
      _mockTimer.timer.cid = _mockProcessSchedule[0].cid;

      processCmp.stepData = _mockProcessSchedule;

      processCmp.timerService.resetTimer = jest
        .fn()
        .mockReturnValue(of(_mockTimer));

      processCmp.idService.hasId = jest
        .fn()
        .mockReturnValue(true);

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      processCmp.resetSingleTimer(_mockTimer);

      setTimeout((): void => {
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('reset timer');
        expect(consoleCalls[1]).toMatch(_mockTimer.cid);
        done();
      }, 10);
    });

    test('should get an error resetting a single timer', (done: jest.DoneCallback): void => {
      const _mockProcessSchedule: TimerProcess[] = <TimerProcess[]>mockProcessSchedule().slice(2, 4);
      const _mockTimer: Timer = mockTimer();
      _mockTimer.timer.cid = _mockProcessSchedule[0].cid;
      const _mockError: Error = new Error('test-error');

      processCmp.idService.hasId = jest
        .fn()
        .mockReturnValue(true);

      processCmp.stepData = _mockProcessSchedule;

      processCmp.timerService.resetTimer = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      const errorSpy: jest.SpyInstance = jest.spyOn(processCmp.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      processCmp.resetSingleTimer(_mockTimer);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should start all timers', (): void => {
      const _mockTimers: Timer[] = mockConcurrentTimers();

      processCmp.timers = _mockTimers;

      processCmp.startSingleTimer = jest
        .fn();

      const startSpy: jest.SpyInstance = jest.spyOn(processCmp, 'startSingleTimer');

      fixture.detectChanges();

      processCmp.startAllTimers();

      _mockTimers.forEach((timer: Timer, index: number): void => {
        expect(startSpy).toHaveBeenNthCalledWith(index + 1, timer);
      });
    });

    test('should start a single timer', (done: jest.DoneCallback): void => {
      const _mockTimer: Timer = mockTimer();

      processCmp.timerService.startTimer = jest
        .fn()
        .mockReturnValue(of(_mockTimer));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      processCmp.startSingleTimer(_mockTimer);

      setTimeout((): void => {
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('started timer');
        expect(consoleCalls[1]).toMatch(_mockTimer.cid);
        done();
      }, 10);
    });

    test('should get an error starting a single timer', (done: jest.DoneCallback): void => {
      const _mockTimer: Timer = mockTimer();
      const _mockError: Error = new Error('test-error');

      processCmp.timerService.startTimer = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      const errorSpy: jest.SpyInstance = jest.spyOn(processCmp.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      processCmp.startSingleTimer(_mockTimer);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should stop all timers', (): void => {
      const _mockTimers: Timer[] = mockConcurrentTimers();

      processCmp.timers = _mockTimers;

      processCmp.stopSingleTimer = jest
        .fn();

      const stopSpy: jest.SpyInstance = jest.spyOn(processCmp, 'stopSingleTimer');

      fixture.detectChanges();

      processCmp.stopAllTimers();

      _mockTimers.forEach((timer: Timer, index: number): void => {
        expect(stopSpy).toHaveBeenNthCalledWith(index + 1, timer);
      });
    });

    test('should stop a single timer', (done: jest.DoneCallback): void => {
      const _mockTimer: Timer = mockTimer();

      processCmp.timerService.stopTimer = jest
        .fn()
        .mockReturnValue(of(_mockTimer));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      processCmp.stopSingleTimer(_mockTimer);

      setTimeout((): void => {
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('stopped timer');
        expect(consoleCalls[1]).toMatch(_mockTimer.cid);
        done();
      }, 10);
    });

    test('should get an error stopping a single timer', (done: jest.DoneCallback): void => {
      const _mockTimer: Timer = mockTimer();
      const _mockError: Error = new Error('test-error');

      processCmp.timerService.stopTimer = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      const errorSpy: jest.SpyInstance = jest.spyOn(processCmp.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      processCmp.stopSingleTimer(_mockTimer);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should toggle show description flag', (): void => {
      processCmp.showDescription = false;

      fixture.detectChanges();

      processCmp.toggleShowDescription();

      expect(processCmp.showDescription).toBe(true);

      processCmp.toggleShowDescription();

      expect(processCmp.showDescription).toBe(false);
    });

  });


  describe('Timer Settings', (): void => {

    test('should init timers', (): void => {
      const _mockProcess: TimerProcess = <TimerProcess>mockProcessSchedule()[2];
      const _mockTimers: Timer[] = mockConcurrentTimers();

      const _mockTimers$: BehaviorSubject<Timer>[] = _mockTimers
        .map((timer: Timer): BehaviorSubject<Timer> => {
          return new BehaviorSubject<Timer>(timer);
        });

      processCmp.stepData = [_mockProcess];

      processCmp.timerService.getTimersByProcessId = jest
        .fn()
        .mockReturnValue(_mockTimers$);

      processCmp.updateTimerInList = jest
        .fn();

      const updateSpy: jest.SpyInstance = jest.spyOn(processCmp, 'updateTimerInList');

      fixture.detectChanges();

      processCmp.initTimers();

      _mockTimers$.forEach((timer$: BehaviorSubject<Timer>): void => {
        timer$.next(timer$.value);
      });

      _mockTimers.forEach((timer: Timer, index: number): void => {
        expect(updateSpy).toHaveBeenNthCalledWith(index + 1, timer);
      });
    });

    test('should not setup timers if no timers found', (): void => {
      const _mockProcess: TimerProcess = <TimerProcess>mockProcessSchedule()[2];
      const _mockConcurrentTimers: Timer[] = mockConcurrentTimers();

      processCmp.timerService.getTimersByProcessId = jest
        .fn()
        .mockReturnValue(undefined);

      processCmp.stepData = [_mockProcess];
      processCmp.timers = _mockConcurrentTimers;
      processCmp.isConcurrent = true;

      fixture.detectChanges();

      processCmp.initTimers();

      expect(processCmp.timers.length).toEqual(0);
      expect(processCmp.isConcurrent).toBe(false);
    });

    test('should update timer in list', (): void => {
      const _mockTimerNew: Timer = mockTimer();
      const _mockTimerUpdate: Timer = mockConcurrentTimers()[1];
      _mockTimerUpdate.isRunning = !_mockTimerUpdate.isRunning;
      const _mockConcurrentTimers: Timer[] = mockConcurrentTimers();

      processCmp.timers = _mockConcurrentTimers;

      fixture.detectChanges();

      processCmp.updateTimerInList(_mockTimerUpdate);

      expect(processCmp.timers[1]).toStrictEqual(_mockTimerUpdate);

      processCmp.updateTimerInList(_mockTimerNew);

      expect(processCmp.timers.length).toEqual(3);
      expect(processCmp.timers[2]).toStrictEqual(_mockTimerNew);
    });

  });


  describe('Other Methods', (): void => {

    test('should check if simple changes has a new and different value', (): void => {
      const sameChange: SimpleChange = new SimpleChange(true, true, false);

      const newChange: SimpleChange = new SimpleChange(true, false, false);

      expect(processCmp.hasChanges(sameChange)).toBe(false);
      expect(processCmp.hasChanges(newChange)).toBe(true);
    });

    test('should handle timer action', (): void => {
      const _mockTimer: Timer = mockTimer();

      const testMethod: (timer: Timer) => void = (): void => console.log('test-passed');

      processCmp.timerActions['testMethod'] = testMethod;

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      processCmp.onTimerActionHandler('testMethod', _mockTimer);

      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('test-passed');
    });

    test('should get an error trying to handle a timer action', (): void => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      processCmp.onTimerActionHandler('invalid', null);

      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('Timer action error');
      expect(consoleCalls[1]).toMatch('invalid');
      expect(consoleCalls[2] instanceof TypeError).toBe(true);
    });

  });


  describe('Template Render', (): void => {

    test('should render template as preview', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const _mockTimerProcess: TimerProcess = <TimerProcess>_mockProcessSchedule
        .find((process: Process): boolean => {
          return process.type === 'timer';
        });
      const _mockTimers: Timer[] = mockConcurrentTimers();

      processCmp.isPreview = true;
      processCmp.stepData = [_mockTimerProcess];
      processCmp.timers = _mockTimers;

      fixture.detectChanges();

      const controls: NodeList = fixture.nativeElement.querySelector('#timer-master-controls');
      expect(controls).toBeNull();

      const timers: NodeList = fixture.nativeElement.querySelector('timer');
      expect(timers).toBeNull();

      const previews: NodeList = fixture.nativeElement.querySelectorAll('.timer-preview');
      Array.from(previews).forEach((preview: HTMLElement, index: number): void => {
        const name: string = preview.children[0].children[0].textContent;
        expect(name).toMatch(_mockTimers[index].timer.name);
        const interval: string = preview.children[1].children[1].textContent;
        expect(interval).toMatch(`Interval(s): ${_mockTimers[index].timer.splitInterval}`);
      });
    });

    test('should render template with timers', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const _mockTimerProcess: TimerProcess = <TimerProcess>_mockProcessSchedule
        .find((process: Process): boolean => {
          return process.type === 'timer';
        });
      const _mockTimers: Timer[] = mockConcurrentTimers();

      processCmp.isPreview = false;
      processCmp.stepData = [_mockTimerProcess];
      processCmp.timers = _mockTimers;
      processCmp.showDescription = true;

      fixture.detectChanges();

      const previews: NodeList = fixture.nativeElement.querySelectorAll('.timer-preview');
      expect(previews.length).toEqual(0);

      const controls: HTMLElement = fixture.nativeElement.querySelector('#timer-master-controls');

      const start: HTMLElement = <HTMLElement>controls.children[0].children[0];
      expect(start.textContent).toMatch('Start All');

      const stop: HTMLElement = <HTMLElement>controls.children[1].children[0];
      expect(stop.textContent).toMatch('Stop All');

      const add: HTMLElement = <HTMLElement>controls.children[2].children[0];
      expect(add.textContent).toMatch('+1min All');

      const reset: HTMLElement = <HTMLElement>controls.children[3].children[0];
      expect(reset.textContent).toMatch('Reset All');

      const description: HTMLElement = <HTMLElement>controls.children[4].children[0];
      expect(description.textContent).toMatch('Hide Descriptions');

      const timers: NodeList = fixture.nativeElement.querySelectorAll('timer');
      expect(timers.length).toEqual(_mockTimers.length);
    });

  });

});
