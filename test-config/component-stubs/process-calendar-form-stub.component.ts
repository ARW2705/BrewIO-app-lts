/* Module imports */
import { Component } from '@angular/core';

/* Component imports */
import { ProcessCalendarFormComponent } from '../../src/app/components/process/private/process-calendar-form/process-calendar-form.component';

@Component({
  selector: 'app-process-calendar-form',
  template: '',
  providers: [
    { provide: ProcessCalendarFormComponent, useClass: ProcessCalendarFormComponentStub }
  ]
})
export class ProcessCalendarFormComponentStub {

}
