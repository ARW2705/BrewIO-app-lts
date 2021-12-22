/* Module imports */
import { Component } from '@angular/core';

/* Component imports */
import { RecipeSliderComponent } from '../../src/app/components/recipe/public/recipe-slider/recipe-slider.component';

@Component({
  selector: 'app-recipe-slider',
  template: '',
  providers: [
    { provide: RecipeSliderComponent, useClass: RecipeSliderComponentStub }
  ]
})
export class RecipeSliderComponentStub {}
