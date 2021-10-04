/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule } from '../../../components/form-elements/public';
import { GrainFormComponentModule, HopsFormComponentModule, OtherIngredientsFormComponentModule, YeastFormComponentModule } from '../../../components/ingredient/public';
import { DeleteButtonComponentModule, HeaderComponentModule } from '../../../components/shared/public';

/* Page imports */
import { IngredientFormPage } from './ingredient-form.page';


@NgModule({
  imports: [
    CommonModule,
    DeleteButtonComponentModule,
    FormButtonsComponentModule,
    FormsModule,
    GrainFormComponentModule,
    HeaderComponentModule,
    HopsFormComponentModule,
    IonicModule,
    OtherIngredientsFormComponentModule,
    ReactiveFormsModule,
    YeastFormComponentModule
  ],
  declarations: [ IngredientFormPage ]
})
export class IngredientFormPageModule {}
