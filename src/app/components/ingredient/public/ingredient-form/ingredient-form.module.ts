/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule } from '../../../form-elements/public';
import { DeleteButtonComponentModule, HeaderComponentModule } from '../../../shared/public';
import { GrainFormComponentModule } from '../../private/grain-form/grain-form.module';
import { HopsFormComponentModule } from '../../private/hops-form/hops-form.module';
import { OtherIngredientsFormComponentModule } from '../../private/other-ingredients-form/other-ingredients-form.module';
import { YeastFormComponentModule } from '../../private/yeast-form/yeast-form.module';

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
