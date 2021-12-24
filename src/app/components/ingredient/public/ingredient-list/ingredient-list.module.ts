/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { IngredientListItemComponentModule } from '@components/ingredient/private/ingredient-list-item/ingredient-list-item.module';
import { IngredientListComponent } from './ingredient-list.component';


@NgModule({
  imports: [
    CommonModule,
    IngredientListItemComponentModule,
    IonicModule
  ],
  declarations: [
    IngredientListComponent
  ],
  exports: [
    IngredientListComponent
  ]
})
export class IngredientListComponentModule {}
