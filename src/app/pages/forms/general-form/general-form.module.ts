/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { GeneralFormPage } from './general-form.page';

/* Component imports */
import { FormErrorComponentModule } from '../../../components/form-error/form-error.module';
import { HeaderComponentModule } from '../../../components/header/header.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FormErrorComponentModule,
    HeaderComponentModule
  ],
  declarations: [GeneralFormPage]
})
export class GeneralFormPageModule {}
