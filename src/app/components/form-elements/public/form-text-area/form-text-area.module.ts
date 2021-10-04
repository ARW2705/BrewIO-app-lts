/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormErrorComponentModule } from '../../private/form-error/form-error.module';
import { FormTextAreaComponent } from './form-text-area.component';


@NgModule({
  imports: [
    CommonModule,
    FormErrorComponentModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    FormTextAreaComponent
  ],
  exports: [
    FormTextAreaComponent
  ]
})
export class FormTextAreaComponentModule {}
