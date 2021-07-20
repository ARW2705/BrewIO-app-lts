/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { YeastBatch } from '../../src/app/shared/interfaces';

/* Component imports */
import { YeastBatchComponent } from '../../src/app/components/yeast-batch/yeast-batch.component';

@Component({
  selector: 'yeast-batch',
  template: '',
  providers: [
    { provide: YeastBatchComponent, useClass: YeastBatchComponentStub }
  ]
})
export class YeastBatchComponentStub {
  @Input() yeastBatch: YeastBatch[];
  @Input() onRecipeAction: (actionName: string, options?: object) => void;
}
