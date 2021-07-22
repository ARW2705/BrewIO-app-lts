/* Module imports */
import { Component, Input, OnChanges, OnInit } from '@angular/core';

/* Mock imports */
import { IdServiceStub } from '../service-stubs';

/* Interface imports */
import { CalendarDate } from '../../src/app/shared/interfaces';

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

  constructor(public idService: IdService) {}

  ngOnInit() {}
  ngOnChanges() {}
  addToProjectedDates() {}
  changeMonthYear() {}
  fillDates(...options: any[]): any {}
  getFinal(): any {}
  initCalendar(): any {}
  isMonth(...options: any[]): any {}
  isProjected(...options: any[]): any {}
  isStart(...options: any[]): any {}
  isToday(...options: any[]): any {}
  populateCalendar(): any {}
  resetProjectedDates(): any {}
  selectStartDate(...options: any[]): any {}
  toggleEdit(...options: any[]): any {}
  toggleProjectedDate(...options: any[]): any {}
  updateView(): any {}
}
