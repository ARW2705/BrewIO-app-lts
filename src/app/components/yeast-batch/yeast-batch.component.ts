/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { YeastBatch } from '../../shared/interfaces';


@Component({
  selector: 'yeast-batch',
  templateUrl: './yeast-batch.component.html',
  styleUrls: ['./yeast-batch.component.scss'],
})
export class YeastBatchComponent {
  @Input() yeastBatch: YeastBatch[];
  @Input() onRecipeAction: (actionName: string, options?: object) => void;

  constructor() { }

  /**
   * Open ingredient form modal to update a yeast instance
   *
   * @params: yeast - the yeast instance to update
   *
   * @return: none
   */
  openIngredientFormModal(yeast: YeastBatch): void {
    this.onRecipeAction('openIngredientFormModal', ['yeast', yeast]);
  }

}
