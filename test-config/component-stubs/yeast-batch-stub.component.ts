/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { YeastBatch } from '../../src/app/shared/interfaces';

/* Component imports */
import { YeastBatchComponent } from '../../src/app/components/ingredient/private/yeast-batch/yeast-batch.component';

@Component({
  selector: 'app-yeast-batch',
  template: '',
  providers: [
    { provide: YeastBatchComponent, useClass: YeastBatchComponentStub }
  ]
})
export class YeastBatchComponentStub {
  @Input() yeastBatch: YeastBatch[];
  @Output() openIngredientFormEvent: EventEmitter<YeastBatch> = new EventEmitter<YeastBatch>();
}
