/* Module imports */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

/* Page imports */
import { NoteFormPage } from '../../../pages/forms/note-form/note-form.page';

/* Service imports */
import { ErrorReportingService, ModalService } from '../../../services/services';


@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss'],
})
export class NoteListComponent implements OnInit {
  @Input() noteType: string;
  @Input() notes: string[] = [];
  @Input() forceHide: boolean = false;
  @Output() noteUpdateEvent: EventEmitter<string[]> = new EventEmitter<string[]>();

  constructor(
    public errorReporter: ErrorReportingService,
    public modalService: ModalService
  ) { }

  ngOnInit() {
    console.log('force hide', this.forceHide, this.noteType, this.notes);
  }

  /**
   * Get note form modal options
   *
   * @param: [index] - optional index to update
   * @return: modal options object
   */
  getModalOptions(index?: number): object {
    return {
      noteType: this.noteType,
      formMethod: index === undefined ? 'create' : 'update',
      toUpdate: index === undefined ? '' : this.notes[index]
    };
  }

  /**
   * Open note modal
   *
   * @param: [index] - optional index for update/delete operation; undefined to
   * add a new note
   * @return: none
   */
  openNoteModal(index?: number): void {
    console.log('open note modal', index);
    this.modalService.openModal<{ method: string, note: string }>(
      NoteFormPage,
      this.getModalOptions(index)
    )
    .subscribe(
      (update: { method: string, note: string }): void => {
        if (update) {
          if (update.method === 'create') {
            this.notes.push(update.note);
          } else if (update.method === 'update') {
            this.notes[index] = update.note;
          } else if (update.method === 'delete') {
            this.notes.splice(index, 1);
          }
          this.noteUpdateEvent.emit(this.notes);
        }
      },
      (error: Error): void => this.errorReporter.handleUnhandledError(error)
    );
  }

}
