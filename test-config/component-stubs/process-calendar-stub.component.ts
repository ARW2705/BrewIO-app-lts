/* Module imports */
import { Component, Input, OnChanges } from '@angular/core';

/* Mock imports */
import { CalendarComponentStub } from './calendar-stub.component';

/* Interface imports */
import { Alert } from '../../src/app/shared/interfaces/alert';
import { Process } from '../../src/app/shared/interfaces/process';

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
  @Input() stepData: Process;
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
