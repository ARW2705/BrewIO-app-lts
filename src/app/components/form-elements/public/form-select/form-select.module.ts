/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormErrorComponentModule } from '@components/form-elements/private/form-error/form-error.module';
import { FormSelectComponent } from './form-select.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormErrorComponentModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    FormSelectComponent
  ],
  exports: [
    FormSelectComponent
  ]
})
export class FormSelectComponentModule {}
