/* Module imports */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { from, Observable } from 'rxjs';

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
   * Get callback function for modal on dismiss; if a dismiss function was supplied to component
   * use that function, else use default onNoteModalDismiss function
   *
   * @param: [index] - optional array index that was modified
   *
   * @return: modal dismiss callback function
   */
  getModalDismissFn(index?: number): (date: object) => void {
    return this.dismissFn ? this.dismissFn(index) : this.onNoteModalDismiss(index);
  }

  /**
   * Get note form modal options
   *
   * @param: [index] - optional index to update
   *
   * @return: modal options object
   */
  getModalOptions(index?: number): object {
    return {
      noteType: this.recipeVariantId ? 'variant' : 'master',
      formMethod: index === undefined ? 'create' : 'update',
      toUpdate: index === undefined ? '' : this.notes[index]
    };
  }

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
      componentProps: this.getModalOptions(index)
    });
    from(modal.onDidDismiss()).subscribe(this.getModalDismissFn(index));
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
    const oneAndAHalfSeconds: number = 1500;
    this.patchRecipeNotes()
      .subscribe(
        (): void => {
          this.toastService.presentToast('Updated notes', oneAndAHalfSeconds, 'bottom');
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Other Functions *****/

}
