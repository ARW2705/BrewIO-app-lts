/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { RoundPipeModule, TruncatePipeModule, UnitConversionPipeModule } from '@pipes/public';

/* Component imports */
import { IngredientListComponentModule } from '@components/ingredient/public';
import { NoteContainerComponentModule } from '@components/note/public';
import { AccordionComponentModule, ConfirmationComponentModule, HeaderComponentModule } from '@components/shared/public';

/* Page imports */
import { RecipeDetailPage } from './recipe-detail.page';



@NgModule({
  imports: [
    AccordionComponentModule,
    CommonModule,
    ConfirmationComponentModule,
    FormsModule,
    IonicModule,
    RoundPipeModule,
    TruncatePipeModule,
    UnitConversionPipeModule,
    NoteContainerComponentModule,
    HeaderComponentModule,
    IngredientListComponentModule,
    RouterModule.forChild([{path: '', component: RecipeDetailPage}])
  ],
  declarations: [
    RecipeDetailPage
  ]
})
export class RecipeDetailPageModule {}
