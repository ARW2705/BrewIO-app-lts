/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { RecipeMaster } from '../../../../shared/interfaces';


@Component({
  selector: 'app-recipe-slider-content-name',
  templateUrl: './recipe-slider-content-name.component.html',
  styleUrls: ['./recipe-slider-content-name.component.scss'],
})
export class RecipeSliderContentNameComponent {
  @Input() recipe: RecipeMaster;
  @Input() refreshPipes: boolean;
}
