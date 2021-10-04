/* Module imports */
import { Component, Input } from '@angular/core';

/* Component imports */
import { ProcessControlsComponent } from '../../src/app/components/process/public/process-controls/process-controls.component';

@Component({
  selector: 'process-controls',
  template: '',
  providers: [
    { provide: ProcessControlsComponent, useClass: ProcessControlsComponentStub }
  ]
})
export class ProcessControlsComponentStub {
  @Input() atViewStart: boolean = false;
  @Input() atViewEnd: boolean = false;
  @Input() isCalendarInProgress: boolean = false;
  @Input() isCalendarStep: boolean = false;
  @Input() onControlAction: (actionName: string, ...options: any[]) => void;
  @Input() onCurrentStep: boolean = false;
}
