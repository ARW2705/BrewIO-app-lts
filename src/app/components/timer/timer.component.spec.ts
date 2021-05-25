/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockTimer, mockConcurrentTimers } from '../../../../test-config/mock-models';
import { AnimationsServiceStub } from '../../../../test-config/service-stubs';
import { UnitConversionPipeStub } from '../../../../test-config/pipe-stubs';
import { AnimationStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { Timer } from '../../shared/interfaces/timer';

/* Service imports */
import { AnimationsService } from '../../services/animations/animations.service';

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
      providers: [
        { provide: AnimationsService, useClass: AnimationsServiceStub }
      ],
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

    timerCmp.timer = null;

    fixture.detectChanges();

    timerCmp.ngOnInit();

    expect(setSpy).toHaveBeenCalledTimes(1);
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

  test('should set timer up svg chevron path', (): void => {
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

  test('should set timer down svg chevron path', (): void => {
    const _mockTimer: Timer = mockTimer();
    _mockTimer.show = false;

    _mockTimer.settings.width = 100;
    _mockTimer.settings.height = 100;

    timerCmp.timer = _mockTimer;

    fixture.detectChanges();

    timerCmp.setChevron();

    expect(timerCmp.chevronPath).toMatch(`
      M40 75
      L50 82.5
       60 75
    `);
  });

  test('should toggle timer control visibility', (): void => {
    const _mockTimer: Timer = mockConcurrentTimers()[0];
    _mockTimer.show = false;
    const _stubExpandAnimation: AnimationStub = new AnimationStub();
    const _stubCollapseAnimation: AnimationStub = new AnimationStub();

    timerCmp.animationService.expand = jest
      .fn()
      .mockReturnValue(_stubExpandAnimation);

    timerCmp.animationService.collapse = jest
      .fn()
      .mockReturnValue(_stubCollapseAnimation);

    _stubExpandAnimation.play = jest
      .fn()
      .mockReturnValue(Promise.resolve());
    _stubCollapseAnimation.play = jest
      .fn()
      .mockReturnValue(Promise.resolve());

    timerCmp.timer = _mockTimer;
    timerCmp.isConcurrent = true;
    timerCmp.setChevron = jest
      .fn();

    const setSpy: jest.SpyInstance = jest.spyOn(timerCmp, 'setChevron');
    const expandSpy: jest.SpyInstance = jest.spyOn(timerCmp.animationService, 'expand');
    const collapseSpy: jest.SpyInstance = jest.spyOn(timerCmp.animationService, 'collapse');
    const expandPlaySpy: jest.SpyInstance = jest.spyOn(_stubExpandAnimation, 'play');
    const collapsePlaySpy: jest.SpyInstance = jest.spyOn(_stubCollapseAnimation, 'play');

    fixture.detectChanges();

    const timerElem: HTMLElement = fixture.nativeElement.querySelector('.timer-individual-controls');

    timerCmp.toggleTimerControls();

    expect(timerCmp.timer.show).toBe(true);
    expect(setSpy).toHaveBeenCalled();
    expect(expandSpy).toHaveBeenCalledWith(timerElem, { direction: -20 });
    expect(expandPlaySpy).toHaveBeenCalled();

    timerCmp.toggleTimerControls();

    expect(timerCmp.timer.show).toBe(false);
    expect(setSpy).toHaveBeenCalledTimes(2);
    expect(collapseSpy).toHaveBeenCalledWith(timerElem, { direction: -20 });
    expect(collapsePlaySpy).toHaveBeenCalled();
  });

  test('should not trigger animation if timer control container is missing', (): void => {
    const _mockTimer: Timer = mockConcurrentTimers()[0];
    _mockTimer.show = false;
    const _stubExpandAnimation: AnimationStub = new AnimationStub();

    timerCmp.animationService.expand = jest
      .fn()
      .mockReturnValue(_stubExpandAnimation);

    _stubExpandAnimation.play = jest
      .fn()
      .mockReturnValue(Promise.resolve());

    timerCmp.timer = _mockTimer;
    timerCmp.isConcurrent = false;
    timerCmp.setChevron = jest
      .fn();

    const setSpy: jest.SpyInstance = jest.spyOn(timerCmp, 'setChevron');
    const expandSpy: jest.SpyInstance = jest.spyOn(timerCmp.animationService, 'expand');
    const expandPlaySpy: jest.SpyInstance = jest.spyOn(_stubExpandAnimation, 'play');

    fixture.detectChanges();

    timerCmp.toggleTimerControls();

    expect(timerCmp.timer.show).toBe(true);
    expect(setSpy).toHaveBeenCalled();
    expect(expandSpy).not.toHaveBeenCalled();
    expect(expandPlaySpy).not.toHaveBeenCalled();
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
