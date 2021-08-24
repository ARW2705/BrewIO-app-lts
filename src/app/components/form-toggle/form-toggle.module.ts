/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormToggleComponent } from './form-toggle.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    FormToggleComponent
  ],
  exports: [
    FormToggleComponent
  ]
})
export class FormToggleComponentModule {}
