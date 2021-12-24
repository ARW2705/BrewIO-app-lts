/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { OtherIngredients } from '@shared/interfaces';


@Component({
  selector: 'app-other-ingredients-item',
  templateUrl: './other-ingredients-item.component.html',
  styleUrls: ['./other-ingredients-item.component.scss'],
})
export class OtherIngredientsItemComponent {
  @Input() other: OtherIngredients;
  @Input() isLast: boolean;
  @Output() openIngredientFormButtonEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Open ingredient form modal to update a otherIngredients instance
   *
   * @param: none
   * @return: none
   */
  openIngredientFormModal(): void {
    this.openIngredientFormButtonEvent.emit();
  }

}
