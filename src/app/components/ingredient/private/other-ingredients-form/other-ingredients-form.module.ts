/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormInputComponentModule } from '../../../form-elements/public/form-input/form-input.module';
import { OtherIngredientsFormComponent } from './other-ingredients-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormInputComponentModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [
    OtherIngredientsFormComponent
  ],
  exports: [
    OtherIngredientsFormComponent
  ]
})
export class OtherIngredientsFormComponentModule {}
