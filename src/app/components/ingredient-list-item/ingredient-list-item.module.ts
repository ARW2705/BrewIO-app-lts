/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { UnitConversionPipeModule } from '../../pipes/pipes';

/* Component imports */
import { IngredientListItemComponent } from './ingredient-list-item.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    UnitConversionPipeModule
  ],
  declarations: [
    IngredientListItemComponent
  ],
  exports: [
    IngredientListItemComponent
  ]
})
export class IngredientListItemComponentModule {}
