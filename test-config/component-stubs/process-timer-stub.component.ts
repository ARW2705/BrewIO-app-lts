/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { Process } from '../../src/app/shared/interfaces/process';

/* Component imports */
import { ProcessTimerComponent } from '../../src/app/components/process-timer/process-timer.component';

@Component({
  selector: 'process-timer',
  template: '',
  providers: [
    { provide: ProcessTimerComponent, useClass: ProcessTimerComponentStub }
  ]
})
export class ProcessTimerComponentStub {
  @Input() batchId: string;
  @Input() isPreview: boolean;
  @Input() stepData: Process[];
}
