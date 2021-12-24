/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormSelectComponentModule } from '@components/form-elements/public/form-select/form-select.module';
import { FormToggleComponentModule } from '@components/form-elements/public/form-toggle/form-toggle.module';
import { PreferencesComponent } from './preferences.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    FormSelectComponentModule,
    FormToggleComponentModule,
    ReactiveFormsModule
  ],
  declarations: [
    PreferencesComponent
  ],
  exports: [
    PreferencesComponent
  ]
})
export class PreferencesComponentModule {}
