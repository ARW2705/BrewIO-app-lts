/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Component imports */
import { ProcessControlsComponent } from './process-controls.component';


describe('ProcessControlsComponent', (): void => {
  let fixture: ComponentFixture<ProcessControlsComponent>;
  let processCmp: ProcessControlsComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ProcessControlsComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessControlsComponent);
    processCmp = fixture.componentInstance;
    processCmp.onControlAction = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(processCmp).toBeDefined();
  });

  test('should handle change step', (): void => {
    const actionSpy: jest.SpyInstance = jest.spyOn(processCmp, 'onControlAction');

    fixture.detectChanges();

    processCmp.changeStep('next');

    expect(actionSpy).toHaveBeenCalledWith('changeStep', 'next');
  });

  test('should handle complete step', (): void => {
    const actionSpy: jest.SpyInstance = jest.spyOn(processCmp, 'onControlAction');

    fixture.detectChanges();

    processCmp.completeStep();

    expect(actionSpy).toHaveBeenCalledWith('completeStep');
  });

  test('should handle go to active step', (): void => {
    const actionSpy: jest.SpyInstance = jest.spyOn(processCmp, 'onControlAction');

    fixture.detectChanges();

    processCmp.goToActiveStep();

    expect(actionSpy).toHaveBeenCalledWith('goToActiveStep');
  });

  test('should handle open measurement form modal', (): void => {
    const actionSpy: jest.SpyInstance = jest.spyOn(processCmp, 'onControlAction');

    fixture.detectChanges();

    processCmp.openMeasurementFormModal();

    expect(actionSpy).toHaveBeenCalledWith('openMeasurementFormModal', false);
  });

  test('should handle start calendar', (): void => {
    const actionSpy: jest.SpyInstance = jest.spyOn(processCmp, 'onControlAction');

    fixture.detectChanges();

    processCmp.startCalendar();

    expect(actionSpy).toHaveBeenCalledWith('startCalendar');
  });

  test('should render controls (at view start : not on current step)', (): void => {
    processCmp.atViewStart = true;

    fixture.detectChanges();

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

    const previousButton: HTMLElement = <HTMLElement>buttons.item(0);
    expect(previousButton['disabled']).toBe(true);
    expect(previousButton.children[0].getAttribute('name')).toMatch('caret-back-outline');

    const activeButton: HTMLElement = <HTMLElement>buttons.item(1);
    expect(activeButton.textContent).toMatch('Go To Active');

    const nextButton: HTMLElement = <HTMLElement>buttons.item(2);
    expect(nextButton['disabled']).toBe(false);
    expect(nextButton.children[0].getAttribute('name')).toMatch('caret-forward-outline');
  });

  test('should render controls (at view start : on current step : not calendar step)', (): void => {
    processCmp.atViewStart = true;
    processCmp.onCurrentStep = true;
    processCmp.isCalendarStep = false;

    fixture.detectChanges();

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

    const previousButton: HTMLElement = <HTMLElement>buttons.item(0);
    expect(previousButton['disabled']).toBe(true);
    expect(previousButton.children[0].getAttribute('name')).toMatch('caret-back-outline');

    const buildButton: HTMLElement = <HTMLElement>buttons.item(1);
    expect(buildButton.children[0].getAttribute('name')).toMatch('build-outline');

    const doneButton: HTMLElement = <HTMLElement>buttons.item(2);
    expect(doneButton.textContent).toMatch('Done');

    const nextButton: HTMLElement = <HTMLElement>buttons.item(3);
    expect(nextButton['disabled']).toBe(false);
    expect(nextButton.children[0].getAttribute('name')).toMatch('caret-forward-outline');
  });

  test('should render controls (at view end : on current step : on calendar step)', (): void => {
    processCmp.atViewStart = false;
    processCmp.atViewEnd = true;
    processCmp.onCurrentStep = true;
    processCmp.isCalendarStep = true;
    processCmp.isCalendarInProgress = false;

    fixture.detectChanges();

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

    const previousButton: HTMLElement = <HTMLElement>buttons.item(0);
    expect(previousButton['disabled']).toBe(false);
    expect(previousButton.children[0].getAttribute('name')).toMatch('caret-back-outline');

    const startButton: HTMLElement = <HTMLElement>buttons.item(1);
    expect(startButton.textContent).toMatch('Start');

    const nextButton: HTMLElement = <HTMLElement>buttons.item(2);
    expect(nextButton['disabled']).toBe(true);
    expect(nextButton.children[0].getAttribute('name')).toMatch('caret-forward-outline');
  });

});
