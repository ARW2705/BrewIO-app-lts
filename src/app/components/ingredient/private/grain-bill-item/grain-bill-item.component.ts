/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { GrainBill } from '../../../../shared/interfaces';


@Component({
  selector: 'app-grain-bill-item',
  templateUrl: './grain-bill-item.component.html',
  styleUrls: ['./grain-bill-item.component.scss'],
})
export class GrainBillItemComponent {
  @Input() grains: GrainBill;
  @Input() isLast: boolean;
  @Input() ratio: string;
  @Output() openIngredientFormButtonEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Open ingredient form modal to update a grains instance
   *
   * @param: none
   * @return: none
   */
  openIngredientFormModal(): void {
    this.openIngredientFormButtonEvent.emit();
  }

}
