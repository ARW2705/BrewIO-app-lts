/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule, FormInputComponentModule } from '../../../form-elements/public';

/* Page imports */
import { ProcessMeasurementsFormComponent } from './process-measurements-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormButtonsComponentModule,
    FormInputComponentModule,
    ReactiveFormsModule,
    IonicModule
  ],
  declarations: [
    ProcessMeasurementsFormComponent
  ]
})
export class ProcessMeasurementsFormComponentModule {}
