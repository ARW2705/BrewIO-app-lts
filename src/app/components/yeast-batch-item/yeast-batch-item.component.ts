/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interace imports */
import { YeastBatch } from '../../shared/interfaces';


@Component({
  selector: 'app-yeast-batch-item',
  templateUrl: './yeast-batch-item.component.html',
  styleUrls: ['./yeast-batch-item.component.scss'],
})
export class YeastBatchItemComponent {
  @Input() isLast: boolean;
  @Input() yeast: YeastBatch;
  @Output() openIngredientFormButtonEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Open ingredient form modal to update a grains instance
   *
   * @params: none
   * @return: none
   */
  openIngredientFormModal(): void {
    this.openIngredientFormButtonEvent.emit();
  }

}
