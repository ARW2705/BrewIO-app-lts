/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { PreferencesComponent } from './preferences.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
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
