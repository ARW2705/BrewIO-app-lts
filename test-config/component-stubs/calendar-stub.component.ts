/* Module imports */
import { Component, Input } from '@angular/core';

/* Component imports */
import { CalendarComponent } from '../../src/app/components/calendar/calendar.component';

@Component({
  selector: 'calendar',
  template: '',
  providers: [
    { provide: CalendarComponent, useClass: CalendarComponentStub }
  ]
})
export class CalendarComponentStub {
  @Input() stepData: object;

  getFinal(): any {}
}
