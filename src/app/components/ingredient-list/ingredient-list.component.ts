/* Module imports */
import { Component, Input, OnChanges } from '@angular/core';

/* Interface imports */
import { RecipeVariant } from '../../shared/interfaces';


@Component({
  selector: 'ingredient-list',
  templateUrl: './ingredient-list.component.html',
  styleUrls: ['./ingredient-list.component.scss'],
})
export class IngredientListComponent implements OnChanges {
  @Input() recipeVariant: RecipeVariant = null;
  @Input() refreshPipes: boolean = false;
  hasIngredients: boolean = false;

  ngOnChanges(): void {
    console.log('ingredient list changes');
    this.hasIngredients = this.recipeVariant
      && (
        this.recipeVariant.grains.length > 0
        || this.recipeVariant.hops.length > 0
        || this.recipeVariant.yeast.length > 0
        || this.recipeVariant.otherIngredients.length > 0
      );
  }

}
