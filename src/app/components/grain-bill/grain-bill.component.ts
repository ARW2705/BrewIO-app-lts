/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { GrainBill } from '../../shared/interfaces/grain-bill';


@Component({
  selector: 'grain-bill',
  templateUrl: './grain-bill.component.html',
  styleUrls: ['./grain-bill.component.scss'],
})
export class GrainBillComponent {
  @Input() grainBill: GrainBill[];
  @Input() onRecipeAction: (actionName: string, options?: any[]) => void;
  @Input() refreshPipes: boolean;

  constructor() { }

  /**
   * Open ingredient form modal to update a grains instance
   *
   * @params: grains - the grains instance to update
   *
   * @return: none
   */
  openIngredientFormModal(grains: GrainBill): void {
    this.onRecipeAction('openIngredientFormModal', ['grains', grains]);
  }

}
