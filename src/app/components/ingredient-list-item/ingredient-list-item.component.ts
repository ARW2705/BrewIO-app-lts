import { Component, Input, OnInit } from '@angular/core';

/* Interface imports */
import { GrainBill, HopsSchedule, OtherIngredients, YeastBatch } from '../../shared/interfaces';


@Component({
  selector: 'app-ingredient-list-item',
  templateUrl: './ingredient-list-item.component.html',
  styleUrls: ['./ingredient-list-item.component.scss'],
})
export class IngredientListItemComponent implements OnInit {
  @Input() ingredients: (GrainBill | HopsSchedule | OtherIngredients | YeastBatch)[] = [];
  @Input() refreshPipes: boolean;
  title: string;
  ingredientType: string = null;
  ingredientNames: string[];

  ngOnInit(): void {
    if (this.ingredients.length) {
      this.setIngredientType();
      this.setNames();
      this.setTitle();
    }
  }

  /**
   * Set the ingredient type based on the type of ingredients;
   * Each ingredient can be identified if it has a corresponding property
   * (eg: type 'grains' has property 'grainType'); use 'otherType' if
   * there is no such property
   *
   * @param: none
   * @return: none
   */
  setIngredientType(): void {
    const ingredient: GrainBill | HopsSchedule | OtherIngredients | YeastBatch = this.ingredients[0];
    if (ingredient.hasOwnProperty('grainType')) {
      this.ingredientType = 'grainType';
    } else if (ingredient.hasOwnProperty('hopsType')) {
      this.ingredientType = 'hopsType';
    } else if (ingredient.hasOwnProperty('yeastType')) {
      this.ingredientType = 'yeastType';
    } else {
      this.ingredientType = 'otherType';
    }
  }

  /**
   * Set the array of names for the ingredients using the ingredientType
   *
   * @param: none
   * @return: none
   */
  setNames(): void {
    this.ingredientNames = this.ingredients
      .map((ingredient: GrainBill | HopsSchedule | OtherIngredients | YeastBatch): string => {
        if (this.ingredientType === 'otherType') {
          return (<OtherIngredients>ingredient).name;
        }
        return ingredient[this.ingredientType].name;
      });
  }

  /**
   * Set the title based on the ingredient type
   *
   * @param: none
   * @return: none
   */
  setTitle(): void {
    this.title = this.ingredientType.split('T')[0];
  }

}
