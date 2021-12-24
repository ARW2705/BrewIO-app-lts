/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { RecipeMaster, RecipeVariant } from '@shared/interfaces';


@Component({
  selector: 'app-recipe-slider',
  templateUrl: './recipe-slider.component.html',
  styleUrls: ['./recipe-slider.component.scss'],
})
export class RecipeSliderComponent {
  @Input() recipe: RecipeMaster;
  @Input() refreshPipes: boolean;
  @Input() variant: RecipeVariant;
  @Output() confirmDeleteEvent: EventEmitter<null> = new EventEmitter<null>();
  @Output() expandIngredientListEvent: EventEmitter<null> = new EventEmitter<null>();
  @Output() navToBrewProcessEvent: EventEmitter<null> = new EventEmitter<null>();
  @Output() navToDetailsEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Emit confirm delete event
   *
   * @param: none
   * @return: none
   */
  confirmDelete(): void {
    this.confirmDeleteEvent.emit();
  }

  /**
   * Emit expand ingredient list event
   *
   * @param: none
   * @return: none
   */
  expandIngredientList(): void {
    this.expandIngredientListEvent.emit();
  }

  /**
   * Emit nav to brew process event
   *
   * @param: none
   * @return: none
   */
  navToBrewProcess(): void {
    this.navToBrewProcessEvent.emit();
  }

  /**
   * Emit nav to details event
   *
   * @param: none
   * @return: none
   */
  navToDetails(): void {
    this.navToDetailsEvent.emit();
  }

}
