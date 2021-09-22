/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormInputComponentModule } from '../form-input/form-input.module';
import { FormSelectComponentModule } from '../form-select/form-select.module';
import { FormToggleComponentModule } from '../form-toggle/form-toggle.module';
import { YeastFormComponent } from './yeast-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormInputComponentModule,
    FormSelectComponentModule,
    FormToggleComponentModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [
    YeastFormComponent
  ],
  exports: [
    YeastFormComponent
  ]
})
export class YeastFormComponentModule {}
