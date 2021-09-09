/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { GeneralFormPage } from './general-form.page';

/* Component imports */
import { FormButtonsComponentModule } from '../../../components/form-buttons/form-buttons.module';
import { FormImageComponentModule } from '../../../components/form-image/form-image.module';
import { FormInputComponentModule } from '../../../components/form-input/form-input.module';
import { FormSelectComponentModule } from '../../../components/form-select/form-select.module';
import { FormToggleComponentModule } from '../../../components/form-toggle/form-toggle.module';
import { HeaderComponentModule } from '../../../components/header/header.module';


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
