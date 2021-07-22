/* Module imports */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { GrainBillComponentModule } from '../../../components/grain-bill/grain-bill.module';
import { HeaderComponentModule } from '../../../components/header/header.module';
import { HopsScheduleComponentModule } from '../../../components/hops-schedule/hops-schedule.module';
import { NoteListComponentModule } from '../../../components/note-list/note-list.module';
import { OtherIngredientsComponentModule } from '../../../components/other-ingredients/other-ingredients.module';
import { ProcessListComponentModule } from '../../../components/process-list/process-list.module';
import { RecipeQuickDataComponentModule } from '../../../components/recipe-quick-data/recipe-quick-data.module';
import { YeastBatchComponentModule } from '../../../components/yeast-batch/yeast-batch.module';

/* Page imports */
import { GeneralFormPageModule } from '../general-form/general-form.module';
import { IngredientFormPageModule } from '../ingredient-form/ingredient-form.module';
import { InventoryFormPageModule } from '../inventory-form/inventory-form.module';
import { NoteFormPageModule } from '../note-form/note-form.module';
import { ProcessFormPageModule } from '../process-form/process-form.module';
import { RecipeFormPage } from './recipe-form.page';

/* Pipe imports */
import { TruncatePipeModule } from '../../../pipes/pipes';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: RecipeFormPage}]),
    HeaderComponentModule,
    TruncatePipeModule,
    GeneralFormPageModule,
    GrainBillComponentModule,
    HopsScheduleComponentModule,
    IngredientFormPageModule,
    InventoryFormPageModule,
    NoteFormPageModule,
    NoteListComponentModule,
    OtherIngredientsComponentModule,
    ProcessFormPageModule,
    ProcessListComponentModule,
    RecipeQuickDataComponentModule,
    YeastBatchComponentModule
  ],
  declarations: [
    RecipeFormPage
  ]
})
export class RecipeFormPageModule {}
