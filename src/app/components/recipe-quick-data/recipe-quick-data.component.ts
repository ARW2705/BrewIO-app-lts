/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { RecipeVariant, Style } from '../../shared/interfaces';


@Component({
  selector: 'recipe-quick-data',
  templateUrl: './recipe-quick-data.component.html',
  styleUrls: ['./recipe-quick-data.component.scss'],
})
export class RecipeQuickDataComponent {
  @Input() style: Style;
  @Input() variant: RecipeVariant;

  constructor() { }

}
