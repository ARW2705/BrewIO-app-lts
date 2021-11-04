/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { IngredientsContainerComponentModule } from '../../../ingredient/public';
import { NoteContainerComponentModule } from '../../../note/public';
import { ProcessContainerComponentModule } from '../../../process/public';
import { GeneralFormButtonComponentModule, RecipeQuickDataComponentModule } from '../../../recipe/public';
import { HeaderComponentModule } from '../../../shared/public';

/* Page imports */
import { RecipeFormComponent } from './recipe-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GeneralFormButtonComponentModule,
    RouterModule.forChild([{path: '', component: RecipeFormComponent}]),
    HeaderComponentModule,
    IngredientsContainerComponentModule,
    ProcessContainerComponentModule,
    NoteContainerComponentModule,
    RecipeQuickDataComponentModule
  ],
  declarations: [
    RecipeFormComponent
  ]
})
export class RecipeFormComponentModule {}
