/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { GeneralFormPage } from './general-form.page';

/* Component imports */
import { FormButtonsComponentModule, FormImageComponentModule, FormInputComponentModule, FormSelectComponentModule, FormToggleComponentModule } from '../../../components/form-elements/public';
import { HeaderComponentModule } from '../../../components/shared/public';


@NgModule({
  imports: [
    CommonModule,
    FormButtonsComponentModule,
    FormImageComponentModule,
    FormInputComponentModule,
    FormSelectComponentModule,
    FormToggleComponentModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponentModule
  ],
  declarations: [GeneralFormPage]
})
export class GeneralFormPageModule {}
