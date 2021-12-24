/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { NoteListComponentModule } from '@components/note/private/note-list/note-list.module';
import { NoteFormComponentModule } from '@components/note/public/note-form/note-form.module';
import { NoteContainerComponent } from './note-container.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    NoteListComponentModule,
    NoteFormComponentModule
  ],
  declarations: [
    NoteContainerComponent
  ],
  exports: [
    NoteContainerComponent
  ]
})
export class NoteContainerComponentModule {}
