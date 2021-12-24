/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockAlertPresent, mockCalendarMetadata, mockCalendarProcess } from '@test/mock-models';
import { CalendarAlertServiceStub, IdServiceStub } from '@test/service-stubs';

/* Interface imports */
import { Alert, CalendarMetadata, CalendarProcess } from '@shared/interfaces';

/* Service imports */
import { CalendarAlertService, IdService } from '@services/public';

/* Component imports */
import { ProcessCalendarComponent } from './process-calendar.component';


describe('ProcessCalendarComponent', (): void => {
  let fixture: ComponentFixture<ProcessCalendarComponent>;
  let component: ProcessCalendarComponent;
  let originalOnChanges: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessCalendarComponent
      ],
      providers: [
        { provide: CalendarAlertService, useClass: CalendarAlertServiceStub },
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
    originalOnChanges = component.ngOnChanges;
    component.ngOnChanges = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should handle component changes', (): void => {
    component.ngOnChanges = originalOnChanges;
    const _mockAlert: Alert = mockAlertPresent();
    component.calendarAlertService.getClosestAlertByGroup = jest.fn()
      .mockReturnValue(_mockAlert);

    fixture.detectChanges();

    component.ngOnChanges();
    expect(component.closestAlert).toStrictEqual(_mockAlert);
  });

  test('should emit a change date event', (): void => {
    component.changeDateEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.changeDateEvent, 'emit');

    fixture.detectChanges();

    component.changeDate();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should get calendar data from sub component', (): void => {
    const _mockCalendarMetadata: CalendarMetadata = mockCalendarMetadata();
    const calCmp: any = { getSelectedCalendarData: (): CalendarMetadata => _mockCalendarMetadata };

    fixture.detectChanges();

    component.calendarRef = calCmp;
    expect(component.getSelectedCalendarData()).toStrictEqual(_mockCalendarMetadata);
  });

  test('should toggle show description flag', (): void => {
    fixture.detectChanges();

    expect(component.showDescription).toBe(false);
    component.toggleShowDescription();
    expect(component.showDescription).toBe(true);
    component.toggleShowDescription();
    expect(component.showDescription).toBe(false);
  });

  test('should render the template as preview', (): void => {
    component.isPreview = true;
    const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
    component.calendarProcess = _mockCalendarProcess;
    component.alerts = [];

    fixture.detectChanges();

    const header: HTMLElement = fixture.nativeElement.querySelector('app-process-header');
    expect(header['isPreview']).toBe(true);
    const preview: HTMLElement = fixture.nativeElement.querySelector('app-process-preview-content');
    expect(preview['process']).toStrictEqual(_mockCalendarProcess);
    const description: HTMLElement = fixture.nativeElement.querySelector('app-process-description');
    expect(description).toBeNull();
    const alerts: HTMLElement = fixture.nativeElement.querySelector('app-process-calendar-alerts');
    expect(alerts).toBeNull();
    const calendar: HTMLElement = fixture.nativeElement.querySelector('app-calendar');
    expect(calendar).toBeNull();
  });

  test('should render the template as calendar that has not been started', (): void => {
    component.isPreview = false;
    const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
    component.calendarProcess = _mockCalendarProcess;
    component.alerts = [];
    component.showDescription = true;

    fixture.detectChanges();

    const header: HTMLElement = fixture.nativeElement.querySelector('app-process-header');
    expect(header['isPreview']).toBe(false);
    const preview: HTMLElement = fixture.nativeElement.querySelector('app-process-preview-content');
    expect(preview).toBeNull();
    const description: HTMLElement = fixture.nativeElement.querySelector('app-process-description');
    expect(description['description']).toMatch(_mockCalendarProcess.description);
    const alerts: HTMLElement = fixture.nativeElement.querySelector('app-process-calendar-alerts');
    expect(alerts).toBeNull();
    const calendar: HTMLElement = fixture.nativeElement.querySelector('app-calendar');
    expect(calendar['calendarProcess']).toStrictEqual(_mockCalendarProcess);
  });

  test('should render the template as calendar that has been started', (): void => {
    component.isPreview = false;
    const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
    const now: string = (new Date()).toISOString();
    _mockCalendarProcess.startDatetime = now;
    component.calendarProcess = _mockCalendarProcess;
    const _mockAlert: Alert = mockAlertPresent();
    component.alerts = [_mockAlert];
    component.showDescription = true;

    fixture.detectChanges();

    const header: HTMLElement = fixture.nativeElement.querySelector('app-process-header');
    expect(header['isPreview']).toBe(false);
    const preview: HTMLElement = fixture.nativeElement.querySelector('app-process-preview-content');
    expect(preview).toBeNull();
    const description: HTMLElement = fixture.nativeElement.querySelector('app-process-description');
    expect(description['description']).toMatch(_mockCalendarProcess.description);
    const alerts: HTMLElement = fixture.nativeElement.querySelector('app-process-calendar-alerts');
    expect(alerts['alerts']).toStrictEqual([_mockAlert]);
    const calendar: HTMLElement = fixture.nativeElement.querySelector('app-calendar');
    expect(calendar).toBeNull();
  });

});
