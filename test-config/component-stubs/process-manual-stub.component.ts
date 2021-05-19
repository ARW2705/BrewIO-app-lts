/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { Process } from '../../src/app/shared/interfaces/process';

/* Component imports */
import { ProcessManualComponent } from '../../src/app/components/process-manual/process-manual.component';

@Component({
  selector: 'process-manual',
  template: '',
  providers: [
    { provide: ProcessManualComponent, useClass: ProcessManualComponentStub }
  ]
})
export class ProcessManualComponentStub {
  @Input() stepData: Process;
}
