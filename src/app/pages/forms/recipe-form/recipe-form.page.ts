/* Module imports */
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Navigation } from '@angular/router';
import { ModalController, IonContent } from '@ionic/angular';
import { Observable, Subject, from, throwError } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

/* Interface imports */
import { Grains, Hops, Yeast, Style } from '../../../shared/interfaces/library';
import { GrainBill } from '../../../shared/interfaces/grain-bill';
import { HopsSchedule } from '../../../shared/interfaces/hops-schedule';
import { OtherIngredients } from '../../../shared/interfaces/other-ingredients';
import { Process } from '../../../shared/interfaces/process';
import { RecipeMaster } from '../../../shared/interfaces/recipe-master';
import { RecipeVariant } from '../../../shared/interfaces/recipe-variant';
import { SelectedUnits } from '../../../shared/interfaces/units';
import { YeastBatch } from '../../../shared/interfaces/yeast-batch';

/* Default imports */
import { defaultRecipeMaster } from '../../../shared/defaults/default-recipe-master';
import { defaultStyle } from '../../../shared/defaults/default-style';

/* Utility function imports */
import { clone } from '../../../shared/utility-functions/clone';
import { getId } from '../../../shared/utility-functions/id-helpers';
import { stripSharedProperties } from '../../../shared/utility-functions/strip-shared-properties';
import { roundToDecimalPlace } from '../../../shared/utility-functions/utilities';

/* Page imports */
import { GeneralFormPage } from '../general-form/general-form.page';
import { IngredientFormPage } from '../ingredient-form/ingredient-form.page';
import { ProcessFormPage } from '../process-form/process-form.page';

import { NoteListComponent } from '../../../components/note-list/note-list.component';

/* Service imports */
import { ActionSheetService } from '../../../services/action-sheet/action-sheet.service';
import { CalculationsService } from '../../../services/calculations/calculations.service';
import { ClientIdService } from '../../../services/client-id/client-id.service';
import { LibraryService } from '../../../services/library/library.service';
import { PreferencesService } from '../../../services/preferences/preferences.service';
import { RecipeService } from '../../../services/recipe/recipe.service';
import { ToastService } from '../../../services/toast/toast.service';


@Component({
  selector: 'page-recipe-form',
  templateUrl: './recipe-form.page.html',
  styleUrls: ['./recipe-form.page.scss']
})
export class RecipeFormPage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) ionContent: IonContent;
  @ViewChild('noteList') noteList: NoteListComponent;
  destroy$: Subject<boolean> = new Subject<boolean>();
  defaultStyle: Style = defaultStyle();
  docMethod: string = '';
  formType: string = null;
  grainsLibrary: Grains[] = null;
  hopsLibrary: Hops[] = null;
  isLoaded: boolean = false;
  isGeneralFormComplete: boolean = false;
  master: RecipeMaster = null;
  onNoteDismiss: (index?: number) => (data: object) => void;
  onRecipeAction: (actionName: string, options?: any[]) => void;
  previousRoute: string = '/tabs/recipe';
  recipeActions: object = {
    openIngredientFormModal: this.openIngredientFormModal.bind(this),
    openNoteModal: this.openNoteModal.bind(this),
    openProcessModal: this.openProcessModal.bind(this),
    onReorder: this.onReorder.bind(this)
  };
  refreshPipes: boolean = false;
  styleLibrary: Style[] = null;
  submitSuccessMessage: string = '';
  textarea: string = '';
  title: string = '';
  units: SelectedUnits = null;
  variant: RecipeVariant = null;
  yeastLibrary: Yeast[] = null;


  constructor(
    public actionService: ActionSheetService,
    public calculator: CalculationsService,
    public clientIdService: ClientIdService,
    public libraryService: LibraryService,
    public modalCtrl: ModalController,
    public preferenceService: PreferencesService,
    public recipeService: RecipeService,
    public route: ActivatedRoute,
    public router: Router,
    public toastService: ToastService
  ) {
    this.onNoteDismiss = this.onNoteModalDismiss.bind(this);
    this.onRecipeAction = this.onRecipeActionHandler.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('recipe form page init');
    this.units = this.preferenceService.getSelectedUnits();
    this.getAllLibraries();
    this.listenForRoute();
  }

  ngOnDestroy() {
    console.log('recipe form page destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  ionViewDidLeave() {
    console.log('recipe form page did leave');
    this.ionContent.scrollToTop();
  }

  /***** End lifecycle hooks *****/


  /***** Initializations *****/

  /**
   * Get style and ingredient libraries
   *
   * @params: none
   * @return: none
   */
  getAllLibraries(): void {
    this.libraryService.getAllLibraries()
      .subscribe(
        (libraries: (Grains[] | Hops[] | Yeast[] | Style[])[]): void => {
          const [grainsLibrary, hopsLibrary, yeastLibrary, styleLibrary] = libraries;
          this.grainsLibrary = <Grains[]>grainsLibrary;
          this.hopsLibrary = <Hops[]>hopsLibrary;
          this.yeastLibrary = <Yeast[]>yeastLibrary;
          this.styleLibrary = <Style[]>styleLibrary;
        },
        (error: string): void => {
          console.log('Library error', error);
          this.onInitError('Error loading ingredient libraries');
        }
      );
  }

  /**
   * Listen for changes in route query params and
   * configure form according to navigation extras state
   *
   * @params: none
   * @return: none
   */
  listenForRoute(): void {
    this.route.queryParams
      .pipe(
        takeUntil(this.destroy$),
        map((): Observable<never> => {
          try {
            const nav: Navigation = this.router.getCurrentNavigation();
            const options: object = nav.extras.state;
            this.setFormTypeConfiguration(
              options['formType'],
              options['docMethod'],
              options['masterData'],
              options['variantData']
            );
            this.isLoaded = true;
            this.refreshPipes = !this.refreshPipes;
          } catch (error) {
            console.log('Navigation/Setup error', error);
            return throwError(error);
          }
        })
      )
      .subscribe(
        (): void => {},
        (error: string): void => this.onInitError(error)
      );
  }

  /**
   * Compose configuration error message
   *
   * @params: none
   *
   * @return: error message to be displayed
   */
  onConfigError(): string {
    let message: string = 'Error:';

    if (!this.isValidDocMethod()) {
      message += ` invalid document method: '${this.docMethod}';`;
    }
    if (!this.isValidFormType()) {
      message += ` invalid form type: '${this.formType}';`;
    }

    return message;
  }

  /**
   * Present toast errors on initialization error
   * then navigate to previous route on toast dismiss
   *
   * @params: message - error message to display
   *
   * @return: none
   */
  onInitError(message: string): void {
    this.toastService.presentErrorToast(
      message,
      this.navToPreviousRoute.bind(this)
    );
  }

  /***** End Initializations *****/


  /***** Modals *****/

  /**
   * Configure options for general form modal
   *
   * @params: none
   *
   * @return: configuration object
   */
  getGeneralFormModalOptions(): object {
    const data: object = {
      formType: this.formType,
      docMethod: this.docMethod,
      data: this.getGeneralFormModalUpdateData()
    };

    if (!this.isGeneralFormComplete && this.formType === 'master') {
      data['styles'] = this.styleLibrary;
    } else if (this.isGeneralFormComplete) {
      if (this.formType === 'master') {
        data['data']['name'] = this.master.name;
        data['styles'] = this.styleLibrary;
      } else {
        data['data']['variantName'] = this.variant.variantName;
      }
    }

    return data;
  }

  /**
   * Handle returned data from general form modal
   *
   * @params: none
   *
   * @return: callback function for modal onDidDismiss
   */
  onGeneralFormModalDismiss(): (data: object) => void {
    return (data: object): void => {
      const _data: object = data['data'];
      if (_data) {
        this.isGeneralFormComplete = true;
        this.updateDisplay(_data);
        this.updateRecipeValues();
        this.autoSetMashDuration(_data['mashDuration']);
        this.autoSetBoilDuration(_data['boilDuration']);
      }
    };
  }

  /**
   * Get current values to be filled in as overrides
   * for default values on the general form
   *
   * @params: none
   *
   * @return: current form values to fill in if updating
   * the general info; else null
   */
  getGeneralFormModalUpdateData(): object {
    if (this.isGeneralFormComplete || this.formType !== 'master') {
      return {
        style: this.master.style,
        brewingType: this.variant.brewingType,
        mashDuration: this.variant.mashDuration,
        boilDuration: this.variant.boilDuration,
        batchVolume: this.variant.batchVolume,
        boilVolume: this.variant.boilVolume,
        efficiency: this.variant.efficiency,
        mashVolume: this.variant.mashVolume,
        isFavorite: this.variant.isFavorite,
        isMaster: this.variant.isMaster
      };
    }
    return null;
  }

  /**
   * Open general recipe form modal - pass current data for update, if present
   *
   * @params: none
   * @return: none
   */
  async openGeneralFormModal(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl
      .create({
        component: GeneralFormPage,
        componentProps: this.getGeneralFormModalOptions()
      });

    from(modal.onDidDismiss()).subscribe(this.onGeneralFormModalDismiss());

    return await modal.present();
  }

  /**
   * Configure ingredient form modal options
   *
   * @params: type - the ingredient type
   * @params: [toUpdate] - optional current ingredient data to edit or delete
   *
   * @return: configuration object
   */
  getIngredientFormModalOptions(
    type: string,
    toUpdate?: GrainBill | HopsSchedule | YeastBatch | OtherIngredients
  ): object {
    const data: object = {
      ingredientType: type,
      update: toUpdate,
      boilTime: this.variant.boilDuration
    };

    if (type === 'grains') {
      data['ingredientLibrary'] = this.grainsLibrary;
    } else if (type === 'hops') {
      data['ingredientLibrary'] = this.hopsLibrary;
    } else if (type === 'yeast') {
      data['ingredientLibrary'] = this.yeastLibrary;
    }
    // No additional data needed for an 'other ingredient'

    return data;
  }

  /**
   * Handle ingredient form modal returned data
   *
   * @params: type - the ingredient type ('grains', 'hops', etc)
   * @params: [toUpdate] - optional current ingredient data to edit or delete
   *
   * @return: callback function for modal onDidDismiss
   */
  onIngredientFormModalDismiss(
    type: string,
    toUpdate?: GrainBill | HopsSchedule | YeastBatch | OtherIngredients
  ): (data: object) => void {
    return (data: object): void => {
      const _data: object = data['data'];
      if (_data) {
        this.updateIngredientList(_data, type, toUpdate, _data['delete']);
        this.updateRecipeValues();
        if (type === 'hops') {
          this.autoSetHopsAdditions();
        }
      }
    };
  }

  /**
   * Open modal to create, edit, or delete specified ingredient type
   *
   * @params: type - the ingredient type ('grains', 'hops', etc)
   * @params: [toUpdate] - current ingredient data to edit or delete
   *
   * @return: none
   */
  async openIngredientFormModal(
    type: string,
    toUpdate?: GrainBill | HopsSchedule | YeastBatch | OtherIngredients
  ): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: IngredientFormPage,
      componentProps: this.getIngredientFormModalOptions(type, toUpdate)
    });

    from(modal.onDidDismiss())
      .subscribe(this.onIngredientFormModalDismiss(type, toUpdate));

    return await modal.present();
  }

  /**
   * Handle note modal returned data
   *
   * @params: [index] - optional index to update/delete or to add if undefined
   *
   * @return: callback function for modal onDidDismiss
   */
  onNoteModalDismiss(index?: number): (data: object) => void {
    return (data: object): void => {
      const _data: object = data['data'];

      if (_data) {
        const notes: string[] = this.formType === 'master'
          ? this.master.notes
          : this.variant.notes;

        if (_data['method'] === 'create') {
          notes.push(_data['note']);
        } else if (_data['method'] === 'update') {
          notes[index] = _data['note'];
        } else if (_data['method'] === 'delete') {
          notes.splice(index, 1);
        }
      }
    };
  }

  /**
   * Call the note list open the note modal method
   *
   * @params: none
   * @return: none
   */
  openNoteModal(): void {
    this.noteList.openNoteModal();
  }

  /**
   * Configure process form modal options
   *
   * @params: type - the process type ('manual', 'timer', or 'calendar')
   * @params: [toUpdate] - optional current process data to edit or delete
   *
   * @return: configuration object
   */
  getProcessFormModalOptions(type: string, toUpdate?: Process): object {
    return {
      processType: toUpdate ? toUpdate['type'] : type,
      update: toUpdate,
      formMode: toUpdate ? 'update' : 'create'
    };
  }

  /**
   * Handle process form modal returned data
   *
   * @params: index - the index to update/delete or to add if undefined
   *
   * @return: callback function for modal onDidDismiss
   */
  onProcessFormModalDismiss(index: number): (data: object) => void {
    return (data: object): void => {
      const _data: object = data['data'];

      if (_data) {
        if (_data['delete']) {
          this.variant.processSchedule.splice(index, 1);
        } else if (_data['update']) {
          this.variant.processSchedule[index] = _data['update'];
        } else {
          this.variant.processSchedule.push(<Process>_data);
        }
      }
    };
  }

  /**
   * Open modal to create, edit, or delete specified process step type
   *
   * @params: type - the process type ('manual', 'timer', or 'calendar')
   * @params: [toUpdate] - optional current step data to be edited or deleted
   * @params: [index] - optional index of step
   *
   * @return: none
   */
  async openProcessModal(
    type: string,
    toUpdate?: Process,
    index?: number
  ): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: ProcessFormPage,
      componentProps: this.getProcessFormModalOptions(type, toUpdate)
    });

    from(modal.onDidDismiss()).subscribe(this.onProcessFormModalDismiss(index));

    return await modal.present();
  }

  /***** End Modals *****/


  /***** Action Sheets *****/

  /**
   * Open ingredient form action sheet to select ingredient type to open
   *
   * @params: none
   * @return: none
   */
  openIngredientActionSheet(): void {
    this.actionService.openActionSheet(
      'Select an Ingredient',
      [
        {
          text: 'Grains',
          handler: (): void => {
            this.openIngredientFormModal('grains');
          }
        },
        {
          text: 'Hops',
          handler: (): void => {
            this.openIngredientFormModal('hops');
          }
        },
        {
          text: 'Yeast',
          handler: (): void => {
            this.openIngredientFormModal('yeast');
          }
        },
        {
          text: 'Other',
          handler: (): void => {
            this.openIngredientFormModal('otherIngredients');
          }
        }
      ]
    );
  }

  /**
   * Open action sheet to select the type of process step to add
   *
   * @params: none
   * @return: none
   */
  openProcessActionSheet(): void {
    this.actionService.openActionSheet(
      'Add a process step',
      [
        {
          text: 'Manual',
          handler: (): void => {
            this.openProcessModal('manual');
          }
        },
        {
          text: 'Timer',
          handler: (): void => {
            this.openProcessModal('timer');
          }
        },
        {
          text: 'Calendar',
          handler: (): void => {
            this.openProcessModal('calendar');
          }
        }
      ]
    );
  }

  /***** End Action Sheets *****/


  /***** Form value auto-generation *****/

  /**
   * Generate timer process steps for boil step; update duration on form update
   *
   * @params: boilDuration - boil duration time in minutes
   *
   * @return: none
   */
  autoSetBoilDuration(boilDuration: number): void {
    const boilIndex: number = this.getProcessIndex('name', 'Boil');

    if (boilIndex === -1) {
      this.variant.processSchedule.push({
        cid: this.clientIdService.getNewId(),
        type: 'timer',
        name: 'Boil',
        description: 'Boil wort',
        duration: boilDuration,
        concurrent: false,
        splitInterval: 1
      });
    } else {
      const boilStep: Process = this.variant.processSchedule[boilIndex];
      if (boilStep.duration !== boilDuration) {
        boilStep.duration = boilDuration;
        this.autoSetHopsAdditions();
      }
    }
  }

  /**
   * Get the index of process schedule where
   * given field value matches the search term
   *
   * @params: searchField - the process property in which to check for value
   * @params: searchTerm - the value to compare
   *
   * @return: index number in process schedule; -1 if not found
   */
  getProcessIndex(searchField: string, searchTerm: string): number {
    return this.variant.processSchedule
      .findIndex((process: Process): boolean => {
        return process[searchField] === searchTerm;
      });
  }

  /**
   * Generate timer process step for hops additions
   * If the boil step has not been set, do not add the timer
   *
   * @params: none
   * @return: none
   */
  autoSetHopsAdditions(): void {
    const boilIndex: number = this.getProcessIndex('name', 'Boil');

    if (boilIndex !== -1) {
      // remove existing hops timers
      this.variant.processSchedule = this.variant.processSchedule
        .filter((process: Process): boolean => {
          return !process.name.match(/^(Add).*(hops)$/);
        });

      const newBoilIndex: number = this.getProcessIndex('name', 'Boil');

      const preAdditionSchedule: Process[] = this.variant.processSchedule
        .splice(0, newBoilIndex);

      const hopsProcesses: Process[] = this.generateHopsProcesses();

      this.variant.processSchedule = preAdditionSchedule
        .concat(hopsProcesses)
        .concat(this.variant.processSchedule);

      // set boil step timer as concurrent is timers were added
      this.variant.processSchedule[newBoilIndex + hopsProcesses.length].concurrent
        = !!hopsProcesses.length;
    }
  }

  /**
   * Generate timer process steps for mash step; update duration on form update
   *
   * @params: mashDuration - mash duration time in minutes
   *
   * @return: none
   */
  autoSetMashDuration(mashDuration: number): void {
    const mashIndex: number = this.getProcessIndex('name', 'Mash');

    if (mashIndex === -1) {
      this.variant.processSchedule.push({
        cid: this.clientIdService.getNewId(),
        type: 'timer',
        name: 'Mash',
        description: 'Mash grains',
        duration: mashDuration,
        concurrent: false,
        splitInterval: 1
      });
    } else {
      this.variant.processSchedule[mashIndex].duration = mashDuration;
    }
  }

  /**
   * Format the hops description
   * Convert the hops quantity based on current selected units
   *
   * @params: hops - the hops schedule instance to base the description on
   *
   * @return: formatted description e.g. 'Hops addition: 0.5oz'
   */
  formatHopsDescription(hops: HopsSchedule): string {
    let hopsQuantity: number = hops.quantity;
    if (this.calculator.requiresConversion('weightSmall', this.units)) {
      hopsQuantity = this.calculator.convertWeight(hops.quantity, false, false);
    }
    hopsQuantity = roundToDecimalPlace(hopsQuantity, 2);
    return `Hops addition: ${hopsQuantity}${this.units.weightSmall.shortName}`;
  }

  /**
   * Create new timer processes from hops array
   *
   * @params: none
   *
   * @return: array of new timer processes
   */
  generateHopsProcesses(): Process[] {
    return this.variant.hops
      .filter((hops: HopsSchedule): boolean => !hops.dryHop)
      .sort((h1: HopsSchedule, h2: HopsSchedule): number => {
        return h2.duration - h1.duration;
      })
      .map((hopsAddition: HopsSchedule): Process => {
        return {
          cid: this.clientIdService.getNewId(),
          type: 'timer',
          name: `Add ${hopsAddition.hopsType.name} hops`,
          concurrent: true,
          description: this.formatHopsDescription(hopsAddition),
          duration: this.variant.boilDuration - hopsAddition.duration
        };
      });
  }

  /***** End form value auto-generation *****/


  /***** Form data handling *****/

  /**
   * Format form data for recipe based on whether formType is 'master'
   * or 'variant' and whether docMethod is 'create' or 'update'
   *
   * @params: none
   *
   * @return: structured form data for service
   */
  constructPayload(): object {
    let payload: object;

    if (this.formType === 'master') {
      if (this.docMethod === 'create') {
        payload = {
          master: {
            name: this.master.name,
            style: this.master.style,
            notes: this.master.notes,
            isPublic: this.master.isPublic,
          },
          variant: this.variant
        };
      } else {
        payload = {
          name: this.master.name,
          style: this.master.style,
          notes: this.master.notes,
          isPublic: this.master.isPublic
        };
      }
    } else {
      payload = this.variant;
    }

    return payload;
  }

  /**
   * Initialize the recipe form for a new recipe master using default values
   *
   * @params: none
   * @return: none
   */
  initCreateMasterForm(): void {
    this.submitSuccessMessage = 'New Recipe Created';
    const _defaultRecipeMaster: RecipeMaster = defaultRecipeMaster();
    this.isGeneralFormComplete = false;
    this.title = 'Create Recipe';
    this.master = _defaultRecipeMaster;
    this.variant = _defaultRecipeMaster.variants[0];
    this.previousRoute = '/tabs/recipe';
  }

  /**
   * Initialize the recipe form for a new recipe variant based on recipe master
   *
   * @params: recipeMaster - the recipe master on which the variant
   * will be added to and based on
   *
   * @return: none
   */
  initCreateVariantForm(recipeMaster: RecipeMaster): void {
    this.submitSuccessMessage = 'New Variant Created';
    this.isGeneralFormComplete = false;
    this.title = 'Add Variant';
    this.master = recipeMaster;
    this.variant = clone(
      recipeMaster.variants.find((variant: RecipeVariant): boolean => variant.isMaster)
    );
    this.variant.notes = [];
    stripSharedProperties(this.variant);
    this.variant.variantName = '';
    this.previousRoute = `/tabs/recipe/${getId(this.master)}`;
  }

  /**
   * Initialize the recipe form to update a recipe master
   *
   * @params: recipeMaster - the recipe master to update
   *
   * @return: none
   */
  initUpdateMasterForm(recipeMaster: RecipeMaster): void {
    this.submitSuccessMessage = 'Recipe Update Successful';
    this.isGeneralFormComplete = true;
    this.title = 'Update Recipe';
    this.master = clone(recipeMaster);
    this.variant = clone(
      recipeMaster.variants.find((variant: RecipeVariant): boolean => variant.isMaster)
    );
    this.previousRoute = `/tabs/recipe/${getId(this.master)}`;
  }

  /**
   * Initialize the recipe form to udpate a recipe variant
   *
   * @params: recipeMaster - the recipe master that contains the variant to update
   * @params: recipeVariant - the recipe variant to update
   *
   * @return: none
   */
  initUpdateVariantForm(
    recipeMaster: RecipeMaster,
    recipeVariant: RecipeVariant
  ): void {
    this.submitSuccessMessage = 'Variant Update Successful';
    this.isGeneralFormComplete = true;
    this.title = 'Update Variant';
    this.master = clone(recipeMaster);
    this.variant = clone(recipeVariant);
    this.previousRoute = `/tabs/recipe/${getId(this.master)}`;
  }

  /**
   * Call appropriate document submission method
   *
   * @params: none
   * @return: none
   */
  onSubmit(): void {
    const isCreation: boolean = this.docMethod === 'create';
    const isMaster: boolean = this.formType === 'master';

    let submissionResponse: Observable<RecipeMaster | RecipeVariant>;

    if (isCreation && isMaster) {
      submissionResponse = this.submitRecipeMasterPost();
    } else if (isCreation && !isMaster) {
      submissionResponse = this.submitRecipeVariantPost();
    } else if (!isCreation && isMaster) {
      submissionResponse = this.submitRecipeMasterPatch();
    } else {
      submissionResponse = this.submitRecipeVariantPatch();
    }

    submissionResponse
      .subscribe(
        (): void => {
          this.toastService.presentToast(
            this.submitSuccessMessage,
            1500,
            'middle',
            'toast-bright'
          );
          this.navToPreviousRoute();
        },
        (error: string): void => this.toastService.presentErrorToast(error)
      );
  }

  /**
   * Set form configuration from nav params
   *
   * @params: formType - which document the form will modify; 'master' or 'variant'
   * @params: docMethod - document method to submit; 'create' or 'update'
   * @params: master - RecipeMaster instance
   * @params: variant - RecipeVariant instance
   *
   * @return: none
   */
  setFormTypeConfiguration(
    formType: string,
    docMethod: string,
    master: RecipeMaster,
    variant: RecipeVariant
  ): void {
    this.formType = formType;
    this.docMethod = docMethod;

    if (!this.isValidDocMethod() || !this.isValidFormType()) {
      throw new Error(this.onConfigError());
    }

    const isCreation: boolean = this.docMethod === 'create';
    const isMaster: boolean = this.formType === 'master';

    if (isCreation && isMaster) {
      this.initCreateMasterForm();
    } else if (isCreation && !isMaster) {
      this.initCreateVariantForm(master);
    } else if (!isCreation && isMaster) {
      this.initUpdateMasterForm(master);
    } else {
      this.initUpdateVariantForm(master, variant);
    }
  }

  /**
   * Submit an update for a recipe master
   *
   * @params: none
   *
   * @return: observable of updated recipe master
   */
  submitRecipeMasterPatch(): Observable<RecipeMaster> {
    return this.recipeService.patchRecipeMasterById(
      getId(this.master),
      this.constructPayload()
    );
  }

  /**
   * Submit an update for a recipe variant
   *
   * @params: none
   *
   * @return: observable of updated recipe variant
   */
  submitRecipeVariantPatch(): Observable<RecipeVariant> {
    return this.recipeService.patchRecipeVariantById(
      getId(this.master),
      getId(this.variant),
      this.constructPayload()
    );
  }

  /**
   * Submit a new recipe master
   *
   * @params: none
   *
   * @return: observable of new recipe master
   */
  submitRecipeMasterPost(): Observable<RecipeMaster> {
    return this.recipeService.postRecipeMaster(this.constructPayload());
  }

  /**
   * Submit a new recipe variant
   *
   * @params: none
   *
   * @return: observable of new recipe variant
   */
  submitRecipeVariantPost(): Observable<RecipeVariant> {
    return this.recipeService.postRecipeToMasterById(
      getId(this.master),
      <RecipeVariant>this.constructPayload()
    );
  }

  /***** End form data handling *****/


  /***** Ingredient List *****/

  /**
   * Get the ingredient index for a given type
   *
   * @params: type - the name of the ingredient array to search
   * @params: target - the ingredient instance to search for
   *
   * @return: the index of the target or -1 if not found
   */
  getIngredientIndex(type: string, target: object): number {
    let searchIndex: number = -1;

    if (type === 'otherIngredients' && target) {
      searchIndex = this.variant[type]
        .findIndex((ingredient: OtherIngredients): boolean => {
          return ingredient.name === target['name'];
        });
    } else if (target) {
      let searchTerm: string;
      if (type === 'grains') {
        searchTerm = 'grainType';
      } else if (type === 'hops') {
        searchTerm = 'hopsType';
      } else if (type === 'yeast') {
        searchTerm = 'yeastType';
      }

      searchIndex = this.variant[type]
        .findIndex((ingredient: GrainBill | HopsSchedule | YeastBatch): boolean => {
          return ingredient[searchTerm]['_id'] === target[searchTerm]['_id'];
        });
    }

    return searchIndex;
  }

  /**
   * Compare two names; lexographical name should be first
   *
   * @params: name1 - first position name to compare
   * @params: name2 - second position name to compare
   *
   * @return: true if name2 should come before name1
   */
  shouldSwapByName(name1: string, name2: string): boolean {
    return name1.toLowerCase() > name2.toLowerCase();
  }

  /**
   * Sort grains instances in descending quantity; if quantities
   * are the  same, sort in descending alphabetical
   *
   * @params: none
   * @return: none
   */
  sortGrains(): void {
    this.variant.grains.sort(
      (g1: GrainBill, g2: GrainBill): number => {
        const difference: number = g2.quantity - g1.quantity;
        if (!difference) {
          return g2.grainType.name < g1.grainType.name ? 1 : -1;
        }
        return difference;
      }
    );
  }

  /**
   * Sort hops instances with the following considerations:
   * - Hops are separated into two groups: Hops with timers and dry hop
   * - Hops with timers group should be before dry hop group
   * - Hops with timers group should first be ordered by timer duration
   * - Hops with timers group with equal duration should then be ordered by name
   * - Dry hop group should be ordered alphabetically
   *
   * @params: none
   * @return: none
   */
  sortHops(): void {
    this.variant.hops
      .sort((h1: HopsSchedule, h2: HopsSchedule): number => {
        if (h1.dryHop && h2.dryHop) {
          return this.shouldSwapByName(h1.hopsType.name, h2.hopsType.name)
            ? 1
            : -1;
        } else if (h1.dryHop && !h2.dryHop) {
          return 1;
        } else if (!h1.dryHop && h2.dryHop) {
          return -1;
        } else {
          const difference: number = h2.duration - h1.duration;
          if (difference > 0) {
            return 1;
          } else if (difference < 0) {
            return -1;
          } else {
            return this.shouldSwapByName(h1.hopsType.name, h2.hopsType.name)
              ? 1
              : -1;
          }
        }
      });
  }

  /**
   * Sort ingredient array
   *
   * @params: ingredientType - the name of ingredient array to sort
   *
   * @return: none
   */
  sortIngredients(ingredientType: string): void {
    if (ingredientType === 'grains') {
      this.sortGrains();
    } else if (ingredientType === 'hops') {
      this.sortHops();
    } else if (ingredientType === 'yeast') {
      this.sortYeast();
    }
  }

  /**
   * Sort yeast instances in descending quantity
   *
   * @params: none
   * @return: none
   */
  sortYeast(): void {
    this.variant.yeast
      .sort((y1: YeastBatch, y2: YeastBatch): number => {
        return y2.quantity - y1.quantity;
      });
  }

  /**
   * Update pre-save ingredient list
   *
   * @params: ingredient - ingredient data returned from ingredient form
   * @params: type - the name of ingredient type
   * @params: [toUpdate] - optional current ingredient data to edit
   * @params: [deletion] - optional true if ingredient is to be deleted
   *
   * @return: none
   */
  updateIngredientList(
    ingredient: object,
    type: string,
    toUpdate?: object,
    deletion?: boolean
  ): void {
    if (toUpdate) {
      const searchIndex = this.getIngredientIndex(type, toUpdate);
      if (deletion) {
        this.variant[type].splice(searchIndex, 1);
      } else {
        this.variant[type][searchIndex] = ingredient;
      }
    } else {
      this.variant[type].push(ingredient);
    }

    this.sortIngredients(type);
    this.refreshPipes = !this.refreshPipes;
  }

  /***** End ingredient list *****/


  /***** Other *****/

  /**
   * Check if the docMethod property is valid
   *
   * @params: none
   *
   * @return: true if docMethod is 'create' or 'update'
   */
  isValidDocMethod(): boolean {
    return this.docMethod === 'create' || this.docMethod === 'update';
  }

  /**
   * Check if formType property is valid
   *
   * @params: none
   *
   * @return: true if formType is 'master' or 'variant'
   */
  isValidFormType(): boolean {
    return this.formType === 'master' || this.formType === 'variant';
  }

  /**
   * Handle calls on functions that have been passed to a sub component
   *
   * @params: actionName - the method name called
   * @params: options - optional method parameters
   *
   * @return: none
   */
  onRecipeActionHandler(actionName: string, options: any[]): void {
    try {
      this.recipeActions[actionName](...options);
    } catch (error) {
      console.log('Recipe action error', actionName, ...options, error);
    }
  }

  /**
   * Navigate to previous route
   *
   * @params: none
   * @return: none
   */
  navToPreviousRoute(): void {
    this.router.navigate([this.previousRoute]);
  }

  /**
   * Ion reorder group handler - set process schedule order to match event
   *
   * @params: schedule - process schedule to apply to variant
   *
   * @return: none
   */
  onReorder(schedule: Process[]): void {
    this.variant.processSchedule = schedule;
  }

  /**
   * Map data to RecipeMaster and/or RecipeVariant
   *
   * @params: data - data that may be contained in the master and/or variant
   *
   * @return: none
   */
  updateDisplay(data: object): void {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (this.master.hasOwnProperty(key)) {
          this.master[key] = data[key];
        }
        if (this.variant.hasOwnProperty(key)) {
          this.variant[key] = data[key];
        }
      }
    }
  }

  /**
   * Update recipe calculated values
   *
   * @params: none
   * @return: none
   */
  updateRecipeValues(): void {
    this.calculator.calculateRecipeValues(this.variant);
  }

}
