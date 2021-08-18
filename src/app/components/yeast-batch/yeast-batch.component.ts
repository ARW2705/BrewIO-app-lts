/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { YeastBatch } from '../../shared/interfaces';


@Component({
  selector: 'app-yeast-batch',
  templateUrl: './yeast-batch.component.html',
  styleUrls: ['./yeast-batch.component.scss'],
})
export class YeastBatchComponent {
  @Input() yeastBatch: YeastBatch[];
  @Output() openIngredientFormEvent: EventEmitter<YeastBatch> = new EventEmitter<YeastBatch>();

  /**
   * Open ingredient form modal to update a yeast instance
   *
   * @params: yeast - the yeast instance to update
   *
   * @return: none
   */
  openIngredientFormModal(yeast: YeastBatch): void {
    this.openIngredientFormEvent.emit(yeast);
  }

}
