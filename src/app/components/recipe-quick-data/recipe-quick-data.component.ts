/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { RecipeVariant } from '../../shared/interfaces/recipe-variant';
import { Style } from '../../shared/interfaces/library';


@Component({
  selector: 'recipe-quick-data',
  templateUrl: './recipe-quick-data.component.html',
  styleUrls: ['./recipe-quick-data.component.scss'],
})
export class RecipeQuickDataComponent {
  @Input() variant: RecipeVariant;
  @Input() style: Style;

  constructor() { }

}
