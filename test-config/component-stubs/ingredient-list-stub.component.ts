/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { RecipeVariant } from '../../src/app/shared/interfaces';

/* Component imports */
import { IngredientListComponent } from '../../src/app/components/ingredient/public/ingredient-list/ingredient-list.component';

@Component({
  selector: 'app-ingredient-list',
  template: '',
  providers: [
    { provide: IngredientListComponent, useClass: IngredientListComponentStub }
  ]
})
export class IngredientListComponentStub {
  @Input() recipeVariant: RecipeVariant = null;
  @Input() refreshPipes: boolean = false;
  hasIngredients: boolean = false;
}
