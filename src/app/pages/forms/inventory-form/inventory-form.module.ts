/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormErrorComponentModule } from '../../../components/form-error/form-error.module';
import { HeaderComponentModule } from '../../../components/header/header.module';
import { QuantityHelperComponentModule } from '../../../components/quantity-helper/quantity-helper.module';

/* Page imports */
import { InventoryFormPage } from './inventory-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FormErrorComponentModule,
    HeaderComponentModule,
    QuantityHelperComponentModule
  ],
  declarations: [
    InventoryFormPage
  ]
})
export class InventoryFormPageModule {}
