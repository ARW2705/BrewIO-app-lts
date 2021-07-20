/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { Process } from '../../src/app/shared/interfaces';

/* Component imports */
import { ProcessListComponent } from '../../src/app/components/process-list/process-list.component';

@Component({
  selector: 'process-list',
  template: '',
  providers: [
    { provide: ProcessListComponent, useClass: ProcessListComponentStub }
  ]
})
export class ProcessListComponentStub {
  @Input() onRecipeAction: (actionName: string, options: any[]) => void;
  @Input() schedule: Process[];
  reorderGroup: any;
  processIcons: object = {
    manual: 'hand-right-outline',
    timer: 'timer-outline',
    calendar: 'calendar-outline'
  };
}
