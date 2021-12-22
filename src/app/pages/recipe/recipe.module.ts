/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { RoundPipeModule, TruncatePipeModule, UnitConversionPipeModule } from '../../pipes/pipes';

/* Component imports */
import { IngredientListComponentModule } from '../../components/ingredient/public';
import { RecipeSliderComponentModule } from '../../components/recipe/public';
import { AccordionComponentModule, ConfirmationComponentModule, HeaderComponentModule, LoadingSpinnerComponentModule } from '../../components/shared/public';
import { LoginSignupButtonComponentModule } from '../../components/user/public';

/* Page imports */
import { RecipePage } from './recipe.page';


@NgModule({
  imports: [
    AccordionComponentModule,
    CommonModule,
    ConfirmationComponentModule,
    HeaderComponentModule,
    IngredientListComponentModule,
    IonicModule,
    LoginSignupButtonComponentModule,
    LoadingSpinnerComponentModule,
    RecipeSliderComponentModule,
    RoundPipeModule,
    RouterModule.forChild([{path: '', component: RecipePage}]),
    TruncatePipeModule,
    UnitConversionPipeModule
  ],
  declarations: [
    RecipePage
  ]
})
export class RecipePageModule {}
