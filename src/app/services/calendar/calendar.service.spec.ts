/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';
import * as moment from 'moment';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { ErrorReportingServiceStub, IdServiceStub, ProcessServiceStub } from '@test/service-stubs';
import { mockBatch, mockCalendarDate, mockCalendarInitialValues, mockCalendarMetadata } from '@test/mock-models';

/* Interface imports */
import { Batch, CalendarDate, CalendarInitialValues, CalendarMetadata } from '@shared/interfaces';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { IdService } from '@services/id/id.service';
import { ProcessService } from '@services/process/process.service';
import { CalendarService } from './calendar.service';


describe('CalendarService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: CalendarService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        CalendarService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ProcessService, useClass: ProcessServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(CalendarService);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  describe('Calendar Display Construction', (): void => {

    test('should build the calendar', (): void => {
      const _mockCalendarInitialValues: CalendarInitialValues = mockCalendarInitialValues();
      service.getFirstDayOfWeekInDisplayedMonth = jest.fn()
        .mockReturnValue(0);
      const firstDayOfWeekSpy: jest.SpyInstance = jest.spyOn(service, 'getFirstDayOfWeekInDisplayedMonth');
      service.getFirstDateForCalendarMatrix = jest.fn()
        .mockReturnValue(_mockCalendarInitialValues.startDate);
      const firstDateForMatrixSpy: jest.SpyInstance = jest.spyOn(service, 'getFirstDateForCalendarMatrix');
      service.buildMonthMatrix = jest.fn()
        .mockReturnValue([[]]);
      const buildSpy: jest.SpyInstance = jest.spyOn(service, 'buildMonthMatrix');

      service.buildCalendar(_mockCalendarInitialValues);
      expect(firstDayOfWeekSpy).toHaveBeenCalledWith(_mockCalendarInitialValues);
      expect(firstDateForMatrixSpy).toHaveBeenCalledWith(_mockCalendarInitialValues, 0);
      expect(buildSpy).toHaveBeenCalledWith(_mockCalendarInitialValues, _mockCalendarInitialValues.startDate);
    });

    test('should build a calendar date', (): void => {
      service.isMonth = jest.fn().mockReturnValue(true);
      service.isProjected = jest.fn().mockReturnValue(false);
      service.isStart = jest.fn().mockReturnValue(true);
      service.isToday = jest.fn().mockReturnValue(false);
      const _mockCalendarInitialValues: CalendarInitialValues = mockCalendarInitialValues();

      expect(service.buildCalendarDate(_mockCalendarInitialValues, _mockCalendarInitialValues.displayDate))
        .toStrictEqual({
          isMonth: true,
          isProjected: false,
          isStart: true,
          isToday: false,
          mDate: _mockCalendarInitialValues.displayDate
        });
    });

    test('should build the month matrix', (): void => {
      service.buildWeekArray = jest.fn().mockReturnValue([]);
      const buildSpy: jest.SpyInstance = jest.spyOn(service, 'buildWeekArray');
      const _mockCalendarInitialValues: CalendarInitialValues = mockCalendarInitialValues();

      expect(service.buildMonthMatrix(_mockCalendarInitialValues, _mockCalendarInitialValues.startDate).length)
        .toEqual(service.weekCount);
      for (let i = 0; i < service.weekCount; i++) {
        expect(buildSpy).toHaveBeenNthCalledWith(
          i + 1,
          _mockCalendarInitialValues,
          _mockCalendarInitialValues.startDate,
          i
        );
      }
    });

    test('should build the week array', (): void => {
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      service.buildCalendar = jest.fn()
        .mockReturnValue(_mockCalendarDate);
      const buildSpy: jest.SpyInstance = jest.spyOn(service, 'buildCalendarDate');
      const _mockCalendarInitialValues: CalendarInitialValues = mockCalendarInitialValues();

      expect(service.buildWeekArray(_mockCalendarInitialValues, _mockCalendarInitialValues.displayDate, 2).length)
        .toEqual(service.weekLength);
      expect(buildSpy).toHaveBeenCalledTimes(service.weekLength);
      const start: number = (
        _mockCalendarInitialValues.displayDate.date()
        + (_mockCalendarInitialValues.displayDate.date(service.weekLength * 2)).date()
      );
      for (let i = 0; i < service.weekLength; i++) {
        expect(buildSpy.mock.calls[i][1].date()).toEqual(start + i);
      }
    });

    test('should get first date for calendar matrix', (): void => {
      const _mockCalendarInitialValues: CalendarInitialValues = mockCalendarInitialValues();

      expect(service.getFirstDateForCalendarMatrix(_mockCalendarInitialValues, 0).isSame('2019-12-25'))
        .toBe(true);
      expect(service.getFirstDateForCalendarMatrix(_mockCalendarInitialValues, 5).isSame('2019-12-27'))
        .toBe(true);
    });

    test('should get first weekday for calendar matrix', (): void => {
      const _mockCalendarInitialValues: CalendarInitialValues = mockCalendarInitialValues();

      expect(service.getFirstDayOfWeekInDisplayedMonth(_mockCalendarInitialValues)).toEqual(3);
    });

  });


  describe('Other', (): void => {

    test('should check if a calendar step has been started', (): void => {
      const _mockBatch: Batch = mockBatch();
      const calendarIndex: number = 13;
      _mockBatch.process.currentStep = calendarIndex;

      expect(service.hasCalendarStarted(_mockBatch)).toBe(false);
      _mockBatch.process.schedule[calendarIndex]['startDatetime'] = (new Date()).toISOString();
      expect(service.hasCalendarStarted(_mockBatch)).toBe(true);
      _mockBatch.process.currentStep = _mockBatch.process.schedule.length;
      expect(service.hasCalendarStarted(_mockBatch)).toBe(false);
    });

    test('should check if dates are the same month and year', (): void => {
      const date1: moment.Moment = moment('2020-01-01');
      const date2: moment.Moment = moment('2019-01-01');
      const date3: moment.Moment = moment('2020-02-01');
      const date4: moment.Moment = moment('2020-01-05');

      expect(service.isMonth(date1, date2)).toBe(false);
      expect(service.isMonth(date1, date3)).toBe(false);
      expect(service.isMonth(date1, date4)).toBe(true);
    });

    test('should check if given date is in the projected dates array', (): void => {
      const targetDate: moment.Moment = moment('2020-02-02');
      const notFoundDate: moment.Moment = moment('2019-06-06');
      const _mockCalendarDate: CalendarDate = mockCalendarDate();
      const _mockCalendarDateFound: CalendarDate = mockCalendarDate();
      _mockCalendarDate.mDate = targetDate;
      const projectedDates: CalendarDate[] = [ _mockCalendarDate, _mockCalendarDateFound ];

      expect(service.isProjected(projectedDates, targetDate)).toBe(true);
      expect(service.isProjected(projectedDates, notFoundDate)).toBe(false);
    });

    test('should check if given date matches a given start date', (): void => {
      const startDate: moment.Moment = moment('2020-01-01');
      const trueDate: moment.Moment = moment('2020-01-01');
      const falseDate: moment.Moment = moment('2019-01-01');

      expect(service.isStart(startDate, trueDate)).toBe(true);
      expect(service.isStart(startDate, falseDate)).toBe(false);
    });

    test('should check if given date is today\'s date', (): void => {
      const now: moment.Moment = moment();
      const notNow: moment.Moment = moment('2019-01-01');

      expect(service.isToday(now)).toBe(true);
      expect(service.isToday(notNow)).toBe(false);
    });

    test('should start a calendar', (done: jest.DoneCallback): void => {
      service.processService.updateCalendarStep = jest.fn()
        .mockReturnValue(of(null));
      const updateSpy: jest.SpyInstance = jest.spyOn(service.processService, 'updateCalendarStep');
      service.idService.getId = jest.fn()
        .mockReturnValue('1');
      const getSpy: jest.SpyInstance = jest.spyOn(service.idService, 'getId');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const _mockBatch: Batch = mockBatch();
      const _mockCalendarMetadata: CalendarMetadata = mockCalendarMetadata();

      service.startCalendar(_mockBatch, _mockCalendarMetadata);

      setTimeout((): void => {
        expect(updateSpy).toHaveBeenCalledWith('1', _mockCalendarMetadata);
        expect(getSpy).toHaveBeenCalledWith(_mockBatch);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Started calendar');
        done();
      }, 10);
    });

    test('should handle error on calendar start', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.processService.updateCalendarStep = jest.fn()
        .mockReturnValue(throwError(_mockError));
      service.errorReporter.handleUnhandledError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.startCalendar(null, null);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });

});
