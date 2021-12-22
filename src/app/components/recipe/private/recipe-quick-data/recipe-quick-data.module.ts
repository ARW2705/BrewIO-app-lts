/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { TruncatePipeModule, UnitConversionPipeModule } from '../../../../pipes/pipes';

/* Component imports */
import { RecipeQuickDataComponent } from './recipe-quick-data.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TruncatePipeModule,
    UnitConversionPipeModule
  ],
  declarations: [
    RecipeQuickDataComponent
  ],
  exports: [
    RecipeQuickDataComponent
  ]
})
export class RecipeQuickDataComponentModule {}
