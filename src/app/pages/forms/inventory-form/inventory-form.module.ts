/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormErrorComponentModule } from '../../../components/form-error/form-error.module';
import { FormImageComponentModule } from '../../../components/form-image/form-image.module';
import { FormInputComponentModule } from '../../../components/form-input/form-input.module';
import { FormSelectComponentModule } from '../../../components/form-select/form-select.module';
import { FormTextAreaComponentModule } from '../../../components/form-text-area/form-text-area.module';
import { HeaderComponentModule } from '../../../components/header/header.module';

/* Page imports */
import { QuantityHelperPageModule } from '../../quantity-helper/quantity-helper.module';
import { InventoryFormPage } from './inventory-form.page';


@NgModule({
  imports: [
    CommonModule,
    FormErrorComponentModule,
    FormImageComponentModule,
    FormInputComponentModule,
    FormSelectComponentModule,
    FormTextAreaComponentModule,
    FormsModule,
    HeaderComponentModule,
    IonicModule,
    QuantityHelperPageModule,
    ReactiveFormsModule
  ],
  declarations: [
    InventoryFormPage
  ]
})
export class InventoryFormPageModule {}
