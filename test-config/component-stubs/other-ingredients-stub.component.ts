/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { OtherIngredients } from '../../src/app/shared/interfaces';

/* Component imports */
import { OtherIngredientsComponent } from '../../src/app/components/other-ingredients/other-ingredients.component';

@Component({
  selector: 'other-ingredients',
  template: '',
  providers: [
    { provide: OtherIngredientsComponent, useClass: OtherIngredientsComponentStub }
  ]
})
export class OtherIngredientsComponentStub {
  @Input() otherIngredients: OtherIngredients[] = [];
  @Input() onRecipeAction: (actionName: string, options?: any[]) => void;
}
