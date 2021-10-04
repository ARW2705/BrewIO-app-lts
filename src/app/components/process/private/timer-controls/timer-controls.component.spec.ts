/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockConcurrentTimers, mockProcessSchedule, mockTimer } from '../../../../../../test-config/mock-models';
import { IdServiceStub, TimerServiceStub } from '../../../../../../test-config/service-stubs';

/* Interface imports */
import { Process, TimerProcess, Timer } from '../../../../shared/interfaces';

/* Service imports */
import { IdService, TimerService } from '../../../../services/services';

/* Component imports */
import { TimerControlsComponent } from './timer-controls.component';


describe('TimerControlsComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<TimerControlsComponent>;
  let component: TimerControlsComponent;
  let originalOnInit: any;
  const _mockConcurrentTimers: Timer[] = mockConcurrentTimers();
  const _mockTimerProcess: TimerProcess = <TimerProcess>mockProcessSchedule()[2];

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        TimerControlsComponent
      ],
      providers: [
        { provide: IdService, useClass: IdServiceStub },
        { provide: TimerService, useClass: TimerServiceStub }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(TimerControlsComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should handle component init', (): void => {
      component.ngOnInit = originalOnInit;
      component.processes = [_mockTimerProcess];
      const _mockTimers: Timer[] = mockConcurrentTimers();
      component.timers = _mockTimers;

      fixture.detectChanges();

      expect(component.multiText).toMatch(' All');
      component.timers = [];
      component.ngOnInit();
      expect(component.multiText.length).toEqual(0);
    });

  });


  describe('Timer Controls', (): void => {

    test('should add time to all timers', (): void => {
      component.timers = _mockConcurrentTimers;
      component.timerService.addTimeToTimer = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(component.timerService, 'addTimeToTimer');

      fixture.detectChanges();

      component.addTime();
      _mockConcurrentTimers.forEach((timer: Timer, index: number): void => {
        expect(addSpy).toHaveBeenNthCalledWith(index + 1, timer.cid);
      });
    });

    test('should reset all timers', (): void => {
      component.processes = [_mockTimerProcess];
      component.timers = _mockConcurrentTimers;
      component.timerService.resetTimer = jest.fn();
      const resetSpy: jest.SpyInstance = jest.spyOn(component.timerService, 'resetTimer');
      component.idService.hasId = jest.fn()
        .mockReturnValue(true);

      fixture.detectChanges();

      component.reset();
      _mockConcurrentTimers.forEach((timer: Timer, index: number): void => {
        expect(resetSpy).toHaveBeenNthCalledWith(index + 1, timer.cid, _mockTimerProcess.duration);
      });
    });

    test('should try to reset timer, but log process not found', (): void => {
      const _mockTimers: Timer[] = [mockTimer()];
      component.processes = [_mockTimerProcess];
      component.timers = _mockTimers;
      component.timerService.resetTimer = jest.fn();
      component.idService.hasId = jest.fn()
        .mockReturnValue(false);
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      component.reset();
      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('could not find process');
      expect(consoleCalls[1]).toStrictEqual(_mockTimers[0]);
      expect(consoleCalls[2]).toStrictEqual([_mockTimerProcess]);
    });

    test('should start all timers', (): void => {
      component.timers = _mockConcurrentTimers;
      component.timerService.startTimer = jest.fn();
      const startSpy: jest.SpyInstance = jest.spyOn(component.timerService, 'startTimer');

      fixture.detectChanges();

      component.start();
      _mockConcurrentTimers.forEach((timer: Timer, index: number): void => {
        expect(startSpy).toHaveBeenNthCalledWith(index + 1, timer.cid);
      });
    });

    test('should stop all timers', (): void => {
      component.timers = _mockConcurrentTimers;
      component.timerService.stopTimer = jest.fn();
      const stopSpy: jest.SpyInstance = jest.spyOn(component.timerService, 'stopTimer');

      fixture.detectChanges();

      component.stop();
      _mockConcurrentTimers.forEach((timer: Timer, index: number): void => {
        expect(stopSpy).toHaveBeenNthCalledWith(index + 1, timer.cid);
      });
    });
  });


  describe('Template Render', (): void => {
    test('should render the template', (): void => {
      component.ngOnInit = originalOnInit;
      component.processes = [_mockTimerProcess, _mockTimerProcess];
      component.timers = _mockConcurrentTimers;

      fixture.detectChanges();

      const buttons: NodeList = global.document.querySelectorAll('app-timer-button');
      expect(buttons.length).toEqual(4);
      expect(buttons.item(0)['buttonText']).toMatch('Start All');
      expect(buttons.item(1)['buttonText']).toMatch('Stop All');
      expect(buttons.item(2)['buttonText']).toMatch('+1min All');
      expect(buttons.item(3)['buttonText']).toMatch('Reset All');
    });
  });

});
