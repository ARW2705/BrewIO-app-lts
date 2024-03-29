/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule } from '@components/form-elements/public';
import { DeleteButtonComponentModule, HeaderComponentModule } from '@components/shared/public';
import { GrainFormComponentModule } from '@components/ingredient/private/grain-form/grain-form.module';
import { HopsFormComponentModule } from '@components/ingredient/private/hops-form/hops-form.module';
import { OtherIngredientsFormComponentModule } from '@components/ingredient/private/other-ingredients-form/other-ingredients-form.module';
import { YeastFormComponentModule } from '@components/ingredient/private/yeast-form/yeast-form.module';

/* Page imports */
import { IngredientFormComponent } from './ingredient-form.component';


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
  declarations: [ IngredientFormComponent ]
})
export class IngredientFormComponentModule {}
