/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { RoundPipeModule, TruncatePipeModule, UnitConversionPipeModule } from '../../../../pipes/pipes';

/* Component imports */
import { RecipeSliderContentValuesComponent } from './recipe-slider-content-values.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RoundPipeModule,
    TruncatePipeModule,
    UnitConversionPipeModule
  ],
  declarations: [
    RecipeSliderContentValuesComponent
  ],
  exports: [
    RecipeSliderContentValuesComponent
  ]
})
export class RecipeSliderContentValuesComponentModule {}
