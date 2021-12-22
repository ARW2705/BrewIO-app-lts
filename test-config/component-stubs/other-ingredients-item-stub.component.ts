/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { OtherIngredients } from '../../src/app/shared/interfaces';

/* Component imports */
import { OtherIngredientsItemComponent } from '../../src/app/components/ingredient/private/other-ingredients-item/other-ingredients-item.component';

@Component({
  selector: 'app-other-ingredients-item',
  template: '',
  providers: [
    { provide: OtherIngredientsItemComponent, useClass: OtherIngredientsItemComponentStub }
  ]
})
export class OtherIngredientsItemComponentStub {
  @Input() other: OtherIngredients;
  @Input() isLast: boolean;
  @Output() openIngredientFormButtonEvent: EventEmitter<null> = new EventEmitter<null>();
}
