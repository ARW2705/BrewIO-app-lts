/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule, FormTextAreaComponentModule } from '../../../form-elements/public';
import { DeleteButtonComponentModule, HeaderComponentModule } from '../../../shared/public';

/* Page imports */
import { NoteFormComponent } from './note-form.component';


@NgModule({
  imports: [
    CommonModule,
    DeleteButtonComponentModule,
    FormButtonsComponentModule,
    FormTextAreaComponentModule,
    FormsModule,
    HeaderComponentModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [
    NoteFormComponent
  ]
})
export class NoteFormComponentModule {}
