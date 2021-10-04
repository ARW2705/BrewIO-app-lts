/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { ManualProcess } from '../../src/app/shared/interfaces';

/* Component imports */
import { ProcessManualComponent } from '../../src/app/components/process/public/process-manual/process-manual.component';

@Component({
  selector: 'process-manual',
  template: '',
  providers: [
    { provide: ProcessManualComponent, useClass: ProcessManualComponentStub }
  ]
})
export class ProcessManualComponentStub {
  @Input() stepData: ManualProcess;
}
