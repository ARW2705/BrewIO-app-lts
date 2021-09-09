/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule } from '../../../components/form-buttons/form-buttons.module';
import { FormInputComponentModule } from '../../../components/form-input/form-input.module';
import { FormSelectComponentModule } from '../../../components/form-select/form-select.module';
import { FormToggleComponentModule } from '../../../components/form-toggle/form-toggle.module';
import { HeaderComponentModule } from '../../../components/header/header.module';

/* Page imports */
import { IngredientFormPage } from './ingredient-form.page';


@NgModule({
  imports: [
    CommonModule,
    FormButtonsComponentModule,
    FormInputComponentModule,
    FormSelectComponentModule,
    FormsModule,
    FormToggleComponentModule,
    HeaderComponentModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [
    IngredientFormPage
  ],
  entryComponents: [
    IngredientFormPage
  ]
})
export class IngredientFormPageModule {}
