/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { PreferencesSelectComponentModule } from '../preferences-select/preferences-select.module';
import { PreferencesToggleComponentModule } from '../preferences-toggle/preferences-toggle.module';
import { PreferencesComponent } from './preferences.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    PreferencesSelectComponentModule,
    PreferencesToggleComponentModule,
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
