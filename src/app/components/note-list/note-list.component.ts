/* Module imports */
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, from } from 'rxjs';

/* Interface imports */
import { RecipeMaster, RecipeVariant } from '../../shared/interfaces';

/* Page imports */
import { NoteFormPage } from '../../pages/forms/note-form/note-form.page';

/* Service imports */
import { ErrorReportingService, RecipeService, ToastService } from '../../services/services';


@Component({
  selector: 'note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss'],
})
export class NoteListComponent implements OnInit, OnDestroy {
  @Input() dismissFn: (index?: number) => (data: object) => void;
  @Input() recipeMasterId: string;
  @Input() recipeVariantId: string;
  @Input() notes: string[] = [];

  constructor(
    public errorReporter: ErrorReportingService,
    public modalCtrl: ModalController,
    public recipeService: RecipeService,
    public toastService: ToastService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    console.log('note list component init');
  }

  ngOnDestroy(): void {
    console.log('note list component destroy');
  }

  /***** End Lifecycle Hooks *****/

  /**
   * Handle note modal returned data
   *
   * @params: [index] - the index to update/delete or to add if undefined
   *
   * @return: callback function for modal onDidDismiss
   */
  onNoteModalDismiss(index?: number): (data: object) => void {
    return (data: object): void => {
      const _data: object = data['data'];
      if (_data) {
        if (_data['method'] === 'create') {
          this.notes.push(_data['note']);
        } else if (_data['method'] === 'update') {
          this.notes[index] = _data['note'];
        } else if (_data['method'] === 'delete') {
          this.notes.splice(index, 1);
        }
        this.submitUpdatedNotes();
      }
    };
  }

  /**
   * Open note modal
   *
   * @params: [index] - optional index for update/delete operation; undefined to
   * add a new note
   *
   * @return: none
   */
  async openNoteModal(index?: number): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: NoteFormPage,
      componentProps: {
        noteType: this.recipeVariantId ? 'variant' : 'master',
        formMethod: index === undefined ? 'create' : 'update',
        toUpdate: index === undefined ? '' : this.notes[index]
      }
    });

    const dismissFn: (data: object) => void = this.dismissFn
      ? this.dismissFn(index)
      : this.onNoteModalDismiss(index);

    from(modal.onDidDismiss()).subscribe(dismissFn);

    return await modal.present();
  }

  /***** End Modal Functions *****/


  /***** Other Functions *****/

  /**
   * Update the recipe master or variant notes
   *
   * @params: none
   *
   * @return: observable of update results
   */
  patchRecipeNotes(): Observable<RecipeMaster | RecipeVariant> {
    if (this.recipeVariantId) {
      return this.recipeService.updateRecipeVariantById(
        this.recipeMasterId,
        this.recipeVariantId,
        { notes: this.notes }
      );
    } else {
      return this.recipeService.updateRecipeMasterById(
        this.recipeMasterId,
        { notes: this.notes }
      );
    }
  }

  /**
   * Submit updated notes
   *
   * @params: none
   * @return: none
   */
  submitUpdatedNotes(): void {
    this.patchRecipeNotes()
      .subscribe(
        (): void => {
          console.log('notes submitted');
          this.toastService.presentToast(
            'Updated notes',
            1500,
            'bottom'
          );
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Other Functions *****/

}
