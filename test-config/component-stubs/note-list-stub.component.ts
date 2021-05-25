/* Module imports */
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Service imports */
import { RecipeService } from '../../src/app/services/recipe/recipe.service';
import { ToastService } from '../../src/app/services/toast/toast.service';

/* Component imports */
import { NoteListComponent } from '../../src/app/components/note-list/note-list.component';

@Component({
  selector: 'note-list',
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
