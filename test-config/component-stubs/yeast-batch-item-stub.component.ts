/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { YeastBatch } from '../../src/app/shared/interfaces';

/* Component imports */
import { YeastBatchItemComponent } from '../../src/app/components/ingredient/private/yeast-batch-item/yeast-batch-item.component';

@Component({
  selector: 'app-yeast-batch-item',
  template: '',
  providers: [
    { provide: YeastBatchItemComponent, useClass: YeastBatchItemComponentStub }
  ]
})
export class YeastBatchItemComponentStub {
  @Input() yeastBatch: YeastBatch[];
  @Output() openIngredientFormEvent: EventEmitter<YeastBatch> = new EventEmitter<YeastBatch>();
}
