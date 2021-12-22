/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as moment from 'moment';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockCalendarDate, mockCalendarProcess } from '../../../../../../test-config/mock-models';
import { CalendarServiceStub, IdServiceStub } from '../../../../../../test-config/service-stubs';

/* Interface imports*/
import { Alert, CalendarDate, CalendarMetadata, CalendarProcess, Process } from '../../../../shared/interfaces';

/* Service imports */
import { CalendarService, IdService } from '../../../../services/services';

/* Component imports */
import { CalendarComponent } from './calendar.component';


describe('CalendarComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<CalendarComponent>;
  let component: CalendarComponent;
  let originalOnInit: any;
  let originalOnChanges: any;
  const testISOString: string = '2020-01-01T12:00:00.000Z';

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ CalendarComponent ],
      providers: [
        { provide: CalendarService, useClass: CalendarServiceStub },
        { provide: IdService, useClass: IdServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeAll(async((): void => {
    global.Date.now = jest.fn()
      .mockImplementation(() => new Date(testISOString));
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    originalOnChanges = component.ngOnChanges;
    component.ngOnInit = jest.fn();
    component.ngOnChanges = jest.fn();
  });

  describe('Lifecycle', (): void => {

    test('should create the component', (): void => {
      fixture.detectChanges();

      expect(component).toBeDefined();
    });

    test('should init the component', (): void => {
      component.ngOnInit = originalOnInit;
      component.initCalendar = jest.fn();
      const initSpy: jest.SpyInstance = jest.spyOn(component, 'initCalendar');

      fixture.detectChanges();

      expect(initSpy).toHaveBeenCalled();
    });

    test('should update calendar on changes', (): void => {
      component.ngOnChanges = originalOnChanges;
      component.initCalendar = jest.fn();
      const initSpy: jest.SpyInstance = jest.spyOn(component, 'initCalendar');
      const oldCalendarProcess: Process = mockCalendarProcess();
      const newCalendarProcess: CalendarProcess = {
        _id: 'different-step',
        cid: '0123456789013',
        type: 'calendar',
        name: 'different-calendar-step',
        description: 'a different mock calendar step',
        duration: 10
      };
      component.idService.getId = jest.fn()
        .mockReturnValueOnce(newCalendarProcess._id)
        .mockReturnValueOnce(oldCalendarProcess._id);

      fixture.detectChanges();

      const calendarProcessChange: SimpleChanges = {
        calendarProcess: new SimpleChange(oldCalendarProcess, newCalendarProcess, false)
      };
      component.ngOnChanges(calendarProcessChange);
      expect(component.calendarProcess).not.toStrictEqual(oldCalendarProcess);
      expect(component.calendarProcess).toStrictEqual(newCalendarProcess);
      expect(initSpy).toHaveBeenCalled();
    });

  });


  describe('Calendar Methods', (): void => {

    test('should add a date to projected dates', (): void => {
      fixture.detectChanges();

      component.projectedDates = [];
      component.addToProjectedDates(mockCalendarDate());
      expect(component.projectedDates.length).toEqual(1);
      expect(component.projectedDates[0].isProjected).toBe(true);
    });

    test('should call buildCalendar', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.displayDate = _mockCalendarDate.mDate;
      component.projectedDates = [];
      component.startDate = _mockCalendarDate;
      component.calendarService.buildCalendar = jest.fn();
      const buildSpy: jest.SpyInstance = jest.spyOn(component.calendarService, 'buildCalendar');

      fixture.detectChanges();

      component.buildCalendar();
      expect(buildSpy).toHaveBeenCalledWith({
        displayDate: _mockCalendarDate.mDate,
        projectedDates: [],
        startDate: _mockCalendarDate.mDate
      });
    });

    test('should change displayed month forward', (): void => {
      component.buildCalendar = jest.fn();
      component.updateView = jest.fn();

      fixture.detectChanges();

      expect(component.displayDate.month()).toEqual(0);
      expect(component.displayDate.year()).toEqual(2020);
      component.changeMonth(true);
      expect(component.displayDate.month()).toEqual(1);
      expect(component.displayDate.year()).toEqual(2020);
    });

    test('should change displayed month or year backward', (): void => {
      component.buildCalendar = jest.fn();
      component.updateView = jest.fn();

      fixture.detectChanges();

      expect(component.displayDate.month()).toEqual(0);
      expect(component.displayDate.year()).toEqual(2020);
      component.changeMonth(false);
      expect(component.displayDate.month()).toEqual(11);
      expect(component.displayDate.year()).toEqual(2019);
    });

    test('should check if a date is in projected dates', (): void => {
      component.calendarService.isProjected = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const checkSpy: jest.SpyInstance = jest.spyOn(component.calendarService, 'isProjected');
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.projectedDates = [];

      fixture.detectChanges();

      const shouldHave: boolean = component.containsProjectedDate(_mockCalendarDate.mDate);
      expect(checkSpy).toHaveBeenCalledWith([], _mockCalendarDate.mDate);
      expect(shouldHave).toBe(true);
      const shouldNotHave: boolean = component.containsProjectedDate(_mockCalendarDate.mDate);
      expect(checkSpy).toHaveBeenCalledWith([], _mockCalendarDate.mDate);
      expect(shouldNotHave).toBe(false);
    });

    test('should get the selected date data', (): void => {
      component.idService.getId = jest.fn()
        .mockReturnValue('000');
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.startDate = _mockCalendarDate;
      component.mapProjectedDatesToAlerts = jest.fn()
        .mockReturnValue([]);

      fixture.detectChanges();

      const data: CalendarMetadata = component.getSelectedCalendarData();
      expect(data.id).toMatch('000');
      expect(data.startDatetime).toMatch(_mockCalendarDate.mDate.toISOString());
      expect(data.alerts).toStrictEqual([]);
    });

    test('should handle date button click event', (): void => {
      component.editType = '';
      component.selectStartDate = jest.fn();
      component.toggleProjectedDate = jest.fn();
      const selectSpy: jest.SpyInstance = jest.spyOn(component, 'selectStartDate');
      const toggleSpy: jest.SpyInstance = jest.spyOn(component, 'toggleProjectedDate');

      fixture.detectChanges();

      component.handleDateButtonClick(null);
      expect(selectSpy).not.toHaveBeenCalled();
      expect(toggleSpy).not.toHaveBeenCalled();
      component.editType = 'start';
      component.handleDateButtonClick(null);
      expect(selectSpy).toHaveBeenCalled();
      expect(toggleSpy).not.toHaveBeenCalled();
      component.editType = 'alerts';
      component.handleDateButtonClick(null);
      expect(selectSpy).toHaveBeenCalledTimes(1);
      expect(toggleSpy).toHaveBeenCalled();
    });

    test('should init the calendar', (): void => {
      component.setInitialStartDate = jest.fn();
      component.resetProjectedDates = jest.fn();
      component.buildCalendar = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(component, 'setInitialStartDate');
      const resetSpy: jest.SpyInstance = jest.spyOn(component, 'resetProjectedDates');
      const buildSpy: jest.SpyInstance = jest.spyOn(component, 'buildCalendar');

      fixture.detectChanges();

      component.initCalendar();
      expect(setSpy).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalled();
      expect(buildSpy).toHaveBeenCalled();
    });

    test('should check if given date is the same month/year as displayed', (): void => {
      const now: moment.Moment = moment(testISOString);
      component.displayDate = now;
      component.calendarService.isMonth = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      fixture.detectChanges();

      expect(component.isMonth(now)).toBe(true);
      expect(component.isMonth(now)).toBe(false);
    });

    test('should map projected dates to alerts', (): void => {
      const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.calendarProcess = _mockCalendarProcess;
      component.projectedDates = [ _mockCalendarDate, _mockCalendarDate ];

      fixture.detectChanges();

      const alerts: Alert[] = component.mapProjectedDatesToAlerts();
      expect(alerts.length).toEqual(2);
      alerts.forEach((alert: Alert): void => {
        expect(alert.title).toMatch(_mockCalendarProcess.name);
        expect(alert.datetime).toMatch(_mockCalendarDate.mDate.toISOString());
      });
    });

    test('should reset projected dates', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.projectedDates = [ _mockCalendarDate, _mockCalendarDate ];
      component.setInitialProjectedDate = jest.fn();
      const initSpy: jest.SpyInstance = jest.spyOn(component, 'setInitialProjectedDate');

      fixture.detectChanges();

      component.resetProjectedDates();
      expect(component.projectedDates.length).toEqual(0);
      expect(initSpy).toHaveBeenCalled();
    });

    test('should select a start date', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      _mockCalendarDate.mDate = moment('2020-01-08T12:00:00.000Z');
      const _mockCalendarBackDate: CalendarDate = mockCalendarDate();
      _mockCalendarBackDate.mDate = moment('2019-01-08T12:00:00.000Z');
      component.resetProjectedDates = jest.fn();
      component.updateView = jest.fn();

      fixture.detectChanges();

      component.selectStartDate(_mockCalendarDate);
      expect(component.startDate.mDate.isSame(_mockCalendarDate.mDate, 'day')).toBe(true);
      component.selectStartDate(_mockCalendarBackDate);
      expect(component.startDate.mDate.isSame(_mockCalendarBackDate.mDate, 'day')).toBe(false);
    });

    test('should set initial projected date', (): void => {
      const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      const now: moment.Moment = moment();
      _mockCalendarDate.mDate = now;
      component.startDate = _mockCalendarDate;
      component.calendarProcess = _mockCalendarProcess;
      const project: moment.Moment = moment().add(_mockCalendarProcess.duration, 'days');
      component.addToProjectedDates = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(component, 'addToProjectedDates');

      fixture.detectChanges();

      component.setInitialProjectedDate();
      expect(addSpy.mock.calls[0][0].mDate).toStrictEqual(project);
    });

    test('should set initial start date', (): void => {
      component.selectStartDate = jest.fn();
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.currentDate = _mockCalendarDate.mDate;
      const selectSpy: jest.SpyInstance = jest.spyOn(component, 'selectStartDate');

      fixture.detectChanges();

      component.setInitialStartDate();
      const date: CalendarDate = {
        mDate: _mockCalendarDate.mDate,
        isStart: true,
        isProjected: false,
        isToday: true
      };
      expect(component.startDate).toStrictEqual(date);
      expect(selectSpy).toHaveBeenCalledWith(date);
    });

    test('should toggle editing flag', (): void => {
      fixture.detectChanges();

      component.editType = '';
      component.toggleEdit('start');
      expect(component.editType).toMatch('start');
      component.toggleEdit('alerts');
      expect(component.editType).toMatch('alerts');
      component.toggleEdit('alerts');
      expect(component.editType.length).toEqual(0);
    });

    test('should toggle projected date', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.addToProjectedDates = jest.fn();
      component.removeFromProjectedDates = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(component, 'addToProjectedDates');
      const removeSpy: jest.SpyInstance = jest.spyOn(component, 'removeFromProjectedDates');
      component.projectedDates = [];
      const startDate: CalendarDate = mockCalendarDate();
      startDate.mDate = startDate.mDate.subtract(1, 'day');
      console.log(startDate.mDate);
      component.startDate = startDate;

      fixture.detectChanges();

      component.toggleProjectedDate(_mockCalendarDate);
      expect(addSpy).toHaveBeenCalledWith(_mockCalendarDate);
      component.projectedDates = [_mockCalendarDate];
      component.toggleProjectedDate(_mockCalendarDate);
      expect(removeSpy).toHaveBeenCalledWith(_mockCalendarDate, 0);
      const earlierDate: CalendarDate = mockCalendarDate();
      earlierDate.mDate = earlierDate.mDate.subtract(2, 'day');
      component.toggleProjectedDate(earlierDate);
      expect(addSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledTimes(1);
    });

    test('should remove a date from projected dates', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      _mockCalendarDate.isProjected = true;
      const _mockDateToRemove: CalendarDate = mockCalendarDate();
      _mockDateToRemove.isProjected = true;
      component.projectedDates = [ _mockCalendarDate, _mockDateToRemove ];

      fixture.detectChanges();

      component.removeFromProjectedDates(_mockDateToRemove, 1);
      expect(_mockDateToRemove.isProjected).toBe(false);
      expect(component.projectedDates).toStrictEqual([_mockCalendarDate]);
    });

    test('should update the view for each day', (): void => {
      component.updateViewDay = jest.fn();
      const viewSpy: jest.SpyInstance = jest.spyOn(component, 'updateViewDay');
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.month = Array.from(Array(6), (): CalendarDate[] => {
        return Array.from(Array(7), (): CalendarDate => _mockCalendarDate);
      });

      fixture.detectChanges();

      component.updateView();
      expect(viewSpy).toHaveBeenCalledTimes(42);
    });

    test('should update the view of a day', (): void => {
      component.isMonth = jest.fn()
        .mockReturnValue(true);
      component.containsProjectedDate = jest.fn()
        .mockReturnValue(false);
      const _mockStartDate: CalendarDate = mockCalendarDate();
      _mockStartDate.mDate = _mockStartDate.mDate.subtract(10, 'day');
      component.startDate = _mockStartDate;

      fixture.detectChanges();

      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.updateViewDay(_mockCalendarDate);
      expect(_mockCalendarDate.isMonth).toBe(true);
      expect(_mockCalendarDate.isStart).toBe(false);
      expect(_mockCalendarDate.isProjected).toBe(false);
    });

  });

});
