/* Module imports */
import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChanges, SimpleChange } from '@angular/core';
import * as moment from 'moment';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockCalendarStep, mockCalendarDate } from '../../../../test-config/mock-models';
import { MomentPipeStub } from '../../../../test-config/pipe-stubs';

/* Interface imports*/
import {
  Alert,
  CalendarDate,
  CalendarProcess,
  Process
} from '../../shared/interfaces';

/* Component imports */
import { CalendarComponent } from './calendar.component';


describe('CalendarComponent', (): void => {
  let fixture: ComponentFixture<CalendarComponent>;
  let calCmp: CalendarComponent;
  let originalOnInit: any;
  let originalOnChanges: any;
  const testISOString: string = '2020-01-01T12:00:00.000Z';
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        CalendarComponent,
        MomentPipeStub
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeAll(async((): void => {
    global.Date.now = jest
      .fn()
      .mockImplementation(() => new Date(testISOString));
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(CalendarComponent);
    calCmp = fixture.componentInstance;
    originalOnInit = calCmp.ngOnInit;
    originalOnChanges = calCmp.ngOnChanges;
    calCmp.ngOnInit = jest
      .fn();
    calCmp.ngOnChanges = jest
      .fn();
  });

  describe('Lifecycle', (): void => {

    test('should create the component', (): void => {
      fixture.detectChanges();

      expect(calCmp).toBeDefined();
    });

    test('should init the component', (): void => {
      calCmp.ngOnInit = originalOnInit;

      calCmp.initCalendar = jest
        .fn();

      const initSpy: jest.SpyInstance = jest.spyOn(calCmp, 'initCalendar');

      fixture.detectChanges();

      expect(initSpy).toHaveBeenCalled();
    });

    test('should update calendar on changes', (): void => {
      calCmp.ngOnChanges = originalOnChanges;

      calCmp.initCalendar = jest
        .fn();

      const initSpy: jest.SpyInstance = jest.spyOn(calCmp, 'initCalendar');

      const oldStepData: Process = mockCalendarStep();
      const newStepData: CalendarProcess = {
        _id: 'different-step',
        cid: '0123456789013',
        type: 'calendar',
        name: 'different-calendar-step',
        description: 'a different mock calendar step',
        duration: 10
      };
      const stepDataChange: SimpleChanges = {
        stepData: new SimpleChange(oldStepData, newStepData, false)
      };

      calCmp.ngOnChanges(stepDataChange);

      expect(calCmp.stepData).not.toStrictEqual(oldStepData);
      expect(calCmp.stepData).toStrictEqual(newStepData);
      expect(initSpy).toHaveBeenCalled();
    });

  });


  describe('Calendar Methods', (): void => {

    test('should add a date to projected dates', (): void => {
      calCmp.projectedDates = [];

      calCmp.addToProjectedDates(mockCalendarDate());

      expect(calCmp.projectedDates.length).toEqual(1);
      expect(calCmp.projectedDates[0].isProjected).toBe(true);
    });

    test('should change displayed month or year forward', (): void => {
      calCmp.populateCalendar = jest
        .fn();

      calCmp.updateView = jest
        .fn();

      fixture.detectChanges();

      expect(calCmp.displayDate.month()).toEqual(0);
      expect(calCmp.displayDate.year()).toEqual(2020);

      calCmp.changeMonthYear('next', 'month');
      expect(calCmp.displayDate.month()).toEqual(1);
      expect(calCmp.displayDate.year()).toEqual(2020);

      calCmp.changeMonthYear('next', 'year');
      expect(calCmp.displayDate.month()).toEqual(1);
      expect(calCmp.displayDate.year()).toEqual(2021);
    });

    test('should change displayed month or year backward', (): void => {
      calCmp.populateCalendar = jest
        .fn();

      calCmp.updateView = jest
        .fn();

      fixture.detectChanges();

      expect(calCmp.displayDate.month()).toEqual(0);
      expect(calCmp.displayDate.year()).toEqual(2020);

      calCmp.changeMonthYear('prev', 'month');
      expect(calCmp.displayDate.month()).toEqual(11);
      expect(calCmp.displayDate.year()).toEqual(2019);

      calCmp.changeMonthYear('prev', 'year');
      expect(calCmp.displayDate.month()).toEqual(11);
      expect(calCmp.displayDate.year()).toEqual(2018);
    });

    test('should fill dates of calendar', (): void => {
      const testMoment: moment.Moment = moment(testISOString);

      calCmp.isToday = jest
        .fn()
        .mockReturnValue(false);

      calCmp.isStart = jest
        .fn()
        .mockReturnValue(false);

      calCmp.isProjected = jest
        .fn()
        .mockReturnValue(false);

      const calendar: CalendarDate[] = calCmp.fillDates(testMoment);

      expect(calendar.length).toEqual(42);
      expect(calendar[0].mDate.month()).toEqual(11);
      expect(calendar[0].mDate.date()).toEqual(29);
      expect(calendar[12].mDate.month()).toEqual(0);
      expect(calendar[12].mDate.date()).toEqual(10);
      expect(calendar[41].mDate.month()).toEqual(1);
      expect(calendar[41].mDate.date()).toEqual(8);
    });

    test('should get current calendar state', (): void => {
      const _mockCalendarStep: object = mockCalendarStep();
      _mockCalendarStep['title'] = _mockCalendarStep['name'];
      const _mockStartDate: CalendarDate = mockCalendarDate();
      const _mockProjectedDate: CalendarDate = mockCalendarDate();
      _mockProjectedDate.mDate = moment('2020-02-01T12:00:00.000Z');

      fixture.detectChanges();

      calCmp.stepData = _mockCalendarStep;
      calCmp.startDate = _mockStartDate;
      calCmp.projectedDates = [ _mockProjectedDate ];

      const data: { _id: string, startDatetime: string, alerts: Alert[] } = calCmp.getFinal();

      expect(data._id).toMatch(_mockCalendarStep['_id']);
      expect(data.startDatetime).toMatch(testISOString);
      expect(data.alerts.length).toEqual(1);
      expect(data.alerts[0]).toStrictEqual({
        title: _mockCalendarStep['title'],
        description: '',
        datetime: '2020-02-01T12:00:00.000Z'
      });
    });

    test('should initialize calendar', (): void => {
      const _mockCalendarStep: object = mockCalendarStep();

      calCmp.populateCalendar = jest
        .fn();

      calCmp.addToProjectedDates = jest
        .fn();

      calCmp.selectStartDate = jest
        .fn();

      calCmp.stepData = _mockCalendarStep;

      const addSpy: jest.SpyInstance = jest.spyOn(calCmp, 'addToProjectedDates');
      const selectSpy: jest.SpyInstance = jest.spyOn(calCmp, 'selectStartDate');

      fixture.detectChanges();

      calCmp.initCalendar();

      const addCall: any = addSpy.mock.calls[0][0];
      expect(addCall.mDate.toISOString()).toMatch('2020-01-08T12:00:00.000Z');
      expect(addCall.isStart).toBe(false);

      const selectCall: any = selectSpy.mock.calls[0][0];
      expect(selectCall.mDate.toISOString()).toMatch(testISOString);
      expect(selectCall.isStart).toBe(true);
    });

    test('should check if given date is the same month/year as displayed', (): void => {
      const now: moment.Moment = moment(testISOString);
      const diffMonth: moment.Moment = moment('2020-02-01T12:00:00.000Z');
      const sameMonthDiffYear: moment.Moment = moment('2021-01-01T12:00:00.000Z');

      calCmp.displayDate = now;

      fixture.detectChanges();

      expect(calCmp.isMonth(now)).toBe(true);
      expect(calCmp.isMonth(diffMonth)).toBe(false);
      expect(calCmp.isMonth(sameMonthDiffYear)).toBe(false);
    });

    test('should check if given date is present in projected dates', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      _mockCalendarDate.mDate = moment(testISOString);
      const nonProjected: moment.Moment = moment('2020-02-01T12:00:00.000Z');

      calCmp.projectedDates = [ _mockCalendarDate ];

      fixture.detectChanges();

      expect(calCmp.isProjected(nonProjected)).toBe(false);
      expect(calCmp.isProjected(_mockCalendarDate.mDate)).toBe(true);
    });

    test('should check if given date is start date', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      _mockCalendarDate.mDate = moment(testISOString);
      const nonStart: moment.Moment = moment('2020-02-01T12:00:00.000Z');

      calCmp.startDate = _mockCalendarDate;

      fixture.detectChanges();

      expect(calCmp.isStart(nonStart)).toBe(false);
      expect(calCmp.isStart(_mockCalendarDate.mDate)).toBe(true);
    });

    test('should check if given date is today\'s date', (): void => {
      const now: moment.Moment = moment(testISOString);
      const notNow: moment.Moment = moment('2020-02-01T12:00:00.000Z');

      fixture.detectChanges();

      expect(calCmp.isToday(now)).toBe(true);
      expect(calCmp.isToday(notNow)).toBe(false);
    });

    test('should populate a calendar 2d 6 x 7 array', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();

      calCmp.fillDates = jest
        .fn()
        .mockReturnValue(Array.from({ length: 42 }, () => _mockCalendarDate));

      fixture.detectChanges();

      calCmp.populateCalendar();

      expect(calCmp.month.length).toEqual(6);
      calCmp.month.forEach((week: CalendarDate[]): void => {
        expect(week.length).toEqual(7);
      });
    });

    test('should remove current projected dates and add initial date based on step duration', (): void => {
      const _mockCalendarStep: object = mockCalendarStep();
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      const _mockDefaultProjectedDate: CalendarDate = mockCalendarDate();
      _mockDefaultProjectedDate.mDate = moment('2020-01-08T12:00:00.000Z');
      const _mockProjectedDate1: CalendarDate = mockCalendarDate();
      _mockProjectedDate1.mDate = moment('2020-01-15T12:00:00.000Z');
      const _mockProjectedDate2: CalendarDate = mockCalendarDate();
      _mockProjectedDate2.mDate = moment('2020-02-01T12:00:00.000Z');

      calCmp.stepData = _mockCalendarStep;
      calCmp.startDate = _mockCalendarDate;
      calCmp.projectedDates = [ _mockProjectedDate1, _mockProjectedDate2 ];

      fixture.detectChanges();

      expect(calCmp.projectedDates.length).toEqual(2);

      calCmp.resetProjectedDates();

      expect(calCmp.projectedDates.length).toEqual(1);
      expect(calCmp.projectedDates[0].mDate.isSame(_mockProjectedDate1.mDate, 'day')).toBe(false);
      expect(calCmp.projectedDates[0].mDate.isSame(_mockProjectedDate2.mDate, 'day')).toBe(false);
      expect(calCmp.projectedDates[0].mDate.isSame(_mockDefaultProjectedDate.mDate, 'day')).toBe(true);
    });

    test('should select a start date', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      _mockCalendarDate.mDate = moment('2020-01-08T12:00:00.000Z');
      const _mockCalendarBackDate: CalendarDate = mockCalendarDate();
      _mockCalendarBackDate.mDate = moment('2019-01-08T12:00:00.000Z');

      calCmp.resetProjectedDates = jest
        .fn();

      calCmp.updateView = jest
        .fn();

      fixture.detectChanges();

      calCmp.selectStartDate(_mockCalendarDate);
      expect(calCmp.startDate.mDate.isSame(_mockCalendarDate.mDate, 'day')).toBe(true);

      calCmp.selectStartDate(_mockCalendarBackDate);
      expect(calCmp.startDate.mDate.isSame(_mockCalendarBackDate.mDate, 'day')).toBe(false);
    });

    test('should toggle editing flag', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      calCmp.month = Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => _mockCalendarDate));

      calCmp.selectStartDate = jest
        .fn();

      calCmp.toggleProjectedDate = jest
        .fn();

      const selectSpy: jest.SpyInstance = jest.spyOn(calCmp, 'selectStartDate');
      const toggleSpy: jest.SpyInstance = jest.spyOn(calCmp, 'toggleProjectedDate');

      fixture.detectChanges();
      const defaultDateButton: HTMLElement = fixture.nativeElement.querySelector('date-button');
      expect(calCmp.editType.length).toEqual(0);
      expect(Object.keys(defaultDateButton).includes('__zone_symbol__clickfalse')).toBe(false);


      calCmp.toggleEdit('start');
      fixture.detectChanges();
      const startDateButton: HTMLElement = fixture.nativeElement.querySelector('date-button');

      expect(calCmp.editType).toMatch('start');
      expect(Object.keys(startDateButton).includes('__zone_symbol__clickfalse')).toBe(true);
      startDateButton.click();
      expect(selectSpy).toHaveBeenCalled();
      expect(toggleSpy).not.toHaveBeenCalled();


      calCmp.toggleEdit('alerts');
      fixture.detectChanges();
      const alertsDateButton: HTMLElement = fixture.nativeElement.querySelector('date-button');

      expect(calCmp.editType).toMatch('alerts');
      expect(Object.keys(alertsDateButton).includes('__zone_symbol__clickfalse')).toBe(true);
      alertsDateButton.click();
      expect(toggleSpy).toHaveBeenCalled();
    });

    test('should toggle projected date', (): void => {
      const _mockStartDate: CalendarDate = mockCalendarDate();
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      _mockCalendarDate.mDate = moment('2020-01-08T12:00:00.000Z');
      _mockCalendarDate.isProjected = true;

      calCmp.startDate = _mockStartDate;
      calCmp.projectedDates = [ _mockCalendarDate ];

      fixture.detectChanges();

      calCmp.toggleProjectedDate(_mockCalendarDate);

      expect(calCmp.projectedDates.length).toEqual(0);
      expect(_mockCalendarDate.isProjected).toBe(false);

      calCmp.toggleProjectedDate(_mockCalendarDate);

      expect(calCmp.projectedDates[0]).toStrictEqual(_mockCalendarDate);
      expect(_mockCalendarDate.isProjected).toBe(true);
    });

    test('should update the calendar view', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();

      let dayCount = 0;
      calCmp.month = Array.from({ length: 6 }, () => {
        return Array.from({ length: 7 }, () => {
          const _mockDate: CalendarDate = mockCalendarDate();
          _mockDate.mDate = _mockDate.mDate.add(dayCount++, 'day');
          return _mockDate;
        });
      });
      calCmp.startDate = _mockCalendarDate;

      calCmp.isProjected = jest
        .fn()
        .mockImplementation((mDate: moment.Moment): boolean => {
          return mDate.isSame(calCmp.month[1][0].mDate);
        });

      fixture.detectChanges();

      expect(calCmp.month[0][0].isMonth).toBe(false);
      expect(calCmp.month[1][0].isMonth).toBe(false);
      expect(calCmp.month[5][6].isMonth).toBe(false);

      calCmp.updateView();

      expect(calCmp.month[0][0].isMonth).toBe(true);
      expect(calCmp.month[0][0].isStart).toBe(true);
      expect(calCmp.month[1][0].isMonth).toBe(true);
      expect(calCmp.month[1][0].isProjected).toBe(true);
      expect(calCmp.month[5][6].isMonth).toBe(false);
    });

  });

  describe('View Render', (): void => {

    test('should render the template', (): void => {
      const _mockCalendarStep: Process = mockCalendarStep();
      const now: Date = new Date();
      const month: string = now.toLocaleString('default', { month: 'long' });

      calCmp.stepData = _mockCalendarStep;
      calCmp.ngOnInit = originalOnInit;

      MomentPipeStub._returnValue = (): string => {
        return month;
      };

      fixture.detectChanges();

      const monthElem: HTMLElement = fixture.nativeElement.querySelector('.month-header');
      expect(monthElem.textContent).toMatch(month);

      const weekRows: NodeList = fixture.nativeElement.querySelectorAll('.week-row');
      expect(weekRows.length).toEqual(6);
    });

    test('should render select buttons', (): void => {
      const _mockCalendarStep: Process = mockCalendarStep();

      calCmp.stepData = _mockCalendarStep;
      calCmp.ngOnInit = originalOnInit;

      fixture.detectChanges();

      const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
      expect(buttons.length).toEqual(2);
      expect(buttons.item(0).textContent).toMatch('Select Start');
      expect(buttons.item(1).textContent).toMatch('Select Alerts');
    });

    test('should render days header', (): void => {
      const _mockCalendarStep: Process = mockCalendarStep();

      calCmp.stepData = _mockCalendarStep;
      calCmp.ngOnInit = originalOnInit;

      fixture.detectChanges();

      const dayHeader: HTMLElement = fixture.nativeElement.querySelector('.day-header');
      Array.from(dayHeader.children).forEach((col: Element, index: number): void => {
        expect(col.textContent).toMatch(calCmp.weekdays[index]);
      });
    });

    test('should render the calendar dates', (): void => {
      const _mockCalendarStep: Process = mockCalendarStep();

      calCmp.stepData = _mockCalendarStep;
      calCmp.ngOnInit = originalOnInit;
      calCmp.editType = '';

      fixture.detectChanges();

      const selectSpy: jest.SpyInstance = jest.spyOn(calCmp, 'selectStartDate');
      const toggleSpy: jest.SpyInstance = jest.spyOn(calCmp, 'toggleProjectedDate');

      const dateButtons: NodeList = fixture.debugElement.nativeElement.querySelectorAll('date-button');
      const jan1: HTMLElement = <HTMLElement>dateButtons[3];
      expect(jan1['isStart']).toBe(true);
      jan1.click();
      expect(selectSpy).not.toHaveBeenCalled();
      expect(toggleSpy).not.toHaveBeenCalled();
    });

    test('should render the calendar dates and select start date', (): void => {
      const _mockCalendarStep: Process = mockCalendarStep();

      calCmp.stepData = _mockCalendarStep;
      calCmp.ngOnInit = originalOnInit;
      calCmp.editType = 'start';

      fixture.detectChanges();

      const selectSpy: jest.SpyInstance = jest.spyOn(calCmp, 'selectStartDate');
      const toggleSpy: jest.SpyInstance = jest.spyOn(calCmp, 'toggleProjectedDate');

      const dateButtons: NodeList = fixture.debugElement.nativeElement.querySelectorAll('date-button');
      const jan1: HTMLElement = <HTMLElement>dateButtons[3];
      expect(jan1['isStart']).toBe(true);
      jan1.click();
      expect(selectSpy).toHaveBeenCalled();
      expect(toggleSpy).not.toHaveBeenCalled();
    });

    test('should render the calendar dates and select projected date', (): void => {
      const _mockCalendarStep: Process = mockCalendarStep();

      calCmp.stepData = _mockCalendarStep;
      calCmp.ngOnInit = originalOnInit;
      calCmp.editType = 'start';

      fixture.detectChanges();

      const selectSpy: jest.SpyInstance = jest.spyOn(calCmp, 'selectStartDate');
      const toggleSpy: jest.SpyInstance = jest.spyOn(calCmp, 'toggleProjectedDate');

      const dateButtons: NodeList = fixture.debugElement.nativeElement.querySelectorAll('date-button');
      const jan2: HTMLElement = <HTMLElement>dateButtons[4];
      expect(jan2['isStart']).toBe(false);
      jan2.click();
      expect(selectSpy).toHaveBeenCalled();
      expect(toggleSpy).not.toHaveBeenCalled();
    });

  });

});
