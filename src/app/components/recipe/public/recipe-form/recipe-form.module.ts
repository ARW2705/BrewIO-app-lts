/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { IngredientContainerComponentModule } from '@components/ingredient/public';
import { NoteContainerComponentModule } from '@components/note/public';
import { ProcessContainerComponentModule } from '@components/process/public';
import { GeneralFormButtonComponentModule } from '@components/recipe/private/general-form-button/general-form-button.module';
import { RecipeQuickDataComponentModule } from '@components/recipe/private/recipe-quick-data/recipe-quick-data.module';
import { HeaderComponentModule } from '@components/shared/public';
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
