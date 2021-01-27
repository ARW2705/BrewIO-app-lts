/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from '../../pipes/pipes.module';

/* Component imports */
import { IngredientListComponent } from './ingredient-list.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PipesModule
  ],
  declarations: [
    IngredientListComponent
  ],
  exports: [
    IngredientListComponent
  ]
})
export class IngredientListComponentModule {}
