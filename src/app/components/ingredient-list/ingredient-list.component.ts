/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { RecipeVariant } from '../../shared/interfaces/recipe-variant';


@Component({
  selector: 'ingredient-list',
  templateUrl: './ingredient-list.component.html',
  styleUrls: ['./ingredient-list.component.scss'],
})
export class IngredientListComponent {
  @Input() recipeVariant: RecipeVariant = null;
  @Input() refreshPipes: boolean = false;

  constructor() { }

}
