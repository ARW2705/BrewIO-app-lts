/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { RecipeMaster, RecipeVariant } from '@shared/interfaces';


@Component({
  selector: 'app-recipe-slider-content',
  templateUrl: './recipe-slider-content.component.html',
  styleUrls: ['./recipe-slider-content.component.scss'],
})
export class RecipeSliderContentComponent {
  @Input() recipe: RecipeMaster;
  @Input() refreshPipes: boolean;
  @Input() variant: RecipeVariant;
  @Output() expandIngredientListEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Emit expand ingredient list event
   *
   * @param: none
   * @return: none
   */
  expandIngredientList(): void {
    this.expandIngredientListEvent.emit();
  }

}
