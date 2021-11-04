/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { IngredientListComponentModule } from '../../components/ingredient/public';
import { NoteContainerComponentModule } from '../../components/note/public';
import { AccordionComponentModule, HeaderComponentModule } from '../../components/shared/public';

/* Page imports */
import { ConfirmationPageModule } from '../confirmation/confirmation.module';
import { RecipeDetailPage } from './recipe-detail.page';

/* Pipe imports */
import { RoundPipeModule, TruncatePipeModule, UnitConversionPipeModule } from '../../pipes/pipes';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoundPipeModule,
    TruncatePipeModule,
    UnitConversionPipeModule,
    NoteContainerComponentModule,
    HeaderComponentModule,
    AccordionComponentModule,
    ConfirmationPageModule,
    IngredientListComponentModule,
    RouterModule.forChild([{path: '', component: RecipeDetailPage}])
  ],
  declarations: [
    RecipeDetailPage
  ]
})
export class RecipeDetailPageModule {}
