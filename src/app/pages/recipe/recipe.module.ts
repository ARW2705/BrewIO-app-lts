/* Module imports */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

/* Pipe imports */
import { RoundPipeModule, TruncatePipeModule, UnitConversionPipeModule } from '../../pipes/pipes';

/* Component imports */
import { AccordionComponentModule } from '../../components/accordion/accordion.module';
import { HeaderComponentModule } from '../../components/header/header.module';
import { IngredientListComponentModule } from '../../components/ingredient-list/ingredient-list.module';

/* Page imports */
import { RecipePage } from './recipe.page';
import { ConfirmationPageModule } from '../confirmation/confirmation.module';
import { LoginPageModule } from '../forms/login/login.module';
import { SignupPageModule } from '../forms/signup/signup.module';


@NgModule({
  imports: [
    LoginPageModule,
    SignupPageModule,
    CommonModule,
    IonicModule,
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
