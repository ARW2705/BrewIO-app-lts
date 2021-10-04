/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockConcurrentTimers, mockProcessSchedule, mockTimer } from '../../../../../../test-config/mock-models';
import { TimerComponentStub } from '../../../../../../test-config/component-stubs';
import { ErrorReportingServiceStub, IdServiceStub, TimerServiceStub, ToastServiceStub, UtilityServiceStub } from '../../../../../../test-config/service-stubs';

/* Interface imports */
import { Process, TimerProcess, Timer } from '../../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, IdService, TimerService, ToastService, UtilityService } from '../../../../services/services';

/* Component imports */
import { ProcessTimerComponent } from './process-timer.component';


describe('ProcessTimerComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessTimerComponent>;
  let component: ProcessTimerComponent;
  let originalOnInit: any;
  let originalOnChanges: any;
  let originalOnDestroy: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessTimerComponent,
        TimerComponentStub
      ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: TimerService, useClass: TimerServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessTimerComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    originalOnChanges = component.ngOnChanges;
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnInit = jest.fn();
    component.ngOnChanges = jest.fn();
    component.ngOnDestroy = jest.fn();
    component.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  describe('Lifecycle', (): void => {
    test('should handle component init', (): void => {
      component.ngOnInit = originalOnInit;
      component.initTimers = jest.fn();
      const initSpy: jest.SpyInstance = jest.spyOn(component, 'initTimers');

      fixture.detectChanges();

      expect(initSpy).toHaveBeenCalled();
    });

    test('should handle component destroy', (): void => {
      component.ngOnDestroy = originalOnDestroy;
      const nextSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'complete');

      fixture.detectChanges();

      component.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

    test('should update component on changes', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const firstTimerIndex: number = _mockProcessSchedule.findIndex((process: Process): boolean => {
        return process.type === 'timer';
      });
      const secondTimerIndex: number = _mockProcessSchedule.findIndex((process: Process, index: number): boolean => {
        if (index <= firstTimerIndex) {
          return false;
        }
        return process.type === 'timer';
      });
      const _mockNonTimerProcess: Process = _mockProcessSchedule[0];
      const _mockFirstTimer: Process = _mockProcessSchedule[firstTimerIndex];
      const _mockSecondTimer: Process = _mockProcessSchedule[secondTimerIndex];
      component.ngOnChanges = originalOnChanges;
      component.timerProcess = [];
      component.hasChanges = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      component.initTimers = jest.fn();
      const nextSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'next');
      const initSpy: jest.SpyInstance = jest.spyOn(component, 'initTimers');

      fixture.detectChanges();

      const firstChange: SimpleChanges = {
        timerProcess: new SimpleChange(null, [_mockFirstTimer], false)
      };
      component.ngOnChanges(firstChange);
      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(initSpy).toHaveBeenCalled();
      expect(component.timerProcess[0]).toStrictEqual(_mockFirstTimer);
      const secondChange: SimpleChanges = {
        isPreview: new SimpleChange(null, true, false),
        timerProcess: new SimpleChange(null, [_mockSecondTimer], false)
      };
      component.ngOnChanges(secondChange);
      expect(nextSpy).toHaveBeenCalledTimes(2);
      expect(initSpy).toHaveBeenCalledTimes(2);
      expect(component.isPreview).toBe(true);
      expect(component.timerProcess[0]).toStrictEqual(_mockSecondTimer);
      const thirdChange: SimpleChanges = {
        timerProcess: new SimpleChange(null, [_mockNonTimerProcess], false)
      };
      component.ngOnChanges(thirdChange);
      expect(nextSpy).toHaveBeenCalledTimes(3);
      expect(initSpy).toHaveBeenCalledTimes(2);
      const fourthChange: SimpleChanges = {
        somethingElse: new SimpleChange(null, null, false)
      };
      component.ngOnChanges(fourthChange);
      expect(nextSpy).toHaveBeenCalledTimes(3);
      expect(initSpy).toHaveBeenCalledTimes(2);
    });
  });


  describe('Other Methods', (): void => {
    test('should check if simple changes has a new and different value', (): void => {
      component.utilService.hasChanges = jest.fn()
        .mockReturnValue(true);
      const utilSpy: jest.SpyInstance = jest.spyOn(component.utilService, 'hasChanges');

      fixture.detectChanges();

      const change: SimpleChange = new SimpleChange(false, false, false);
      expect(component.hasChanges(change)).toBe(true);
      expect(utilSpy).toHaveBeenCalledWith(change);
    });

    test('should init timers', (): void => {
      const _mockProcess: TimerProcess = <TimerProcess>mockProcessSchedule()[2];
      const _mockTimers: Timer[] = mockConcurrentTimers();
      const _mockTimers$: BehaviorSubject<Timer>[] = _mockTimers
        .map((timer: Timer): BehaviorSubject<Timer> => {
          return new BehaviorSubject<Timer>(timer);
        });
      component.timerProcess = [_mockProcess];
      component.timerService.getTimersByProcessId = jest.fn()
        .mockReturnValue(_mockTimers$);
      component.updateTimerInList = jest.fn();
      const updateSpy: jest.SpyInstance = jest.spyOn(component, 'updateTimerInList');

      fixture.detectChanges();

      component.initTimers();
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
      component.timerService.getTimersByProcessId = jest.fn()
        .mockReturnValue(undefined);
      component.timerProcess = [_mockProcess];
      component.timers = _mockConcurrentTimers;

      fixture.detectChanges();

      component.initTimers();
      expect(component.timers.length).toEqual(0);
    });

    test('should update timer in list', (): void => {
      component.batchId = '';
      component.isPreview = false;
      component.timerProcess = [];
      const _mockTimerNew: Timer = mockTimer();
      const _mockTimerUpdate: Timer = mockConcurrentTimers()[1];
      _mockTimerUpdate.isRunning = !_mockTimerUpdate.isRunning;
      const _mockConcurrentTimers: Timer[] = mockConcurrentTimers();
      component.timers = _mockConcurrentTimers;
      component.idService.hasId = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValue(false);

      fixture.detectChanges();

      component.updateTimerInList(_mockTimerUpdate);
      expect(component.timers[0]).toStrictEqual(_mockTimerUpdate);
      component.updateTimerInList(_mockTimerNew);
      expect(component.timers.length).toEqual(3);
      expect(component.timers[2]).toStrictEqual(_mockTimerNew);
    });
  });


  describe('Template Render', (): void => {
    test('should render template as preview', (): void => {
      component.ngOnInit = originalOnInit;
      component.ngOnDestroy = originalOnDestroy;
      component.ngOnChanges = originalOnChanges;
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const _mockTimerProcess: TimerProcess = <TimerProcess>_mockProcessSchedule[2];
      const _mockTimers: Timer[] = mockConcurrentTimers();
      component.batchId = '';
      component.isPreview = true;
      component.timerProcess = [_mockTimerProcess];
      component.timers = _mockTimers;
      component.initTimers = jest.fn();

      fixture.detectChanges();

      const headers: NodeList = global.document.querySelectorAll('app-process-header');
      expect(headers.length).toEqual(2);
      expect(headers.item(0)['headerText']).toMatch(_mockTimers[0].timer.name);
      expect(headers.item(1)['headerText']).toMatch(_mockTimers[1].timer.name);
      const previews: NodeList = global.document.querySelectorAll('app-process-preview-content');
      expect(previews.length).toEqual(2);
      expect(previews.item(0)['process']).toStrictEqual(_mockTimers[0].timer);
      expect(previews.item(1)['process']).toStrictEqual(_mockTimers[1].timer);
    });

    test('should render template with timers', (): void => {
      component.ngOnInit = originalOnInit;
      component.ngOnDestroy = originalOnDestroy;
      component.ngOnChanges = originalOnChanges;
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const _mockTimerProcess: TimerProcess = <TimerProcess>_mockProcessSchedule[2];
      const _mockTimers: Timer[] = mockConcurrentTimers();
      component.batchId = '';
      component.isPreview = false;
      component.timerProcess = [_mockTimerProcess, _mockTimerProcess];
      component.timers = _mockTimers;
      component.initTimers = jest.fn();

      fixture.detectChanges();

      const controls: HTMLElement = global.document.querySelector('app-timer-controls');
      expect(controls['processes']).toStrictEqual([_mockTimerProcess, _mockTimerProcess]);
      expect(controls['timers']).toStrictEqual(_mockTimers);
      const timers: NodeList = global.document.querySelectorAll('app-timer');
      expect(timers.length).toEqual(2);
      const firstTimer: Element = <Element>timers.item(0);
      expect(firstTimer['process']).toStrictEqual(_mockTimerProcess);
      expect(firstTimer['timer']).toStrictEqual(_mockTimers[0]);
      const secondTimer: Element = <Element>timers.item(1);
      expect(secondTimer['process']).toStrictEqual(_mockTimerProcess);
      expect(secondTimer['timer']).toStrictEqual(_mockTimers[1]);
    });
  });

});
