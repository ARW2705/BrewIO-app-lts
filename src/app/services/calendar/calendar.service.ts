/* Module imports */
import { Injectable } from '@angular/core';
import * as moment from 'moment';

/* Interface imports */
import { Batch, BatchProcess, CalendarDate, CalendarInitialValues, CalendarMetadata } from '@shared/interfaces';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { IdService } from '@services/id/id.service';
import { ProcessService } from '@services/process/process.service';


@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  weekCount: number = 6;
  weekLength: number = 7;

  constructor(
    public errorReporter: ErrorReportingService,
    public idService: IdService,
    public processService: ProcessService
  ) { }

  /***** Calendar Display Construction *****/

  /**
   * Build the 6 x 7 calendar date matrix
   *
   * @param: initialValues - object containing start date, display date, and projected dates
   * @return: none
   */
  buildCalendar(initialValues: CalendarInitialValues): CalendarDate[][] {
    const firstWeekDayOfDisplayMonth: number = this.getFirstDayOfWeekInDisplayedMonth(initialValues);
    const firstDateOfMatrix: moment.Moment = this.getFirstDateForCalendarMatrix(
      initialValues,
      firstWeekDayOfDisplayMonth
    );
    return this.buildMonthMatrix(initialValues, firstDateOfMatrix);
  }

  /**
   * Build a new CalendarDate from a provided Moment
   *
   * @param: initialValues - object containing start date, display date, and projected dates
   * @param: date - a momentjs date object
   * @return: a new CalendarDate
   */
  buildCalendarDate(initialValues: CalendarInitialValues, date: moment.Moment): CalendarDate {
    return {
      isMonth: this.isMonth(initialValues.displayDate, date),
      isProjected: this.isProjected(initialValues.projectedDates, date),
      isStart: this.isStart(initialValues.startDate, date),
      isToday: this.isToday(date),
      mDate: date
    };
  }

  /**
   * Build a 6 x 7 matrix of CalendarDates
   *
   * @param: initialValues - object containing start date, display date, and projected dates
   * @param: firstDateOfMatrix - the first date of matrix (row 0, col 0)
   * @return: calendar matrix of dates
   */
  buildMonthMatrix(
    initialValues: CalendarInitialValues,
    firstDateOfMatrix: moment.Moment
  ): CalendarDate[][] {
    return [...Array(this.weekCount).keys()].map((weekIndex: number): CalendarDate[] => {
      return this.buildWeekArray(initialValues, firstDateOfMatrix, weekIndex);
    });
  }

  /**
   * Build an array of CalendarDates for a single calendar week (Sunday - Saturday)
   *
   * @param: firstDateOfMatrix - the original first date of the calendar matrix
   * @param: weekIndex - the current week row to be built
   * @return: an array of CalendarDates for a calendar week
   */
  buildWeekArray(
    initialValues: CalendarInitialValues,
    firstDateOfMatrix: moment.Moment,
    weekIndex: number
  ): CalendarDate[] {
    const startIndex: number = firstDateOfMatrix.date();
    return [...Array(this.weekLength).keys()].map((dayIndex: number): CalendarDate => {
      const dateIndex: number = startIndex + weekIndex * this.weekLength + dayIndex;
      const date: moment.Moment = moment(firstDateOfMatrix).date(dateIndex);
      return this.buildCalendarDate(initialValues, date);
    });
  }

  /**
   * Get the momentjs date that will be the first date of the calendar
   *
   * @param: backDateOffset - number of days to count back from the first day
   * of the display Date to the first day to display in the calendar view
   *
   * @return: the first momentjs date to be displayed in the calendar
   */
  getFirstDateForCalendarMatrix(
    initialValues: CalendarInitialValues,
    backDateOffset: number
  ): moment.Moment {
    const subtractDaysBy: number = backDateOffset === 0 ? this.weekLength : backDateOffset;
    return moment(initialValues.displayDate).startOf('month').subtract(subtractDaysBy, 'days');
  }

  /**
   * Get the first weekday of the selected month
   *
   * @param: none
   *
   * @return: the first weekday index of the selected month (sun - 0, sat - 6)
   */
  getFirstDayOfWeekInDisplayedMonth(initialValues: CalendarInitialValues): number {
    return moment(initialValues.displayDate).startOf('month').day();
  }

  /***** End Calendar Display Construction *****/

  /**
   * Check if the current calendar is in progress; A calendar is
   * considered in progress if the step has a startDatetime property
   *
   * @params: batch - batch in which to check if calendar has been started
   *
   * @return: true if current step has a startDatetime property
   */
  hasCalendarStarted(batch: Batch): boolean {
    const process: BatchProcess = batch.process;
    return (
      process.currentStep < process.schedule.length
      && process.schedule[batch.process.currentStep].hasOwnProperty('startDatetime')
    );
  }

  /**
   * Check if given date and current date have the same month and year
   *
   * @param: date - datetime to compare
   *
   * @return: true if given datetime is the same month as current
   */
  isMonth(date1: moment.Moment, date2: moment.Moment): boolean {
    return date1.isSame(date2, 'years') && date1.isSame(date2, 'months');
  }

  /**
   * Check if given date is the same day as a date in the projectedDates array
   *
   * @param: date - datetime to compare
   *
   * @return: true if given datetime is a projected date
   */
  isProjected(projectedDates: CalendarDate[], date: moment.Moment): boolean {
    return projectedDates.some((projectedDate: CalendarDate): boolean => {
      return date.isSame(projectedDate.mDate, 'day');
    });
  }

  /**
   * Check if given date is the same day as start date
   *
   * @param: date - datetime to compare
   *
   * @return: true if given datetime is the same as the start date
   */
  isStart(startDate: moment.Moment, date: moment.Moment): boolean {
    return date.isSame(startDate, 'day');
  }

  /**
   * Check if given date is the same day as today
   *
   * @param: date - datetime to compare
   *
   * @return: true if given datetime is the same as current day
   */
  isToday(date: moment.Moment): boolean {
    return moment().isSame(date, 'day');
  }

  /**
   * Set the start of a calendar step
   *
   * @param: batch - the parent batch to which the calendar belongs
   * @param: values - calendar component data
   *
   * @return: none
   */
  startCalendar(batch: Batch, values: CalendarMetadata): void {
    this.processService.updateCalendarStep(this.idService.getId(batch), values)
      .subscribe(
        (): void => console.log('Started calendar'),
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }
}
