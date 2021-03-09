/* Module imports */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

/* Pipe imports */
import { PipesModule } from '../../pipes/pipes.module';

/* Component imports */
import { AccordionComponentModule } from '../../components/accordion/accordion.module';
import { ConfirmationComponentModule } from '../../components/confirmation/confirmation.module';
import { HeaderComponentModule } from '../../components/header/header.module';
import { IngredientListComponentModule } from '../../components/ingredient-list/ingredient-list.module';

/* Page imports */
import { RecipePage } from './recipe.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PipesModule,
    AccordionComponentModule,
    ConfirmationComponentModule,
    HeaderComponentModule,
    IngredientListComponentModule,
    RouterModule.forChild([{path: '', component: RecipePage}])
  ],
  declarations: [
    RecipePage
  ]
})
export class RecipePageModule {}
