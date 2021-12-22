/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Component imports */
import { NoteFormComponent } from '../note-form/note-form.component';

/* Service imports */
import { ErrorReportingService, ModalService } from '../../../../services/services';


@Component({
  selector: 'app-note-container',
  templateUrl: './note-container.component.html',
  styleUrls: ['./note-container.component.scss'],
})
export class NoteContainerComponent {
  @Input() isAddButtonDisabled: boolean;
  @Input() noteType: string;
  @Input() notes: string[];
  @Output() noteUpdateEvent: EventEmitter<string[]> = new EventEmitter<string[]>();

  constructor(
    public errorReporter: ErrorReportingService,
    public modalService: ModalService
  ) { }

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
    this.modalService.openModal<{ method: string, note: string }>(
      NoteFormComponent,
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
