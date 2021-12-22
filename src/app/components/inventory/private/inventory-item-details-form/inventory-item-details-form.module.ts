/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormImageComponentModule } from '../../../form-elements/public/form-image/form-image.module';
import { FormInputComponentModule } from '../../../form-elements/public/form-input/form-input.module';
import { FormSelectComponentModule } from '../../../form-elements/public/form-select/form-select.module';
import { FormTextAreaComponentModule } from '../../../form-elements/public/form-text-area/form-text-area.module';
import { InventoryItemDetailsFormComponent } from './inventory-item-details-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormImageComponentModule,
    FormInputComponentModule,
    FormSelectComponentModule,
    FormTextAreaComponentModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [ InventoryItemDetailsFormComponent ],
  exports: [ InventoryItemDetailsFormComponent ]
})
export class InventoryItemDetailsFormComponentModule {}
