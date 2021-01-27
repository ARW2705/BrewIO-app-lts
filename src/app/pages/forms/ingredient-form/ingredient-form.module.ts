/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormErrorComponentModule } from '../../../components/form-error/form-error.module';
import { HeaderComponentModule } from '../../../components/header/header.module';

/* Page imports */
import { IngredientFormPage } from './ingredient-form.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FormErrorComponentModule,
    HeaderComponentModule
  ],
  declarations: [
    IngredientFormPage
  ],
  entryComponents: [
    IngredientFormPage
  ]
})
export class IngredientFormPageModule {}
