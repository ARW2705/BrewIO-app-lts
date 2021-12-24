/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormInputComponentModule } from '@components/form-elements/public/form-input/form-input.module';
import { FormSelectComponentModule } from '@components/form-elements/public/form-select/form-select.module';
import { GrainFormComponent } from './grain-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormInputComponentModule,
    FormSelectComponentModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [ GrainFormComponent ],
  exports: [ GrainFormComponent ]
})
export class GrainFormComponentModule {}
