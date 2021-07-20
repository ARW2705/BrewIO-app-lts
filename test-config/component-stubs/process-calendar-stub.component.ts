/* Module imports */
import { Component, Input, OnChanges } from '@angular/core';

/* Mock imports */
import { CalendarComponentStub } from './calendar-stub.component';

/* Interface imports */
import { Alert, CalendarProcess } from '../../src/app/shared/interfaces';

/* Component imports */
import { ProcessCalendarComponent } from '../../src/app/components/process-calendar/process-calendar.component';


@Component({
  selector: 'process-calendar',
  template: '',
  providers: [
    { provide: ProcessCalendarComponent, useClass: ProcessCalendarComponentStub }
  ]
})
export class ProcessCalendarComponentStub implements OnChanges {
  @Input() alerts: Alert[];
  @Input() isPreview: boolean;
  @Input() stepData: CalendarProcess;
  calendarRef: CalendarComponentStub;
  closestAlert: Alert = null;
  currentStepCalendarData: object = {};
  showDescription: boolean = false;
  event: any;

  constructor() {}

  ngOnChanges() {}
  changeDate() {}
  getClosestAlertByGroup(): any {}
  startCalendar(): any {}
  toggleShowDescription() {}
}
