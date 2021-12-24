/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { RecipeSliderContentNameComponentModule } from '@components/recipe/private/recipe-slider-content-name/recipe-slider-content-name.module';
import { RecipeSliderContentValuesComponentModule } from '@components/recipe/private/recipe-slider-content-values/recipe-slider-content-values.module';
import { RecipeSliderContentComponent } from './recipe-slider-content.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RecipeSliderContentNameComponentModule,
    RecipeSliderContentValuesComponentModule
  ],
  declarations: [
    RecipeSliderContentComponent
  ],
  exports: [
    RecipeSliderContentComponent
  ]
})
export class RecipeSliderContentComponentModule {}
