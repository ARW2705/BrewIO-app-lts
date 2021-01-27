/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { NoteListComponent } from './note-list.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    NoteListComponent
  ],
  exports: [
    NoteListComponent
  ]
})
export class NoteListComponentModule {}
