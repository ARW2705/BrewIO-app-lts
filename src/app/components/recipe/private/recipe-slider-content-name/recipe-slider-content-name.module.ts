/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { RecipeSliderContentNameComponent } from './recipe-slider-content-name.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    RecipeSliderContentNameComponent
  ],
  exports: [
    RecipeSliderContentNameComponent
  ]
})
export class RecipeSliderContentNameComponentModule {}
