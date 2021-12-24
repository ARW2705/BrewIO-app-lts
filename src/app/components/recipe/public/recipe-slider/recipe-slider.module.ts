/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { RecipeSliderContentComponentModule } from '@components/recipe/private/recipe-slider-content/recipe-slider-content.module';
import { RecipeSliderComponent } from './recipe-slider.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RecipeSliderContentComponentModule
  ],
  declarations: [
    RecipeSliderComponent
  ],
  exports: [
    RecipeSliderComponent
  ]
})
export class RecipeSliderComponentModule {}
