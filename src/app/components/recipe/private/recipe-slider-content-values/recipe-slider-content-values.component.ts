/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { RecipeVariant } from '@shared/interfaces';


@Component({
  selector: 'app-recipe-slider-content-values',
  templateUrl: './recipe-slider-content-values.component.html',
  styleUrls: ['./recipe-slider-content-values.component.scss'],
})
export class RecipeSliderContentValuesComponent {
  @Input() variant: RecipeVariant;
  @Input() refreshPipes: boolean = false;
}
