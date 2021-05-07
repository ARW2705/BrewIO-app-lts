/* Module imports */
import { Component, Input } from '@angular/core';

/* Component imports */
import { NoteListComponent } from '../../src/app/components/note-list/note-list.component';

@Component({
  selector: 'note-list',
  template: '',
  providers: [
    { provide: NoteListComponent, useClass: NoteListComponentStub }
  ]
})
export class NoteListComponentStub {
  @Input() dismissFn: (index?: number) => (data: object) => void;
  @Input() recipeMasterId: string;
  @Input() recipeVariantId: string;
  @Input() notes: string[] = [];
}
