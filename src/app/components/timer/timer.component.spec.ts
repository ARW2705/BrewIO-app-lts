/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockConcurrentTimers, mockProcessSchedule, mockTimer } from '../../../../test-config/mock-models';
import { AnimationsServiceStub } from '../../../../test-config/service-stubs';
import { AnimationStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { Timer, TimerProcess } from '../../shared/interfaces';

/* Service imports */
import { AnimationsService } from '../../services/animations/animations.service';

/* Component imoprts */
import { TimerComponent } from './timer.component';


describe('TimerComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<TimerComponent>;
  let component: TimerComponent;
  let originalOnInit: any;

  beforeEach((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        TimerComponent
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
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should init the component', (): void => {
    const _mockTimer: Timer = mockTimer();
    component.ngOnInit = originalOnInit;
    component.timer = _mockTimer;
    component.setChevron = jest.fn();
    const setSpy: jest.SpyInstance = jest.spyOn(component, 'setChevron');

    fixture.detectChanges();

    expect(setSpy).toHaveBeenCalled();
    component.timer = null;

    fixture.detectChanges();

    component.ngOnInit();
    expect(setSpy).toHaveBeenCalledTimes(1);
  });

  test('should set timer up svg chevron path', (): void => {
    const _mockTimer: Timer = mockTimer();
    _mockTimer.settings.width = 100;
    _mockTimer.settings.height = 100;
    component.timer = _mockTimer;

    fixture.detectChanges();

    component.setChevron();
    expect(component.chevronPath).toMatch(`
      M 40 82.5
      L 50 75
        60 82.5
    `);
  });

  test('should set timer down svg chevron path', (): void => {
    const _mockTimer: Timer = mockTimer();
    _mockTimer.show = false;
    _mockTimer.settings.width = 100;
    _mockTimer.settings.height = 100;
    component.timer = _mockTimer;

    fixture.detectChanges();

    component.setChevron();
    expect(component.chevronPath).toMatch(`
      M 40 75
      L 50 82.5
        60 75
    `);
  });

  test('should toggle description visibility', (): void => {
    fixture.detectChanges();

    expect(component.showDescription).toBe(false);
    component.toggleShowDescription();
    expect(component.showDescription).toBe(true);
    component.toggleShowDescription();
    expect(component.showDescription).toBe(false);
  });

  test('should toggle timer control visibility', (): void => {
    const _mockTimer: Timer = mockConcurrentTimers()[0];
    _mockTimer.show = false;
    const _stubExpandAnimation: AnimationStub = new AnimationStub();
    const _stubCollapseAnimation: AnimationStub = new AnimationStub();
    component.animationService.expand = jest.fn()
      .mockReturnValue(_stubExpandAnimation);
    component.animationService.collapse = jest.fn()
      .mockReturnValue(_stubCollapseAnimation);
    _stubExpandAnimation.play = jest.fn()
      .mockReturnValue(Promise.resolve());
    _stubCollapseAnimation.play = jest.fn()
      .mockReturnValue(Promise.resolve());
    component.timer = _mockTimer;
    component.setChevron = jest.fn();
    const setSpy: jest.SpyInstance = jest.spyOn(component, 'setChevron');
    const expandSpy: jest.SpyInstance = jest.spyOn(component.animationService, 'expand');
    const collapseSpy: jest.SpyInstance = jest.spyOn(component.animationService, 'collapse');
    const expandPlaySpy: jest.SpyInstance = jest.spyOn(_stubExpandAnimation, 'play');
    const collapsePlaySpy: jest.SpyInstance = jest.spyOn(_stubCollapseAnimation, 'play');

    fixture.detectChanges();

    const timerElem: HTMLElement = fixture.nativeElement.querySelector('.timer-individual-controls');
    component.toggleTimerControls();
    expect(component.timer.show).toBe(true);
    expect(setSpy).toHaveBeenCalled();
    expect(expandSpy).toHaveBeenCalledWith(timerElem, { direction: -20 });
    expect(expandPlaySpy).toHaveBeenCalled();
    component.toggleTimerControls();
    expect(component.timer.show).toBe(false);
    expect(setSpy).toHaveBeenCalledTimes(2);
    expect(collapseSpy).toHaveBeenCalledWith(timerElem, { direction: -20 });
    expect(collapsePlaySpy).toHaveBeenCalled();
  });

  test('should not trigger animation if timer control container is missing', (): void => {
    const _mockTimer: Timer = mockConcurrentTimers()[0];
    _mockTimer.show = false;
    _mockTimer.timer.concurrent = false;
    const _stubExpandAnimation: AnimationStub = new AnimationStub();
    component.animationService.expand = jest.fn()
      .mockReturnValue(_stubExpandAnimation);
    _stubExpandAnimation.play = jest.fn()
      .mockReturnValue(Promise.resolve());
    component.timer = _mockTimer;
    component.setChevron = jest.fn();
    const setSpy: jest.SpyInstance = jest.spyOn(component, 'setChevron');
    const expandSpy: jest.SpyInstance = jest.spyOn(component.animationService, 'expand');
    const expandPlaySpy: jest.SpyInstance = jest.spyOn(_stubExpandAnimation, 'play');

    fixture.detectChanges();
    console.log('Container', component.timerControlsContainer);
    component.toggleTimerControls();
    expect(component.timer.show).toBe(true);
    expect(setSpy).toHaveBeenCalled();
    expect(expandSpy).not.toHaveBeenCalled();
    expect(expandPlaySpy).not.toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    component.ngOnInit = originalOnInit;
    const _mockTimerProcess: TimerProcess = <TimerProcess>mockProcessSchedule()[2];
    component.process = _mockTimerProcess;
    const _mockTimer: Timer = mockTimer();
    _mockTimer.timer.concurrent = true;
    component.timer = _mockTimer;

    fixture.detectChanges();

    const header: HTMLElement = global.document.querySelector('app-process-header');
    expect(header['headerText']).toMatch(_mockTimer.timer.name);
    expect(header['isExpired']).toBe(false);
    expect(header['isPreview']).toBe(false);
    const description: HTMLElement = global.document.querySelector('app-process-description');
    expect(description['description']).toMatch(_mockTimer.timer.description);
    expect(description['isDropDown']).toBe(true);
    const circle: HTMLElement = global.document.querySelector('app-progress-circle');
    expect(circle['settings']).toStrictEqual(_mockTimer.settings);
    expect(circle['showButton']).toBe(_mockTimer.timer.concurrent);
    const controls: HTMLElement = global.document.querySelector('app-timer-controls');
    expect(controls['processes']).toStrictEqual([_mockTimerProcess]);
    expect(controls['timers']).toStrictEqual([_mockTimer]);
  });

});
