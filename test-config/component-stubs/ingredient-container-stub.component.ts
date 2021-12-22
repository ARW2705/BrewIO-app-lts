/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { Grains, Hops, IngredientUpdateEvent, RecipeVariant, Yeast } from '../../src/app/shared/interfaces';

/* Component imports */
import { IngredientContainerComponent } from '../../src/app/components/ingredient/public/ingredient-container/ingredient-container.component';

@Component({
  selector: 'app-ingredients-container',
  template: '',
  providers: [
    { provide: IngredientContainerComponent, useClass: IngredientContainerComponentStub }
  ]
})
export class IngredientContainerComponentStub {
  @Input() isAddButtonDisabled: boolean;
  @Input() variant: RecipeVariant;
  @Input() refresh: boolean;
  @Output() ingredientUpdateEvent: EventEmitter<IngredientUpdateEvent> = new EventEmitter<IngredientUpdateEvent>();
  grainsLibrary: Grains[] = null;
  hopsLibrary: Hops[] = null;
  yeastLibrary: Yeast[] = null;
}
