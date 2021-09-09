/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormErrorComponentModule } from '../form-error/form-error.module';
import { FormImageComponentModule } from '../form-image/form-image.module';
import { FormInputComponentModule } from '../form-input/form-input.module';
import { ProfileComponent } from './profile.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormErrorComponentModule,
    FormImageComponentModule,
    FormInputComponentModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ProfileComponent
  ],
  exports: [
    ProfileComponent
  ]
})
export class ProfileComponentModule {}
