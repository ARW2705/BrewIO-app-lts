/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule, FormInputComponentModule } from '../../../components/form-elements/public';
import { HeaderComponentModule } from '../../../components/shared/public';

/* Page imports */
import { ProcessMeasurementsFormPage } from './process-measurements-form.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormButtonsComponentModule,
    FormInputComponentModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponentModule
  ],
  declarations: [
    ProcessMeasurementsFormPage
  ]
})
export class ProcessMeasurementsFormPageModule {}
