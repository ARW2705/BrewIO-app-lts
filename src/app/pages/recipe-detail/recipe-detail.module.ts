/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { AccordionComponentModule } from '../../components/accordion/accordion.module';
import { ConfirmationComponentModule } from '../../components/confirmation/confirmation.module';
import { HeaderComponentModule } from '../../components/header/header.module';
import { IngredientListComponentModule } from '../../components/ingredient-list/ingredient-list.module';
import { NoteListComponentModule } from '../../components/note-list/note-list.module';

/* Page imports */
import { RecipeDetailPage } from './recipe-detail.page';

/* Pipe imports */
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    HeaderComponentModule,
    AccordionComponentModule,
    ConfirmationComponentModule,
    IngredientListComponentModule,
    NoteListComponentModule,
    RouterModule.forChild([{path: '', component: RecipeDetailPage}])
  ],
  declarations: [
    RecipeDetailPage
  ]
})
export class RecipeDetailPageModule {}
