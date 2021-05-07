/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockTimer } from '../../../../test-config/mock-models';
import { UnitConversionPipeStub } from '../../../../test-config/pipe-stubs';

/* Interface imports */
import { Timer } from '../../shared/interfaces/timer';

/* Component imoprts */
import { TimerComponent } from './timer.component';


describe('TimerComponent', (): void => {
  let fixture: ComponentFixture<TimerComponent>;
  let timerCmp: TimerComponent;
  let originalOnInit: any;
  configureTestBed();

  beforeEach((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        TimerComponent,
        UnitConversionPipeStub
      ],
      imports: [ NoopAnimationsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(TimerComponent);
    timerCmp = fixture.componentInstance;
    originalOnInit = timerCmp.ngOnInit;
    timerCmp.ngOnInit = jest
      .fn();
    timerCmp.onTimerAction = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(timerCmp).toBeDefined();
  });

  test('should init the component', (): void => {
    const _mockTimer: Timer = mockTimer();

    timerCmp.ngOnInit = originalOnInit;
    timerCmp.timer = _mockTimer;
    timerCmp.setChevron = jest
      .fn();

    const setSpy: jest.SpyInstance = jest.spyOn(timerCmp, 'setChevron');

    fixture.detectChanges();

    expect(setSpy).toHaveBeenCalled();
  });

  test('should add to single timer', (): void => {
    const _mockTimer: Timer = mockTimer();

    timerCmp.timer = _mockTimer;

    const actionSpy: jest.SpyInstance = jest.spyOn(timerCmp, 'onTimerAction');

    fixture.detectChanges();

    timerCmp.addToSingleTimer();

    expect(actionSpy).toHaveBeenCalledWith('addToSingleTimer', _mockTimer);
  });

  test('should reset timer', (): void => {
    const _mockTimer: Timer = mockTimer();

    timerCmp.timer = _mockTimer;

    const actionSpy: jest.SpyInstance = jest.spyOn(timerCmp, 'onTimerAction');

    fixture.detectChanges();

    timerCmp.resetSingleTimer();

    expect(actionSpy).toHaveBeenCalledWith('resetSingleTimer', _mockTimer);
  });

  test('should start single timer', (): void => {
    const _mockTimer: Timer = mockTimer();

    timerCmp.timer = _mockTimer;

    const actionSpy: jest.SpyInstance = jest.spyOn(timerCmp, 'onTimerAction');

    fixture.detectChanges();

    timerCmp.startSingleTimer();

    expect(actionSpy).toHaveBeenCalledWith('startSingleTimer', _mockTimer);
  });

  test('should stop single timer', (): void => {
    const _mockTimer: Timer = mockTimer();

    timerCmp.timer = _mockTimer;

    const actionSpy: jest.SpyInstance = jest.spyOn(timerCmp, 'onTimerAction');

    fixture.detectChanges();

    timerCmp.stopSingleTimer();

    expect(actionSpy).toHaveBeenCalledWith('stopSingleTimer', _mockTimer);
  });

  test('should set timer svg chevron path', (): void => {
    const _mockTimer: Timer = mockTimer();
    _mockTimer.settings.width = 100;
    _mockTimer.settings.height = 100;

    timerCmp.timer = _mockTimer;

    fixture.detectChanges();

    timerCmp.setChevron();

    expect(timerCmp.chevronPath).toMatch(`
      M40 82.5
      L50 75
       60 82.5
    `);
  });

  test('should toggle timer control visibility', (): void => {
    const _mockTimer: Timer = mockTimer();

    timerCmp.timer = _mockTimer;
    timerCmp.setChevron = jest
      .fn();

    fixture.detectChanges();

    timerCmp.toggleTimerControls();

    expect(timerCmp.timer.show).toBe(false);
    expect(timerCmp.timer.expansion).toStrictEqual({
      value: 'collapsed',
      params: {
        height: _mockTimer.settings.height,
        speed: 250
      }
    });

    timerCmp.toggleTimerControls();

    expect(timerCmp.timer.show).toBe(true);
    expect(timerCmp.timer.expansion).toStrictEqual({
      value: 'expanded',
      params: {
        height: _mockTimer.settings.height,
        speed: 250
      }
    });
  });

  test('should render single timer', (): void => {
    const _mockTimer: Timer = mockTimer();
    _mockTimer.timeRemaining = 10;
    _mockTimer.expansion = {
      value: 'expanded',
      params: {
        height: 100,
        speed: 100
      }
    };

    timerCmp.timer = _mockTimer;
    timerCmp.showDescription = true;

    fixture.detectChanges();

    const timerName: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(timerName.textContent).toMatch(_mockTimer.timer.name);

    const timerCircle: HTMLElement = fixture.nativeElement.querySelector('progress-circle');
    expect(timerCircle).not.toBeNull();

    const concurrentTimer: HTMLElement = fixture.nativeElement.querySelector('.timer-individual-controls');
    expect(concurrentTimer).toBeNull();
  });

  test('should render concurrentTimer', (): void => {
    const _mockTimer: Timer = mockTimer();
    _mockTimer.timeRemaining = 10;
    _mockTimer.expansion = {
      value: 'expanded',
      params: {
        height: 100,
        speed: 100
      }
    };

    timerCmp.timer = _mockTimer;
    timerCmp.showDescription = true;
    timerCmp.isConcurrent = true;

    fixture.detectChanges();

    const concurrentTimer: HTMLElement = fixture.nativeElement.querySelector('.timer-individual-controls');
    expect(concurrentTimer.children.length).toEqual(4);
  });

});
