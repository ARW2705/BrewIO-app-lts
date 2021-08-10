/* Module imports */
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAlertFuture, mockAlertPast, mockAlertPresent, mockProcessSchedule } from '../../../../test-config/mock-models';
import { CalendarComponentStub } from '../../../../test-config/component-stubs';
import { IdServiceStub } from '../../../../test-config/service-stubs';
import { SortPipeStub } from '../../../../test-config/pipe-stubs';

/* Interface imports */
import { Alert, CalendarProcess, Process } from '../../shared/interfaces';

/* Service imports */
import { IdService } from '../../services/services';

/* Component imports */
import { ProcessCalendarComponent } from './process-calendar.component';
import { CalendarComponent } from '../calendar/calendar.component';


describe('ProcessCalendarComponent', (): void => {
  let fixture: ComponentFixture<ProcessCalendarComponent>;
  let component: ProcessCalendarComponent;
  let injector: TestBed;
  let originalOnChanges: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessCalendarComponent,
        SortPipeStub
      ],
      providers: [
        { provide: IdService, useClass: IdServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessCalendarComponent);
    component = fixture.componentInstance;
    injector = getTestBed();
    originalOnChanges = component.ngOnChanges;
    component.ngOnChanges = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should reform alerts after changes to input', (): void => {
    component.ngOnChanges = originalOnChanges;
    component.getClosestAlertByGroup = jest.fn();
    const alertSpy: jest.SpyInstance = jest.spyOn(component, 'getClosestAlertByGroup');

    fixture.detectChanges();

    component.ngOnChanges();
    expect(alertSpy).toHaveBeenCalled();
  });

  test('should emit a change date event', (): void => {
    component.changeDateEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.changeDateEvent, 'emit');

    fixture.detectChanges();

    component.changeDate();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should get the closest alert of the current step', (): void => {
    const _mockAlertPast: Alert = mockAlertPast();
    const _mockAlertPresent: Alert = mockAlertPresent();
    const _mockNearFuture = new Date(_mockAlertPresent.datetime);
    _mockNearFuture.setDate(_mockNearFuture.getDate() + 1);
    _mockAlertPresent.datetime = _mockNearFuture.toISOString();
    const _mockAlertFuture: Alert = mockAlertFuture();

    component.alerts = [ _mockAlertPast, _mockAlertPresent, _mockAlertFuture ];

    fixture.detectChanges();

    const result: Alert = component.getClosestAlertByGroup();
    expect(result).toStrictEqual(_mockAlertPresent);
  });

  test('should get null getting closest alert if no alerts', (): void => {
    component.alerts = [];

    fixture.detectChanges();

    expect(component.getClosestAlertByGroup()).toBeNull();
  });

  test('should start a calendar process', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    const _mockCalendarProcess: Process = _mockProcessSchedule[13];
    const now: string = (new Date()).toISOString();

    fixture.detectChanges();

    const _stubIdSevice: IdService = injector.get(IdService);
    component.calendarRef = <CalendarComponent>(new CalendarComponentStub(_stubIdSevice));
    component.calendarRef.getFinal = jest
      .fn()
      .mockReturnValue({
        id: _mockCalendarProcess._id,
        startDatetime: now,
        alerts: []
      });

    expect(component.startCalendar()).toStrictEqual({
      id: _mockCalendarProcess._id,
      startDatetime: now,
      alerts: []
    });
  });

  test('should toggle show description flag', (): void => {
    fixture.detectChanges();

    expect(component.showDescription).toBe(false);
    component.toggleShowDescription();
    expect(component.showDescription).toBe(true);
    component.toggleShowDescription();
    expect(component.showDescription).toBe(false);
  });

  test('should render template with a calendar', (): void => {
    const _mockCalendarProcess: CalendarProcess = <CalendarProcess>mockProcessSchedule()[13];
    component.alerts = [];
    component.isPreview = false;
    component.calendarProcess = _mockCalendarProcess;
    const _stubIdSevice: IdService = injector.get(IdService);
    component.calendarRef = <CalendarComponent>(new CalendarComponentStub(_stubIdSevice));

    fixture.detectChanges();

    const descriptionContainer: HTMLElement = fixture.nativeElement.querySelector('#description-container');
    expect(descriptionContainer).toBeNull();
    const calendar: HTMLElement = fixture.nativeElement.querySelector('app-calendar');
    expect(calendar).toBeDefined();
  });

  test('should render template with a preview', (): void => {
    const _mockCalendarProcess: CalendarProcess = <CalendarProcess>mockProcessSchedule()[13];
    component.alerts = [];
    component.isPreview = true;
    component.calendarProcess = _mockCalendarProcess;
    const _stubIdSevice: IdService = injector.get(IdService);
    component.calendarRef = <CalendarComponent>(new CalendarComponentStub(_stubIdSevice));
    component.showDescription = true;

    fixture.detectChanges();

    const descriptionContainer: HTMLElement = fixture.nativeElement.querySelector('#description-container');
    expect(descriptionContainer.children[0].textContent).toMatch(`Description: ${_mockCalendarProcess.description}`);
    const calendar: HTMLElement = fixture.nativeElement.querySelector('app-calendar');
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
    component.alerts = [ _mockAlertFuture, _mockAlertPresent ];
    component.isPreview = false;
    component.calendarProcess = _mockCalendarProcess;
    const _stubIdSevice: IdService = injector.get(IdService);
    component.calendarRef = <CalendarComponent>(new CalendarComponentStub(_stubIdSevice));
    component.closestAlert = _mockAlertPresent;
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
