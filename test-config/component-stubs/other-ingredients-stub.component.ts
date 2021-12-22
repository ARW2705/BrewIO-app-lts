/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { OtherIngredients } from '../../src/app/shared/interfaces';

/* Component imports */
import { OtherIngredientsComponent } from '../../src/app/components/ingredient/private/other-ingredients/other-ingredients.component';

@Component({
  selector: 'app-other-ingredients',
  template: '',
  providers: [
    { provide: OtherIngredientsComponent, useClass: OtherIngredientsComponentStub }
  ]
})
export class OtherIngredientsComponentStub {
  @Input() otherIngredients: OtherIngredients[] = [];
  @Output() openIngredientFormEvent: EventEmitter<OtherIngredients> = new EventEmitter<OtherIngredients>();
}
