/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { IngredientContainerComponentModule } from '../../../ingredient/public';
import { NoteContainerComponentModule } from '../../../note/public';
import { ProcessContainerComponentModule } from '../../../process/public';
import { HeaderComponentModule } from '../../../shared/public';
import { GeneralFormButtonComponentModule } from '../../private/general-form-button/general-form-button.module';
import { RecipeQuickDataComponentModule } from '../../private/recipe-quick-data/recipe-quick-data.module';
import { RecipeFormComponent } from './recipe-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GeneralFormButtonComponentModule,
    RouterModule.forChild([{path: '', component: RecipeFormComponent}]),
    HeaderComponentModule,
    IngredientContainerComponentModule,
    ProcessContainerComponentModule,
    NoteContainerComponentModule,
    RecipeQuickDataComponentModule
  ],
  declarations: [
    RecipeFormComponent
  ]
})
export class RecipeFormComponentModule {}
