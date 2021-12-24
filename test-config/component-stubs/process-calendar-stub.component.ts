/* Module imports */
import { Component, Input, OnChanges } from '@angular/core';

/* Mock imports */
import { CalendarComponentStub } from './calendar-stub.component';
import { IdServiceStub } from '../service-stubs';

/* Interface imports */
import { Alert, CalendarProcess } from '../../src/app/shared/interfaces';

/* Service imports */
import { IdService } from '../../src/app/services/public';

/* Component imports */
import { ProcessCalendarComponent } from '../../src/app/components/process/public/process-calendar/process-calendar.component';


@Component({
  selector: 'process-calendar',
  template: '',
  providers: [
    { provide: ProcessCalendarComponent, useClass: ProcessCalendarComponentStub },
    { provide: IdService, useClass: IdServiceStub }
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

  constructor(public idService: IdService) {}

  ngOnChanges() {}
  changeDate() {}
  getClosestAlertByGroup(): any {}
  startCalendar(): any {}
  toggleShowDescription() {}
}
