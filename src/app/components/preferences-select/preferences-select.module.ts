/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { PreferencesSelectComponent } from './preferences-select.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    PreferencesSelectComponent
  ],
  exports: [
    PreferencesSelectComponent
  ]
})
export class PreferencesSelectComponentModule {}
