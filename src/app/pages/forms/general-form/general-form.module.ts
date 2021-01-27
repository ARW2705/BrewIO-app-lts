import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GeneralFormPage } from './general-form.page';
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
