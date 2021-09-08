/* Module imports */
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAlertPresent, mockCalendarMetadata } from '../../../../test-config/mock-models';
import { CalendarAlertServiceStub, IdServiceStub } from '../../../../test-config/service-stubs';

/* Interface imports */
import { Alert, CalendarMetadata } from '../../shared/interfaces';

/* Service imports */
import { CalendarAlertService, IdService } from '../../services/services';

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
    const calCmp: any = {
      getSelectedCalendarData: (): CalendarMetadata => _mockCalendarMetadata
    };

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

});
