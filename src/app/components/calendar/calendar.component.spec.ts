/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as moment from 'moment';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAlert, mockCalendarDate, mockCalendarProcess } from '../../../../test-config/mock-models';
import { MomentPipeStub } from '../../../../test-config/pipe-stubs';
import { IdServiceStub } from '../../../../test-config/service-stubs';

/* Interface imports*/
import { Alert, CalendarDate, CalendarMetadata, CalendarProcess, Process } from '../../shared/interfaces';

/* Service imports */
import { IdService } from '../../services/services';

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
      declarations: [
        CalendarComponent,
        MomentPipeStub
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


  describe('Calendar Display Construction', (): void => {

    test('should build a calendar', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.getFirstDayOfWeekInDisplayedMonth = jest.fn().mockReturnValue(1);
      component.getFirstDateForCalendarMatrix = jest.fn().mockReturnValue(_mockCalendarDate.mDate);
      component.buildMonthMatrix = jest.fn().mockReturnValue([[]]);
      const daySpy: jest.SpyInstance = jest.spyOn(component, 'getFirstDayOfWeekInDisplayedMonth');
      const dateSpy: jest.SpyInstance = jest.spyOn(component, 'getFirstDateForCalendarMatrix');
      const buildSpy: jest.SpyInstance = jest.spyOn(component, 'buildMonthMatrix');

      fixture.detectChanges();

      component.buildCalendar();
      expect(daySpy).toHaveBeenCalled();
      expect(dateSpy).toHaveBeenCalledWith(1);
      expect(buildSpy).toHaveBeenCalledWith(_mockCalendarDate.mDate);
    });

    test('should build a calendar date', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.isMonth = jest.fn().mockReturnValue(true);
      component.isProjected = jest.fn().mockReturnValue(true);
      component.isStart = jest.fn().mockReturnValue(false);
      component.isToday = jest.fn().mockReturnValue(false);

      fixture.detectChanges();

      const buildDate: CalendarDate = component.buildCalendarDate(_mockCalendarDate.mDate);
      expect(buildDate.mDate).toStrictEqual(_mockCalendarDate.mDate);
      expect(buildDate.isMonth).toBe(true);
      expect(buildDate.isProjected).toBe(true);
      expect(buildDate.isStart).toBe(false);
      expect(buildDate.isToday).toBe(false);
    });

    test('should build a month matrix', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.buildWeekArray = jest.fn()
        .mockReturnValue([]);
      const buildSpy: jest.SpyInstance = jest.spyOn(component, 'buildWeekArray');

      fixture.detectChanges();

      const calendar: CalendarDate[][] = component.buildMonthMatrix(_mockCalendarDate.mDate);
      expect(buildSpy).toHaveBeenCalledTimes(6);
    });

    test('should build a week array', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.buildCalendarDate = jest.fn()
        .mockReturnValue(_mockCalendarDate);
      const buildSpy: jest.SpyInstance = jest.spyOn(component, 'buildCalendarDate');

      fixture.detectChanges();

      const weekArray: CalendarDate[] = component.buildWeekArray(_mockCalendarDate.mDate, 2);
      expect(weekArray.length).toEqual(7);
      const firstDateOfThirdWeek: number = 15;
      for (let i = 0; i < 7; i++) {
        expect(buildSpy.mock.calls[i][0].date()).toEqual(i + firstDateOfThirdWeek);
      }
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

    test('should change displayed month forward', (): void => {
      component.buildCalendar = jest.fn();
      component.updateView = jest.fn();

      fixture.detectChanges();

      expect(component.displayDate.month()).toEqual(0);
      expect(component.displayDate.year()).toEqual(2020);
      component.changeMonth('next');
      expect(component.displayDate.month()).toEqual(1);
      expect(component.displayDate.year()).toEqual(2020);
    });

    test('should change displayed month or year backward', (): void => {
      component.buildCalendar = jest.fn();
      component.updateView = jest.fn();

      fixture.detectChanges();

      expect(component.displayDate.month()).toEqual(0);
      expect(component.displayDate.year()).toEqual(2020);
      component.changeMonth('prev');
      expect(component.displayDate.month()).toEqual(11);
      expect(component.displayDate.year()).toEqual(2019);
    });

    test('should get current calendar state', (): void => {
      const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
      const _mockStartDate: CalendarDate = mockCalendarDate();
      const _mockProjectedDate: CalendarDate = mockCalendarDate();
      _mockProjectedDate.mDate = moment('2020-02-01T12:00:00.000Z');
      component.idService.getId = jest.fn()
        .mockReturnValue(_mockCalendarProcess['_id']);
      const _mockAlert: Alert = mockAlert();
      component.mapProjectedDatesToAlerts = jest.fn()
        .mockReturnValue([_mockAlert]);

      fixture.detectChanges();

      component.calendarProcess = _mockCalendarProcess;
      component.startDate = _mockStartDate;
      component.projectedDates = [ _mockProjectedDate ];
      const data: CalendarMetadata = component.getFinal();
      expect(data.id).toMatch(_mockCalendarProcess['_id']);
      expect(data.startDatetime).toMatch(testISOString);
      expect(data.alerts.length).toEqual(1);
      expect(data.alerts[0]).toStrictEqual(_mockAlert);
    });

    test('should get first date for calendar matrix', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.displayDate = _mockCalendarDate.mDate;

      fixture.detectChanges();

      const firstDate1: moment.Moment = component.getFirstDateForCalendarMatrix(1);
      expect(firstDate1.date()).toEqual(31);
      const firstDate2: moment.Moment = component.getFirstDateForCalendarMatrix(0);
      expect(firstDate2.date()).toEqual(25);
    });

    test('should get first day of week', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      component.displayDate = _mockCalendarDate.mDate;

      fixture.detectChanges();

      expect(component.getFirstDayOfWeekInDisplayedMonth()).toEqual(3);
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

    test('should initialize calendar', (): void => {
      const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
      component.calendarProcess = _mockCalendarProcess;
      component.setInitialStartDate = jest.fn();
      component.setInitialProjectedDate = jest.fn();
      component.buildCalendar = jest.fn();
      const startSpy: jest.SpyInstance = jest.spyOn(component, 'setInitialStartDate');
      const projectSpy: jest.SpyInstance = jest.spyOn(component, 'setInitialProjectedDate');
      const buildSpy: jest.SpyInstance = jest.spyOn(component, 'buildCalendar');

      fixture.detectChanges();

      component.initCalendar();
      expect(startSpy).toHaveBeenCalled();
      expect(projectSpy).toHaveBeenCalled();
      expect(buildSpy).toHaveBeenCalled();
    });

    test('should check if given date is the same month/year as displayed', (): void => {
      const now: moment.Moment = moment(testISOString);
      const diffMonth: moment.Moment = moment('2020-02-01T12:00:00.000Z');
      const sameMonthDiffYear: moment.Moment = moment('2021-01-01T12:00:00.000Z');
      component.displayDate = now;

      fixture.detectChanges();

      expect(component.isMonth(now)).toBe(true);
      expect(component.isMonth(diffMonth)).toBe(false);
      expect(component.isMonth(sameMonthDiffYear)).toBe(false);
    });

    test('should check if given date is present in projected dates', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      _mockCalendarDate.mDate = moment(testISOString);
      const nonProjected: moment.Moment = moment('2020-02-01T12:00:00.000Z');
      component.projectedDates = [ _mockCalendarDate ];

      fixture.detectChanges();

      expect(component.isProjected(nonProjected)).toBe(false);
      expect(component.isProjected(_mockCalendarDate.mDate)).toBe(true);
    });

    test('should check if given date is start date', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      _mockCalendarDate.mDate = moment(testISOString);
      const nonStart: moment.Moment = moment('2020-02-01T12:00:00.000Z');
      component.startDate = _mockCalendarDate;

      fixture.detectChanges();

      expect(component.isStart(nonStart)).toBe(false);
      expect(component.isStart(_mockCalendarDate.mDate)).toBe(true);
    });

    test('should check if given date is today\'s date', (): void => {
      const now: moment.Moment = moment(testISOString);
      const notNow: moment.Moment = moment('2020-02-01T12:00:00.000Z');

      fixture.detectChanges();

      expect(component.isToday(now)).toBe(true);
      expect(component.isToday(notNow)).toBe(false);
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

    test('should remove a projected date by index', (): void => {
      const _mockTargetDate: CalendarDate = mockCalendarDate();
      const _mockOtherDate: CalendarDate = mockCalendarDate();
      component.projectedDates = [ _mockOtherDate, _mockTargetDate, _mockOtherDate ];

      fixture.detectChanges();

      component.removeProjectedDateByIndex(1);
      expect(component.projectedDates).toStrictEqual([ _mockOtherDate, _mockOtherDate ]);
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
      const selectSpy: jest.SpyInstance = jest.spyOn(component, 'selectStartDate');
      const now: moment.Moment = moment();
      component.currentDate = now;

      fixture.detectChanges();

      component.setInitialStartDate();
      expect(component.startDate.mDate).toStrictEqual(now);
      expect(selectSpy.mock.calls[0][0].mDate).toStrictEqual(now);
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
      const _mockStartDate: CalendarDate = mockCalendarDate();
      const _mockPastDate: CalendarDate = mockCalendarDate();
      _mockPastDate.mDate = moment('2019-12-31T12:00:00.000Z');
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      _mockCalendarDate.mDate = moment('2020-01-08T12:00:00.000Z');
      _mockCalendarDate.isProjected = true;
      component.startDate = _mockStartDate;
      component.projectedDates = [ _mockCalendarDate ];
      component.addToProjectedDates = jest.fn();
      component.removeProjectedDateByIndex = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(component, 'addToProjectedDates');
      const removeSpy: jest.SpyInstance = jest.spyOn(component, 'removeProjectedDateByIndex');

      fixture.detectChanges();

      component.toggleProjectedDate(_mockCalendarDate);
      expect(removeSpy).toHaveBeenCalledWith(0);
      component.projectedDates = [];
      component.toggleProjectedDate(_mockCalendarDate);
      expect(addSpy).toHaveBeenCalledWith(_mockCalendarDate);
      component.toggleProjectedDate(_mockPastDate);
      expect(removeSpy).toHaveBeenCalledTimes(1);
      expect(addSpy).toHaveBeenCalledTimes(1);
    });

    test('should update the calendar view', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      let dayCount = 0;
      component.month = Array.from({ length: 6 }, () => {
        return Array.from({ length: 7 }, () => {
          const _mockDate: CalendarDate = mockCalendarDate();
          _mockDate.mDate = _mockDate.mDate.add(dayCount++, 'day');
          return _mockDate;
        });
      });
      component.startDate = _mockCalendarDate;
      component.isProjected = jest.fn()
        .mockImplementation((mDate: moment.Moment): boolean => {
          return mDate.isSame(component.month[1][0].mDate);
        });

      fixture.detectChanges();

      expect(component.month[0][0].isMonth).toBe(false);
      expect(component.month[1][0].isMonth).toBe(false);
      expect(component.month[5][6].isMonth).toBe(false);
      component.updateView();
      expect(component.month[0][0].isMonth).toBe(true);
      expect(component.month[0][0].isStart).toBe(true);
      expect(component.month[1][0].isMonth).toBe(true);
      expect(component.month[1][0].isProjected).toBe(true);
      expect(component.month[5][6].isMonth).toBe(false);
    });

  });

});
