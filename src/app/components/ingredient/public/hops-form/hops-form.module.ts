/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormInputComponentModule } from '../../../form-elements/public/form-input/form-input.module';
import { FormSelectComponentModule } from '../../../form-elements/public/form-select/form-select.module';
import { FormToggleComponentModule } from '../../../form-elements/public/form-toggle/form-toggle.module';
import { HopsFormComponent } from './hops-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormInputComponentModule,
    FormSelectComponentModule,
    FormsModule,
    FormToggleComponentModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [
    HopsFormComponent
  ],
  exports: [
    HopsFormComponent
  ]
})
export class HopsFormComponentModule {}
