/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAlertPast, mockAlertFuture, mockAlertPresent, mockProcessSchedule } from '../../../../test-config/mock-models';
import { CalendarComponentStub } from '../../../../test-config/component-stubs';
import { EventServiceStub } from '../../../../test-config/service-stubs';
import { SortPipeStub } from '../../../../test-config/pipe-stubs';

/* Interface imports */
import { Alert, CalendarProcess, Process } from '../../shared/interfaces';

/* Service imports */
import { EventService } from '../../services/event/event.service';

/* Component imports */
import { ProcessCalendarComponent } from './process-calendar.component';
import { CalendarComponent } from '../calendar/calendar.component';


describe('ProcessCalendarComponent', (): void => {
  let fixture: ComponentFixture<ProcessCalendarComponent>;
  let processCmp: ProcessCalendarComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessCalendarComponent,
        SortPipeStub
      ],
      providers: [
        { provide: EventService, useClass: EventServiceStub }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessCalendarComponent);
    processCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(processCmp).toBeDefined();
  });

  test('should handle changes to input', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    const _mockNonCalendarProcess: Process = _mockProcessSchedule[12];
    const _mockCalendarProcess: CalendarProcess = <CalendarProcess>_mockProcessSchedule[13];

    processCmp.getClosestAlertByGroup = jest
      .fn();

    processCmp.currentStepCalendarData = {
      _id: _mockNonCalendarProcess._id,
      // duration: _mockNonCalendarProcess.duration,
      title: _mockNonCalendarProcess.name,
      description: _mockNonCalendarProcess.description
    };
    processCmp.stepData = _mockCalendarProcess;

    fixture.detectChanges();

    processCmp.ngOnChanges();

    expect(processCmp.currentStepCalendarData).toStrictEqual({
      _id: _mockCalendarProcess._id,
      duration: _mockCalendarProcess.duration,
      title: _mockCalendarProcess.name,
      description: _mockCalendarProcess.description
    });
  });

  test('should emit a change date event', (): void => {
    const emitSpy: jest.SpyInstance = jest.spyOn(processCmp.event, 'emit');

    fixture.detectChanges();

    processCmp.changeDate();

    expect(emitSpy).toHaveBeenCalledWith('change-date');
  });

  test('should get the closest alert of the current step', (): void => {
    const _mockAlertPast: Alert = mockAlertPast();
    const _mockAlertPresent: Alert = mockAlertPresent();
    const _mockNearFuture = new Date(_mockAlertPresent.datetime);
    _mockNearFuture.setDate(_mockNearFuture.getDate() + 1);
    _mockAlertPresent.datetime = _mockNearFuture.toISOString();
    const _mockAlertFuture: Alert = mockAlertFuture();

    processCmp.alerts = [ _mockAlertPast, _mockAlertPresent, _mockAlertFuture ];

    fixture.detectChanges();

    const result: Alert = processCmp.getClosestAlertByGroup();
    expect(result).toStrictEqual(_mockAlertPresent);
  });

  test('should get null getting closest alert if no alerts', (): void => {
    processCmp.alerts = [];

    fixture.detectChanges();

    expect(processCmp.getClosestAlertByGroup()).toBeNull();
  });

  test('should start a calendar process', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    const _mockCalendarProcess: Process = _mockProcessSchedule[13];
    const now: string = (new Date()).toISOString();

    fixture.detectChanges();

    processCmp.calendarRef = <CalendarComponent>(new CalendarComponentStub());
    processCmp.calendarRef.getFinal = jest
      .fn()
      .mockReturnValue({
        _id: _mockCalendarProcess._id,
        startDatetime: now,
        alerts: []
      });

    expect(processCmp.startCalendar()).toStrictEqual({
      id: _mockCalendarProcess._id,
      update: {
        startDatetime: now,
        alerts: []
      }
    });
  });

  test('should toggle show description flag', (): void => {
    fixture.detectChanges();

    expect(processCmp.showDescription).toBe(false);

    processCmp.toggleShowDescription();

    expect(processCmp.showDescription).toBe(true);

    processCmp.toggleShowDescription();

    expect(processCmp.showDescription).toBe(false);
  });

  test('should render template with a calendar', (): void => {
    const _mockCalendarProcess: CalendarProcess = <CalendarProcess>mockProcessSchedule()[13];

    processCmp.alerts = [];
    processCmp.isPreview = false;
    processCmp.stepData = _mockCalendarProcess;
    processCmp.calendarRef = <CalendarComponent>(new CalendarComponentStub());

    fixture.detectChanges();

    const descriptionContainer: HTMLElement = fixture.nativeElement.querySelector('#description-container');
    expect(descriptionContainer).toBeNull();

    const calendar: HTMLElement = fixture.nativeElement.querySelector('calendar');
    expect(calendar).toBeDefined();
  });

  test('should render template with a preview', (): void => {
    const _mockCalendarProcess: CalendarProcess = <CalendarProcess>mockProcessSchedule()[13];

    processCmp.alerts = [];
    processCmp.isPreview = true;
    processCmp.stepData = _mockCalendarProcess;
    processCmp.calendarRef = <CalendarComponent>(new CalendarComponentStub());
    processCmp.showDescription = true;

    fixture.detectChanges();

    const descriptionContainer: HTMLElement = fixture.nativeElement.querySelector('#description-container');
    expect(descriptionContainer.children[0].textContent).toMatch(`Description: ${_mockCalendarProcess.description}`);

    const calendar: HTMLElement = fixture.nativeElement.querySelector('calendar');
    expect(calendar).toBeNull();
  });

  test('should render template with alerts', (): void => {
    const now: string = (new Date('2020-01-01T01:00:00')).toISOString();
    const future: string = (new Date('2021-01-01T01:00:00')).toISOString();
    const _mockCalendarProcess: CalendarProcess = <CalendarProcess>mockProcessSchedule()[13];
    _mockCalendarProcess.startDatetime = now;
    const _mockAlertPresent: Alert = mockAlertPresent();
    _mockAlertPresent.datetime = now;
    const _mockAlertFuture: Alert = mockAlertFuture();
    _mockAlertFuture.datetime = future;

    processCmp.alerts = [ _mockAlertFuture, _mockAlertPresent ];
    processCmp.isPreview = false;
    processCmp.stepData = _mockCalendarProcess;
    processCmp.calendarRef = <CalendarComponent>(new CalendarComponentStub());
    processCmp.closestAlert = _mockAlertPresent;

    SortPipeStub._returnValue = (): any[] => {
      return [ _mockAlertPresent, _mockAlertFuture ];
    };

    fixture.detectChanges();

    const alerts: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

    const presentAlert: HTMLElement = <HTMLElement>alerts.item(0);
    expect(Array.from(presentAlert.children[0].classList).includes('next-datetime')).toBe(true);
    expect(presentAlert.children[0].textContent).toMatch('Jan 1, 2020');

    const futureAlert: HTMLElement = <HTMLElement>alerts.item(1);
    expect(Array.from(futureAlert.children[0].classList).includes('next-datetime')).toBe(false);
    expect(futureAlert.children[0].textContent).toMatch('Jan 1, 2021');
  });

});
