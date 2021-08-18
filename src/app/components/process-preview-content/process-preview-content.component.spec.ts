/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockProcessSchedule } from '../../../../test-config/mock-models';
import { TimerServiceStub } from '../../../../test-config/service-stubs';

/* Interface imports */
import { CalendarProcess, ManualProcess, Process, TimerProcess } from '../../shared/interfaces';

/* Service imports */
import { TimerService } from '../../services/services';

/* Component imports */
import { ProcessPreviewContentComponent } from './process-preview-content.component';


describe('ProcessPreviewContentComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessPreviewContentComponent>;
  let component: ProcessPreviewContentComponent;
  let originalOnInit: any;
  const _mockProcessSchedule: Process[] = mockProcessSchedule();
  const _mockCalendarProcess: CalendarProcess = <CalendarProcess>_mockProcessSchedule[13];
  const _mockManualProcess: ManualProcess = <ManualProcess>_mockProcessSchedule[0];
  const _mockTimerProcess: TimerProcess = <TimerProcess>_mockProcessSchedule[2];
  const hopsProcessIndex: number = 5;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessPreviewContentComponent
      ],
      providers: [
        { provide: TimerService, useClass: TimerServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessPreviewContentComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
  });

  test('should create the component', (): void => {
    component.process = _mockProcessSchedule[0];

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should init the component', (): void => {
    component.ngOnInit = originalOnInit;
    component.setCalendarProcessContent = jest.fn();
    component.setManualProcessContent = jest.fn();
    component.setTimerProcessContent = jest.fn();
    const calSpy: jest.SpyInstance = jest.spyOn(component, 'setCalendarProcessContent');
    const manSpy: jest.SpyInstance = jest.spyOn(component, 'setManualProcessContent');
    const timSpy: jest.SpyInstance = jest.spyOn(component, 'setTimerProcessContent');
    const _mockManualProcessExpectedDuration: ManualProcess = _mockProcessSchedule[1];
    _mockManualProcessExpectedDuration.expectedDuration = 60;
    component.process = _mockCalendarProcess;

    fixture.detectChanges();

    component.ngOnInit();
    expect(calSpy).toHaveBeenCalled();
    expect(manSpy).not.toHaveBeenCalled();
    expect(timSpy).not.toHaveBeenCalled();
    component.process = _mockManualProcess;
    component.ngOnInit();
    expect(calSpy).toHaveBeenCalled();
    expect(manSpy).not.toHaveBeenCalled();
    expect(timSpy).not.toHaveBeenCalled();
    component.process = _mockManualProcessExpectedDuration;
    component.ngOnInit();
    expect(calSpy).toHaveBeenCalled();
    expect(manSpy).toHaveBeenCalled();
    expect(timSpy).not.toHaveBeenCalled();
    component.process = _mockTimerProcess;
    component.ngOnInit();
    expect(calSpy).toHaveBeenCalled();
    expect(manSpy).toHaveBeenCalled();
    expect(timSpy).toHaveBeenCalled();
  });

  test('should generate calendar process content', (): void => {
    component.process = _mockCalendarProcess;

    fixture.detectChanges();

    component.setCalendarProcessContent();
    const content: { subject: string, predicate: string } = component.contentToDisplay[0];
    expect(content.subject).toMatch('Duration:');
    expect(content.predicate).toMatch(`${_mockCalendarProcess.duration} days`);
  });

  test('should generate manual process content', (): void => {
    const _mockManualProcessExpectedDuration: ManualProcess = _mockProcessSchedule[1];
    _mockManualProcessExpectedDuration.expectedDuration = 60;
    component.process = _mockManualProcessExpectedDuration;

    fixture.detectChanges();

    component.setManualProcessContent();
    const content: { subject: string, predicate: string } = component.contentToDisplay[0];
    expect(content.subject).toMatch('Expected Duration:');
    expect(content.predicate).toMatch(`${_mockManualProcessExpectedDuration.expectedDuration} minutes`);
  });

  test('should generate timer process content', (): void => {
    const _mockHopsTimerProcess: TimerProcess = <TimerProcess>_mockProcessSchedule[hopsProcessIndex];
    component.process = _mockHopsTimerProcess;
    component.timerService.getFormattedDurationString = jest.fn()
      .mockReturnValue('Duration: 1 hour');

    fixture.detectChanges();
    component.setTimerProcessContent();
    const [durationContent, intervalContent] = component.contentToDisplay;
    expect(durationContent.subject).toMatch('Duration:');
    expect(durationContent.predicate).toMatch('1 hour');
    expect(intervalContent.subject).toMatch('Interval:');
    expect(intervalContent.predicate).toMatch('1');
  });

  test('should render the template', (): void => {
    const _mockHopsTimerProcess: TimerProcess = <TimerProcess>_mockProcessSchedule[hopsProcessIndex];
    component.process = _mockHopsTimerProcess;
    component.contentToDisplay = [
      { subject: 'Duration:', predicate: '1 hour' },
      { subject: 'Interval:', predicate: '1' }
    ];

    fixture.detectChanges();

    const contentRows: NodeList = global.document.querySelectorAll('ion-row');
    const duration: Element = (<HTMLElement>contentRows.item(0)).children[0];
    expect(duration.children[0].textContent).toMatch('Duration:');
    expect(duration.children[1].textContent).toMatch('1 hour');
    console.log(contentRows.item(1));
    const interval: Element = (<HTMLElement>contentRows.item(1)).children[0];
    expect(interval.children[0].textContent).toMatch('Interval:');
    expect(interval.children[1].textContent).toMatch('1');
    const description: Element = (<HTMLElement>contentRows.item(2)).children[0];
    expect(description['description']).toMatch(_mockHopsTimerProcess.description);
  });

});
