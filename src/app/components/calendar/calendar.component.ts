/* Module imports */
import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

/* Utility imports */
import { getId } from '../../shared/utility-functions/id-helpers';

/* Interface imports */
import { Alert, CalendarDate } from '../../shared/interfaces';


@Component({
  selector: 'calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnChanges {
  @Input() stepData: object;
  currentDate: moment.Moment = null;
  displayDate: moment.Moment = null;
  editType: string = '';
  isProjectedSelection: boolean = false;
  month: CalendarDate[][] = [];
  projectedDates: CalendarDate[] = [];
  refreshChildInputs: boolean = false;
  selectedDay: CalendarDate = null;
  startDate: CalendarDate = null;
  weekdays: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  constructor() {
    this.currentDate = moment();
    this.displayDate = this.currentDate;
  }

  /***** Lifecycle Hooks *** */

  ngOnInit(): void {
    console.log('calendar component init');
    this.initCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('calendar component changes', changes);
    const change: SimpleChange = changes.stepData;

    if (
      change.previousValue !== undefined
      && (getId(change.currentValue) !== getId(change.previousValue))
    ) {
      this.stepData = change.currentValue;
      this.initCalendar();
    }
  }

  /***** End Lifecycle hooks *** */


  /**
   * Mark calendar date as a projected date and add to projected dates array;
   * Projected dates cannot be the start date or before current date
   *
   * @params: date - a calendar date to use as projected date
   *
   * @return: none
   */
  addToProjectedDates(date: CalendarDate): void {
    date.isProjected = true;
    date.isStart = false;
    this.projectedDates.push(date);
  }

  /**
   * Change the month or year to be displayed
   *
   * @params: direction - either 'next' or 'prev'
   * @params: timeframe - either 'month' or 'year'
   *
   * @return: none
   */
  changeMonthYear(direction: string, timeframe: string): void {
    this.displayDate = direction === 'next'
      ? moment(this.displayDate)
        .add(1, <moment.unitOfTime.DurationConstructor>timeframe)
      : moment(this.displayDate)
        .subtract(1, <moment.unitOfTime.DurationConstructor>timeframe);
    this.populateCalendar();
    this.updateView();
  }

  /**
   * Generate the calendar as a 6 x 7 grid containing the days of the current
   * month and filling out the remaining grid positions with days of the
   * previous month on the top row and days of the next month on the bottom row
   *
   * @params: currentMoment - current datetime
   *
   * @return: array of 42 Calendar dates
   */
  fillDates(currentMoment: moment.Moment): CalendarDate[] {
    const firstOfMonth: number = moment(currentMoment)
      .startOf('month')
      .day();

    const firstOfGrid: moment.Moment = moment(currentMoment)
      .startOf('month')
      .subtract(firstOfMonth, 'days');

    const start: number = firstOfGrid.date();

    const populatedCalendar: CalendarDate[] = [];

    for (let i: number = start; i < start + 42; i++) {
      const _date: moment.Moment = moment(firstOfGrid).date(i);
      populatedCalendar.push({
        isToday: this.isToday(_date),
        isStart: this.isStart(_date),
        isProjected: this.isProjected(_date),
        mDate: _date
      });
    }

    return populatedCalendar;
  }

  /**
   * Get current calendar data
   *
   * @params: none
   *
   * @return: object with step id, start datetime, and any alerts
   */
  getFinal(): { _id: string, startDatetime: string, alerts: Alert[] } {
    return {
      _id: getId(this.stepData),
      startDatetime: this.startDate.mDate.toISOString(),
      alerts: this.projectedDates
        .map((date: CalendarDate): Alert => {
          return {
            title: this.stepData['title'],
            description: '',
            datetime: date.mDate.toISOString()
          };
        })
    };
  }

  /**
   * Initialize calendar with two dates preselected - today's date,
   * and the end date based on the step's duration field
   *
   * @params: none
   * @return: none
   */
  initCalendar(): void {
    const today: CalendarDate = {
      mDate: this.currentDate,
      isStart: true,
      isProjected: false,
      isToday: true,
    };

    const end: CalendarDate = {
      mDate: this.currentDate.clone().add(this.stepData['duration'], 'days'),
      isStart: false,
      isProjected: true,
      isToday: false
    };

    this.startDate = today;

    this.populateCalendar();
    this.addToProjectedDates(end);
    this.selectStartDate(today);
  }

  /**
   * Check if given date and current date have the same month and year
   *
   * @params: date - datetime to compare
   *
   * @return: true if given datetime is the same month as current
   */
  isMonth(date: moment.Moment): boolean {
    return moment(this.displayDate).isSame(date, 'years')
      && moment(this.displayDate).isSame(date, 'months');
  }

  /**
   * Check if given date is the same day as a date in the projectedDates array
   *
   * @params: date - datetime to compare
   *
   * @return: true if given datetime is a projected date
   */
  isProjected(date: moment.Moment): boolean {
    return this.projectedDates
      .some((projectedDate: CalendarDate): boolean => {
        return moment(date).isSame(projectedDate.mDate, 'day');
      });
  }

  /**
   * Check if given date is the same day as start date
   *
   * @params: date - datetime to compare
   *
   * @return: true if given datetime is the same as the start date
   */
  isStart(date: moment.Moment): boolean {
    return moment(date).isSame(this.startDate.mDate, 'day');
  }

  /**
   * Check if given date is the same day as today
   *
   * @params: date - datetime to compare
   *
   * @return: true if given datetime is the same as current day
   */
  isToday(date: moment.Moment): boolean {
    return moment().isSame(moment(date), 'day');
  }

  /**
   * Assemble 6 x 7 calendar display
   *
   * @params: none
   * @return: none
   */
  populateCalendar(): void {
    const dates: CalendarDate[] = this.fillDates(this.displayDate);
    const month: CalendarDate[][] = [];
    for (let i = 0; i < 42; i += 7) {
      month.push(dates.slice(i, i + 7));
    }
    this.month = month;
  }

  /**
   * Clear projectedDates array and re-populate with date from stepData duration
   *
   * @params: none
   * @return: none
   */
  resetProjectedDates(): void {
    this.projectedDates = [];

    this.addToProjectedDates({
      mDate: this.startDate.mDate.clone().add(this.stepData['duration'], 'days'),
      isStart: false,
      isProjected: true,
      isToday: false
    });
  }

  /**
   * Set given date as start date as long as it is not in the past
   *
   * @params: date - datetime to set as start
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
   * Toggle editing state
   *
   * @params: edit - either 'start' or 'alerts' for editing, or '' for not editing
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
   * @params: date - datetime to toggle state
   *
   * @return: none
   */
  toggleProjectedDate(date: CalendarDate): void {
    if (!date.mDate.isSameOrBefore(this.startDate.mDate, 'day')) {
      const index: number = this.projectedDates
        .findIndex((pDate: CalendarDate): boolean => {
          return moment(pDate.mDate).isSame(date.mDate);
        });

      if (index === -1) {
        // add date
        date.isProjected = true;
        date.isStart = false;
        this.projectedDates.push(date);
      } else {
        // remove date
        date.isProjected = false;
        this.projectedDates.splice(index, 1);
      }
    }
  }

  /**
   * Update calendar view data and assign start/projected date states
   *
   * @params: none
   * @return: none
   */
  updateView(): void {
    this.month.forEach(
      (week: CalendarDate[]): void => {
        week.forEach(
          (day: CalendarDate): void => {
            day.isMonth = this.isMonth(day.mDate);

            // set isStart status
            if (moment(day.mDate).isSame(this.startDate.mDate, 'day')) {
              day.isStart = true;
              day.isProjected = false;
            } else {
              day.isStart = false;
            }

            // set isProjected status
            if (this.isProjected(day.mDate)) {
              day.isStart = false;
              day.isProjected = true;
            } else {
              day.isProjected = false;
            }
          }
        );
      }
    );
  }

}
