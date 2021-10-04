/* Module imports */
import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';

/* Interface imports */
import { Batch } from '../../src/app/shared/interfaces';

/* Component imports */
import { ActiveBatchListComponent } from '../../src/app/components/batch/public/active-batch-list/active-batch-list.component';

@Component({
  selector: 'app-active-batch-list',
  template: '',
  providers: [
    { provide: ActiveBatchListComponent, useClass: ActiveBatchListComponentStub }
  ]
})
export class ActiveBatchListComponentStub {
  @Input() enterDuration: number;
  @Input() rootURL: string;
  activeBatchesList: Batch[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
}
