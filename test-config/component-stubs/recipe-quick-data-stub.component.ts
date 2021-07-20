/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { RecipeVariant, Style } from '../../src/app/shared/interfaces';

/* Component imports */
import { RecipeQuickDataComponent } from '../../src/app/components/recipe-quick-data/recipe-quick-data.component';

@Component({
  selector: 'recipe-quick-data',
  template: '',
  providers: [
    { provide: RecipeQuickDataComponent, useClass: RecipeQuickDataComponentStub }
  ]
})
export class RecipeQuickDataComponentStub {
  @Input() variant: RecipeVariant;
  @Input() style: Style;
}
