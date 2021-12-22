/* Module imports */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Service imports */
import { ErrorReportingService, RecipeService, ToastService } from '../../src/app/services/services';

/* Component imports */
import { NoteListComponent } from '../../src/app/components/note/private/note-list/note-list.component';

@Component({
  selector: 'app-note-list',
  template: '',
  providers: [
    { provide: NoteListComponent, useClass: NoteListComponentStub }
  ]
})
export class NoteListComponentStub implements OnInit, OnDestroy {
  @Input() dismissFn: (index?: number) => (data: object) => void;
  @Input() recipeMasterId: string;
  @Input() recipeVariantId: string;
  @Input() notes: string[] = [];

  constructor(
    public errorReporter: ErrorReportingService,
    public modalCtrl: ModalController,
    public recipeService: RecipeService,
    public toastService: ToastService
  ) {}

  ngOnInit() {}

  ngOnDestroy() {}

  onNoteModalDismiss(...options: any[]): any {}
  openNoteModal(...options: any[]): any {}
  patchRecipeNotes(): any {}
  submitUpdatedNotes(): any {}
}
