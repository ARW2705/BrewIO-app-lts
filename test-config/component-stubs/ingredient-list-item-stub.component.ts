/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { GrainBill, HopsSchedule, OtherIngredients, YeastBatch } from '../../src/app/shared/interfaces';

/* Component imports */
import { IngredientListItemComponent } from '../../src/app/components/ingredient/private/ingredient-list-item/ingredient-list-item.component';

@Component({
  selector: 'app-ingredient-list-item',
  template: '',
  providers: [
    { provide: IngredientListItemComponent, useClass: IngredientListItemComponentStub }
  ]
})
export class IngredientListItemComponentStub {
  @Input() ingredients: (GrainBill | HopsSchedule | OtherIngredients | YeastBatch)[] = [];
  @Input() refreshPipes: boolean;
  title: string;
  ingredientType: string = null;
  ingredientNames: string[];
}
