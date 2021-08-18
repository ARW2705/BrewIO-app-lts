/* Module imports */
import { Component, Input, OnChanges, OnInit } from '@angular/core';

/* Mock imports */
import { IdServiceStub } from '../service-stubs';

/* Interface imports */
import { CalendarDate, CalendarProcess } from '../../src/app/shared/interfaces';

/* Service imports */
import { IdService } from '../../src/app/services/services';

/* Component imports */
import { CalendarComponent } from '../../src/app/components/calendar/calendar.component';

@Component({
  selector: 'calendar',
  template: '',
  providers: [
    { provide: CalendarComponent, useClass: CalendarComponentStub },
    { provide: IdService, useClass: IdServiceStub }
  ]
})
export class CalendarComponentStub implements OnInit, OnChanges {
  @Input() calendarProcess: CalendarProcess;
  currentDate: moment.Moment = null;
  displayDate: moment.Moment = null;
  editType: string = '';
  month: CalendarDate[][] = [];
  projectedDates: CalendarDate[] = [];
  startDate: CalendarDate = null;
  weekCount: number = 6;
  weekLength: number = 7;

  constructor(public idService: IdService) {}

  ngOnInit() {}
  ngOnChanges(): any {}
  buildCalendar(): any {}
  buildCalendarDate(): any {}
  buildMonthMatrix(): any {}
  buildWeekArray(): any {}
  addToProjectedDates(): any {}
  changeMonth(): any {}
  getFinal(): any {}
  getFirstDateForCalendarMatrix(): any {}
  getFirstDayOfWeekInDisplayedMonth(): any {}
  handleDateButtonClick(): any {}
  initCalendar(): any {}
  isMonth(...options: any[]): any {}
  isProjected(...options: any[]): any {}
  isStart(...options: any[]): any {}
  isToday(...options: any[]): any {}
  mapProjectedDatesToAlerts(): any {}
  removeProjectedDateByIndex(): any {}
  resetProjectedDates(): any {}
  selectStartDate(...options: any[]): any {}
  setInitialProjectedDate(): any {}
  setInitialDates(): any {}
  toggleEdit(...options: any[]): any {}
  toggleProjectedDate(...options: any[]): any {}
  updateView(): any {}
}
