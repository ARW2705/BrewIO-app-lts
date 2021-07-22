/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { HeaderComponentModule } from '../../../components/header/header.module';

/* Page imports */
import { NoteFormPage } from './note-form.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponentModule
  ],
  declarations: [
    NoteFormPage
  ]
})
export class NoteFormPageModule {}
