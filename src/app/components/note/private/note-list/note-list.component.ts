/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss'],
})
export class NoteListComponent {
  @Input() noteType: string;
  @Input() notes: string[] = [];
  @Output() openNoteModalEvent: EventEmitter<number> = new EventEmitter<number>();

  openNoteModal(index: number): void {
    this.openNoteModalEvent.emit(index);
  }
}