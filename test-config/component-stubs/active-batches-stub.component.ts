/* Module imports */
import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';

/* Interface imports */
import { Batch } from '../../src/app/shared/interfaces';

/* Component imports */
import { ActiveBatchesComponent } from '../../src/app/components/active-batches/active-batches.component';

@Component({
  selector: 'active-batches',
  template: '',
  providers: [
    { provide: ActiveBatchesComponent, useClass: ActiveBatchesComponentStub }
  ]
})
export class ActiveBatchesComponentStub {
  @Input() enterDuration: number;
  @Input() rootURL: string;
  activeBatchesList: Batch[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
}
