/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule, FormTextAreaComponentModule } from '../../../components/form-elements/public';
import { DeleteButtonComponentModule, HeaderComponentModule } from '../../../components/shared/public';

/* Page imports */
import { NoteFormPage } from './note-form.page';


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
    NoteFormPage
  ]
})
export class NoteFormPageModule {}
