/* Module imports */
import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

/* Interface imports */
import { Alert, CalendarDate, CalendarMetadata, CalendarProcess } from '../../shared/interfaces';

/* Service imports */
import { IdService } from '../../services/services';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnChanges {
  @Input() calendarProcess: CalendarProcess;
  currentDate: moment.Moment = moment();
  displayDate: moment.Moment = this.currentDate;
  editType: string = '';
  month: CalendarDate[][] = [];
  projectedDates: CalendarDate[] = [];
  startDate: CalendarDate = null;
  weekCount: number = 6;
  weekLength: number = 7;

  constructor(public idService: IdService) {}

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    console.log('calendar component init');
    this.initCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('calendar component changes', changes);
    const change: SimpleChange = changes.calendarProcess;
    if (
      change.previousValue !== undefined
      && this.idService.getId(change.currentValue) !== this.idService.getId(change.previousValue)
    ) {
      this.calendarProcess = change.currentValue;
      this.initCalendar();
    }
  }

  /***** End Lifecycle hooks *****/


  /***** Calendar Display Construction *****/

  /**
   * Build the 6 x 7 calendar date matrix
   *
   * @param: none
   * @return: none
   */
  buildCalendar(): void {
    const firstWeekDayOfDisplayMonth: number = this.getFirstDayOfWeekInDisplayedMonth();
    const firstDateOfMatrix: moment.Moment = this.getFirstDateForCalendarMatrix(firstWeekDayOfDisplayMonth);
    this.month = this.buildMonthMatrix(firstDateOfMatrix);
  }

  /**
   * Build a new CalendarDate from a provided Moment
   *
   * @param: date - a momentjs date object
   *
   * @return: a new CalendarDate
   */
  buildCalendarDate(date: moment.Moment): CalendarDate {
    return {
      isMonth: this.isMonth(date),
      isProjected: this.isProjected(date),
      isStart: this.isStart(date),
      isToday: this.isToday(date),
      mDate: date
    };
  }

  /**
   * Build a 6 x 7 matrix of CalendarDates
   *
   * @param: firstDateOfMatrix - the first date of matrix (row 0, col 0)
   *
   * @return: calendar matrix of dates
   */
  buildMonthMatrix(firstDateOfMatrix: moment.Moment): CalendarDate[][] {
    return [...Array(this.weekCount).keys()].map((weekIndex: number): CalendarDate[] => {
      return this.buildWeekArray(firstDateOfMatrix, weekIndex);
    });
  }

  /**
   * Build an array of CalendarDates for a single calendar week (Sunday - Saturday)
   *
   * @param: firstDateOfMatrix - the original first date of the calendar matrix
   * @param: weekIndex - the current week row to be built
   *
   * @return: an array of CalendarDates for a calendar week
   */
  buildWeekArray(firstDateOfMatrix: moment.Moment, weekIndex: number): CalendarDate[] {
    const startIndex: number = firstDateOfMatrix.date();
    return [...Array(this.weekLength).keys()].map((dayIndex: number): CalendarDate => {
      const dateIndex: number = startIndex + weekIndex * this.weekLength + dayIndex;
      const date: moment.Moment = moment(firstDateOfMatrix).date(dateIndex);
      return this.buildCalendarDate(date);
    });
  }

  /***** End Calendar Display Construction *****/


  /**
   * Mark calendar date as a projected date and add to projected dates array;
   * Projected dates cannot be the start date or before current date
   *
   * @param: date - the CalendarDate to set as projected
   *
   * @return: none
   */
  addToProjectedDates(date: CalendarDate): void {
    date.isProjected = true;
    date.isStart = false;
    this.projectedDates.push(date);
  }

  /**
   * Change the month to be displayed
   *
   * @param: direction - either 'next' or 'prev'
   *
   * @return: none
   */
  changeMonth(direction: string): void {
    this.displayDate = direction === 'next'
      ? moment(this.displayDate).add(1, 'months')
      : moment(this.displayDate).subtract(1, 'months');
    this.buildCalendar();
    this.updateView();
  }

  /**
   * Get current calendar selections data
   *
   * @param: none
   *
   * @return: calendar metadata
   */
  getFinal(): CalendarMetadata {
    return {
      id: this.idService.getId(this.calendarProcess),
      startDatetime: this.startDate.mDate.toISOString(),
      alerts: this.mapProjectedDatesToAlerts()
    };
  }

  /**
   * Get the momentjs date that will be the first date of the calendar
   *
   * @param: backDateOffset - number of days to count back from the first day
   * of the display Date to the first day to display in the calendar view
   *
   * @return: the first momentjs date to be displayed in the calendar
   */
  getFirstDateForCalendarMatrix(backDateOffset: number): moment.Moment {
    const subtractDaysBy: number = backDateOffset === 0 ? this.weekLength : backDateOffset;
    return moment(this.displayDate).startOf('month').subtract(subtractDaysBy, 'days');
  }

  /**
   * Get the first weekday of the selected month
   *
   * @param: none
   *
   * @return: the first weekday index of the selected month (sun - 0, sat - 6)
   */
  getFirstDayOfWeekInDisplayedMonth(): number {
    return moment(this.displayDate).startOf('month').day();
  }

  /**
   * Handle date button click event
   *
   * @param: date - calendar date of the button that was clicked
   *
   * @return: none
   */
  handleDateButtonClick(date: CalendarDate): void {
    if (this.editType === 'start') {
      this.selectStartDate(date);
    } else if (this.editType === 'alerts') {
      this.toggleProjectedDate(date);
    }
  }

  /**
   * Initialize calendar with today's date selected as the start date
   * and a projected date based on the calendar process's duration field
   *
   * @param: none
   * @return: none
   */
  initCalendar(): void {
    this.setInitialStartDate();
    this.setInitialProjectedDate();
    this.buildCalendar();
  }

  /**
   * Check if given date and current date have the same month and year
   *
   * @param: date - datetime to compare
   *
   * @return: true if given datetime is the same month as current
   */
  isMonth(date: moment.Moment): boolean {
    return this.displayDate.isSame(date, 'years') && this.displayDate.isSame(date, 'months');
  }

  /**
   * Check if given date is the same day as a date in the projectedDates array
   *
   * @param: date - datetime to compare
   *
   * @return: true if given datetime is a projected date
   */
  isProjected(date: moment.Moment): boolean {
    return this.projectedDates.some((projectedDate: CalendarDate): boolean => {
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
  isStart(date: moment.Moment): boolean {
    return date.isSame(this.startDate.mDate, 'day');
  }

  /**
   * Check if given date is the same day as today
   *
   * @param: date - datetime to compare
   *
   * @return: true if given datetime is the same as current day
   */
  isToday(date: moment.Moment): boolean {
    return this.currentDate.isSame(date, 'day');
  }

  /**
   * Convert the array of projected dates into an array of alerts
   *
   * @param: none
   *
   * @return: array of Alerts
   */
  mapProjectedDatesToAlerts(): Alert[] {
    return this.projectedDates.map((date: CalendarDate): Alert => {
      return {
        title: this.calendarProcess.name,
        description: '',
        datetime: date.mDate.toISOString()
      };
    });
  }

  /**
   * Remove a projected date from projectedDates array by index
   *
   * @param: index - the index to remove
   *
   * @return: none
   */
  removeProjectedDateByIndex(index: number): void {
    this.projectedDates[index].isProjected = false;
    this.projectedDates.splice(index, 1);
  }

  /**
   * Clear projectedDates array and reset initial projected date
   *
   * @param: none
   * @return: none
   */
  resetProjectedDates(): void {
    this.projectedDates = [];
    this.setInitialProjectedDate();
  }

  /**
   * Set given date as start date as long as it is not in the past
   *
   * @param: date - datetime to set as start
   *
   * @return: none
   */
  selectStartDate(date: CalendarDate): void {
    if (!moment(date.mDate).isBefore(this.currentDate, 'day')) {
      this.startDate = date;
      this.resetProjectedDates();
      this.updateView();
    }
  }

  /**
   * Select the initial projected date as the date n days
   * from the current date where n is the process duration
   *
   * @param: none
   * @return: none
   */
  setInitialProjectedDate(): void {
    this.addToProjectedDates({
      mDate: this.startDate.mDate.clone().add(this.calendarProcess.duration, 'days'),
      isStart: false,
      isProjected: true,
      isToday: false
    });
  }

  /**
   * Select the initial start date as today's date
   *
   * @param: none
   * @return: none
   */
  setInitialStartDate(): void {
    const today: CalendarDate = {
      mDate: this.currentDate,
      isStart: true,
      isProjected: false,
      isToday: true,
    };
    this.startDate = today;
    this.selectStartDate(today);
  }

  /**
   * Toggle editing state
   *
   * @param: edit - either 'start' or 'alerts' for editing, or '' for not editing
   *
   * @return: none
   */
  toggleEdit(edit: string): void {
    this.editType = this.editType === edit ? '' : edit;
  }

  /**
   * Toggle the selected state of projected date; if date in projectedDates
   * array, remove it; otherwise add date to array; date may not be the same
   * or before start date
   *
   * @param: date - datetime to toggle state
   *
   * @return: none
   */
  toggleProjectedDate(date: CalendarDate): void {
    if (!date.mDate.isSameOrBefore(this.startDate.mDate, 'day')) {
      const index: number = this.projectedDates.findIndex((pDate: CalendarDate): boolean => {
        return moment(pDate.mDate).isSame(date.mDate);
      });
      if (index === -1) {
        this.addToProjectedDates(date);
      } else {
        this.removeProjectedDateByIndex(index);
      }
    }
  }

  /**
   * Update calendar view data and assign start/projected date states
   *
   * @param: none
   * @return: none
   */
  updateView(): void {
    this.month.forEach((week: CalendarDate[]): void => {
      week.forEach((day: CalendarDate): void => {
        day.isMonth = this.isMonth(day.mDate);
        day.isStart = moment(day.mDate).isSame(this.startDate.mDate, 'day');
        day.isProjected = this.isProjected(day.mDate);
      });
    });
  }

}
