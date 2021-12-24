/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Component imports */
import { ProcessControlsComponent } from './process-controls.component';


describe('ProcessControlsComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessControlsComponent>;
  let component: ProcessControlsComponent;

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
    component = fixture.componentInstance;
    component.changeStepEvent.emit = jest.fn();
    component.completeStepEvent.emit = jest.fn();
    component.goToActiveStepEvent.emit = jest.fn();
    component.openMeasurementFormModalEvent.emit = jest.fn();
    component.startCalendarEvent.emit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should handle change step', (): void => {
    const actionSpy: jest.SpyInstance = jest.spyOn(component.changeStepEvent, 'emit');

    fixture.detectChanges();

    component.changeStep(true);
    expect(actionSpy).toHaveBeenCalledWith(true);
  });

  test('should handle complete step', (): void => {
    const actionSpy: jest.SpyInstance = jest.spyOn(component.completeStepEvent, 'emit');

    fixture.detectChanges();

    component.completeStep();
    expect(actionSpy).toHaveBeenCalled();
  });

  test('should handle go to active step', (): void => {
    const actionSpy: jest.SpyInstance = jest.spyOn(component.goToActiveStepEvent, 'emit');

    fixture.detectChanges();

    component.goToActiveStep();
    expect(actionSpy).toHaveBeenCalled();
  });

  test('should handle open measurement form modal', (): void => {
    const actionSpy: jest.SpyInstance = jest.spyOn(component.openMeasurementFormModalEvent, 'emit');

    fixture.detectChanges();

    component.openMeasurementFormModal();
    expect(actionSpy).toHaveBeenCalledWith(false);
  });

  test('should handle start calendar', (): void => {
    const actionSpy: jest.SpyInstance = jest.spyOn(component.startCalendarEvent, 'emit');

    fixture.detectChanges();

    component.startCalendar();
    expect(actionSpy).toHaveBeenCalledWith();
  });

  test('should render controls (at view start : not on current step)', (): void => {
    component.atViewStart = true;

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
    component.atViewStart = true;
    component.isCurrentStep = true;
    component.isCalendarStep = false;

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
    component.atViewStart = false;
    component.atViewEnd = true;
    component.isCurrentStep = true;
    component.isCalendarStep = true;
    component.isCalendarInProgress = false;

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
