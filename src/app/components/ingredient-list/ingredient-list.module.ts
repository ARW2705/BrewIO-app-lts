/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { UnitConversionPipeModule } from '../../pipes/pipes';

/* Component imports */
import { IngredientListComponent } from './ingredient-list.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    UnitConversionPipeModule
  ],
  declarations: [
    IngredientListComponent
  ],
  exports: [
    IngredientListComponent
  ]
})
export class IngredientListComponentModule {}
