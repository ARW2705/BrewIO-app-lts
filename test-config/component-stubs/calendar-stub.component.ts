/* Module imports */
import { Component, Input, OnChanges, OnInit } from '@angular/core';

/* Mock imports */
import { CalendarServiceStub, IdServiceStub } from '../service-stubs';

/* Interface imports */
import { CalendarDate, CalendarProcess } from '../../src/app/shared/interfaces';

/* Service imports */
import { CalendarService, IdService } from '../../src/app/services/services';

/* Component imports */
import { CalendarComponent } from '../../src/app/components/calendar/calendar.component';

@Component({
  selector: 'calendar',
  template: '',
  providers: [
    { provide: CalendarComponent, useClass: CalendarComponentStub },
    { provide: CalendarService, useClass: CalendarServiceStub },
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

  constructor(
    public calendarService: CalendarService,
    public idService: IdService
  ) {}

  ngOnInit() {}
  ngOnChanges(): any {}
  addToProjectedDates(...options: any): any {}
  buildCalendar(): any {}
  changeMonth(...options: any): any {}
  containsProjectedDate(...options: any): any {}
  getSelectedCalendarData(): any {}
  handleDateButtonClick(...options: any): any {}
  initCalendar(): any {}
  isMonth(...options: any[]): any {}
  mapProjectedDatesToAlerts(): any {}
  removeFromProjectedDates(...options: any): any {}
  resetProjectedDates(): any {}
  selectStartDate(...options: any[]): any {}
  setInitialProjectedDate(): any {}
  setInitialStartDate(): void {}
  toggleEdit(...options: any[]): any {}
  toggleProjectedDate(...options: any[]): any {}
  updateView(...options: any): any {}
  updateViewDay(...options: any): any {}
}
