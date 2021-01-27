/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { HeaderComponentModule } from '../../../components/header/header.module';
import { FormErrorComponentModule } from '../../../components/form-error/form-error.module';

/* Page imports */
import { ProcessFormPage } from './process-form.page';


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
    ProcessFormPage
  ]
})
export class ProcessFormPageModule {}
