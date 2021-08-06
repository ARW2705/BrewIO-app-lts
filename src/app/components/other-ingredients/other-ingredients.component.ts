/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { OtherIngredients } from '../../shared/interfaces';


@Component({
  selector: 'app-other-ingredients',
  templateUrl: './other-ingredients.component.html',
  styleUrls: ['./other-ingredients.component.scss'],
})
export class OtherIngredientsComponent {
  @Input() otherIngredients: OtherIngredients[] = [];
  @Output() openIngredientFormEvent: EventEmitter<OtherIngredients> = new EventEmitter<OtherIngredients>();

  /**
   * Open ingredient form modal to update a otherIngredients instance
   *
   * @params: otherIngredients - the otherIngredients instance to update
   *
   * @return: none
   */
  openIngredientFormModal(otherIngredients: OtherIngredients): void {
    this.openIngredientFormEvent.emit(otherIngredients);
  }

}
