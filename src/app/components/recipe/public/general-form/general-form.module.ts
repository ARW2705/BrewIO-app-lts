/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { GeneralFormComponent } from './general-form.component';

/* Component imports */
import { FormButtonsComponentModule, FormImageComponentModule, FormInputComponentModule, FormSelectComponentModule, FormToggleComponentModule } from '../../../form-elements/public';
import { HeaderComponentModule } from '../../../shared/public';


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
  declarations: [GeneralFormComponent]
})
export class GeneralFormComponentModule {}
