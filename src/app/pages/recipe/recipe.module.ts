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
import { AccordionComponentModule, HeaderComponentModule, LoadingSpinnerComponentModule } from '../../components/shared/public';

/* Page imports */
import { ConfirmationPageModule } from '../confirmation/confirmation.module';
import { LoginPageModule } from '../forms/login/login.module';
import { SignupPageModule } from '../forms/signup/signup.module';
import { RecipePage } from './recipe.page';


@NgModule({
  imports: [
    LoginPageModule,
    SignupPageModule,
    CommonModule,
    IonicModule,
    LoadingSpinnerComponentModule,
    RecipeSliderComponentModule,
    RoundPipeModule,
    TruncatePipeModule,
    UnitConversionPipeModule,
    AccordionComponentModule,
    ConfirmationPageModule,
    HeaderComponentModule,
    IngredientListComponentModule,
    RouterModule.forChild([{path: '', component: RecipePage}])
  ],
  declarations: [
    RecipePage
  ]
})
export class RecipePageModule {}
