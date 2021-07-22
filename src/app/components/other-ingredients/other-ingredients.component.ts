/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { OtherIngredients } from '../../shared/interfaces';


@Component({
  selector: 'other-ingredients',
  templateUrl: './other-ingredients.component.html',
  styleUrls: ['./other-ingredients.component.scss'],
})
export class OtherIngredientsComponent {
  @Input() onRecipeAction: (actionName: string, options?: any[]) => void;
  @Input() otherIngredients: OtherIngredients[] = [];

  constructor() { }

  /**
   * Open ingredient form modal to update a otherIngredients instance
   *
   * @params: otherIngredients - the otherIngredients instance to update
   *
   * @return: none
   */
  openIngredientFormModal(otherIngredients: OtherIngredients): void {
    this.onRecipeAction(
      'openIngredientFormModal',
      [
        'otherIngredients',
        otherIngredients
      ]
    );
  }

}
