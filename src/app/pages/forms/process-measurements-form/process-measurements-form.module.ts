/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { HeaderComponentModule } from '../../../components/header/header.module';
import { FormErrorComponentModule } from '../../../components/form-error/form-error.module';

/* Page imports */
import { ProcessMeasurementsFormPage } from './process-measurements-form.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponentModule,
    FormErrorComponentModule
  ],
  declarations: [
    ProcessMeasurementsFormPage
  ]
})
export class ProcessMeasurementsFormPageModule {}
