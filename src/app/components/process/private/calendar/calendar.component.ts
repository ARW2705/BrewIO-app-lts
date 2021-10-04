/* Module imports */
import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

/* Interface imports */
import { Alert, CalendarDate, CalendarMetadata, CalendarProcess } from '../../../../shared/interfaces';

/* Service imports */
import { CalendarService, IdService } from '../../../../services/services';


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

  constructor(
    public calendarService: CalendarService,
    public idService: IdService
  ) {}

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

  /**
   * Mark calendar date as a projected date and add to projected dates array;
   * Projected dates cannot be the start date or before current date
   *
   * @param: date - the CalendarDate to set as projected
   * @return: none
   */
  addToProjectedDates(date: CalendarDate): void {
    date.isProjected = true;
    date.isStart = false;
    this.projectedDates.push(date);
  }

  /**
   * Construct calendar matrix
   *
   * @param: none
   * @return: none
   */
  buildCalendar(): void {
    this.month = this.calendarService.buildCalendar({
      displayDate: this.displayDate,
      projectedDates: this.projectedDates,
      startDate: this.startDate.mDate
    });
  }

  /**
   * Change the month to be displayed
   *
   * @param: isForward - true to advance month; false to go back
   * @return: none
   */
  changeMonth(isForward: boolean): void {
    this.displayDate = isForward
      ? moment(this.displayDate).add(1, 'months')
      : moment(this.displayDate).subtract(1, 'months');
    this.buildCalendar();
    this.updateView();
  }

  /**
   * Check if given date is present in projected dates array matching by 'day'
   *
   * @param: date - moment date to search for
   * @return: true if date is present in projected dates
   */
  containsProjectedDate(date: moment.Moment): boolean {
    return this.calendarService.isProjected(this.projectedDates, date);
  }

  /**
   * Get current calendar selections data
   *
   * @param: none
   * @return: calendar metadata
   */
  getSelectedCalendarData(): CalendarMetadata {
    return {
      id: this.idService.getId(this.calendarProcess),
      startDatetime: this.startDate.mDate.toISOString(),
      alerts: this.mapProjectedDatesToAlerts()
    };
  }

  /**
   * Handle date button click event
   *
   * @param: date - calendar date of the button that was clicked
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
    this.resetProjectedDates();
    this.buildCalendar();
  }

  /**
   * Check if given date is the same month and year as display date
   *
   * @param: date - a moment date to compare
   * @return: true if given date matches both month and year of display date
   */
  isMonth(date: moment.Moment): boolean {
    return this.calendarService.isMonth(this.displayDate, date);
  }

  /**
   * Convert the array of projected dates into an array of alerts
   *
   * @param: none
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
   * Remove a calendar date from projected dates and clear projected flag from date
   *
   * @param: date - the calendar date to update
   * @param: projectedIndex - the index to remove from projected dates array
   * @return: none
   */
  removeFromProjectedDates(date: CalendarDate, projectedIndex: number): void {
    date.isProjected = false;
    this.projectedDates.splice(projectedIndex, 1);
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
   * @return: none
   */
  toggleProjectedDate(date: CalendarDate): void {
    console.log('date', date, this.startDate);
    if (!date.mDate.isSameOrBefore(this.startDate.mDate, 'day')) {
      const index: number = this.projectedDates.findIndex((pDate: CalendarDate): boolean => {
        return moment(pDate.mDate).isSame(date.mDate, 'day');
      });
      if (index === -1) {
        this.addToProjectedDates(date);
      } else {
        this.removeFromProjectedDates(date, index);
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
      week.forEach((day: CalendarDate): void => this.updateViewDay(day));
    });
  }

  /**
   * Set a give calendar day's state
   *
   * @param: day - a CalendarDate to update
   * @return: none
   */
  updateViewDay(day: CalendarDate): void {
    day.isMonth = this.isMonth(day.mDate);
    day.isStart = moment(day.mDate).isSame(this.startDate.mDate, 'day');
    day.isProjected = this.containsProjectedDate(day.mDate);
  }

}
