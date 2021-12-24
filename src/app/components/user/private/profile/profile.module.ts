/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormImageComponentModule, FormInputComponentModule } from '@components/form-elements/public';
import { ProfileComponent } from './profile.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
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
