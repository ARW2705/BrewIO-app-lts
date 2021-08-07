/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { PreferencesToggleComponent } from './preferences-toggle.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    PreferencesToggleComponent
  ],
  exports: [
    PreferencesToggleComponent
  ]
})
export class PreferencesToggleComponentModule {}
