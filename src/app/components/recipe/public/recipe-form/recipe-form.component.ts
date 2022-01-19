/* Module imports */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Navigation, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

/* Interface imports */
import { GrainBill, HopsSchedule, IngredientUpdateEvent, OtherIngredients, Process, ProcessUpdateEvent, RecipeMaster, RecipeVariant, SelectedUnits, Style, YeastBatch } from '@shared/interfaces';

/* Default imports */
import { defaultRecipeMaster, defaultStyle } from '@shared/defaults';

/* Service imports */
import { CalculationsService, ErrorReportingService, IdService, PreferencesService, ProcessService, RecipeService, ToastService, UtilityService } from '@services/public';


@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.scss']
})
export class RecipeFormComponent implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) ionContent: IonContent;
  destroy$: Subject<boolean> = new Subject<boolean>();
  defaultStyle: Style = defaultStyle();
  docMethod: string = '';
  formType: string = null;
  isLoaded: boolean = false;
  isGeneralFormComplete: boolean = false;
  master: RecipeMaster = null;
  previousRoute: string = '/tabs/recipe';
  refreshIngredients: boolean = false;
  submitSuccessMessage: string = '';
  textarea: string = '';
  title: string = '';
  units: SelectedUnits = null;
  variant: RecipeVariant = null;


  constructor(
    public calculator: CalculationsService,
    public idService: IdService,
    public errorReporter: ErrorReportingService,
    public preferenceService: PreferencesService,
    public processService: ProcessService,
    public recipeService: RecipeService,
    public route: ActivatedRoute,
    public router: Router,
    public toastService: ToastService,
    public utilService: UtilityService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('recipe form page init');
    this.units = this.preferenceService.getSelectedUnits();
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
   * Listen for changes in route query param and
   * configure form according to navigation extras state
   *
   * @param: none
   * @return: none
   */
  listenForRoute(): void {
    this.route.queryParams
      .pipe(
        takeUntil(this.destroy$),
        tap((): void => {
          const nav: Navigation = this.router.getCurrentNavigation();
          this.setFormTypeConfiguration(nav.extras.state);
          this.isLoaded = true;
          this.refreshIngredients = !this.refreshIngredients;
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      )
      .subscribe(
        (): void => {},
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Initializations *****/


  /***** Event Handlers *****/

  /**
   * Handle general form event
   *
   * @param: formValues - values returned from general form
   * @return: none
   */
  handleGeneralFormEvent(formValues: object) {
    this.isGeneralFormComplete = true;
    this.updateDisplay(formValues);
    this.updateRecipeValues();
    this.autoSetMashDuration(formValues['mashDuration']);
    this.autoSetBoilDuration(formValues['boilDuration']);
  }

  /**
   * Handle ingredient form event
   *
   * @param: update - ingredient update data
   * @return: none
   */
  handleIngredientUpdateEvent(update: IngredientUpdateEvent) {
    this.updateIngredientList(update);
    this.sortIngredients(update.type);
    this.updateRecipeValues();
    this.refreshIngredients = !this.refreshIngredients;
    if (update.type === 'hops') {
      this.autoSetHopsAdditions();
    }
  }

  /**
   * Handle process form event
   *
   * @param: update - process update data
   * @return: none
   */
  handleProcessUpdateEvent(update: ProcessUpdateEvent): void {
    const process: Process = <Process>update.process;
    if (update.toUpdate) {
      if (update.process.hasOwnProperty('delete')) {
        this.variant.processSchedule.splice(update.index, 1);
      } else {
        this.variant.processSchedule[update.index] = process;
      }
    } else {
      process.cid = this.idService.getNewId();
      this.variant.processSchedule.push(process);
    }
  }

  /**
   * Handle notes update event
   *
   * @param: notesUpdate - the current notes array to apply
   * @return: none
   */
  handleNoteUpdateEvent(notesUpdate: string[]): void {
    if (this.formType === 'master') {
      this.master.notes = notesUpdate;
    } else if (this.formType === 'variant') {
      this.variant.notes = notesUpdate;
    }
  }

  /***** End Event Handlers *****/


  /***** Form value auto-generation *****/

  /**
   * Update process schedule with a timer for 'boil' with the given duration
   *
   * @param: boilDuration - boil duration time in minutes
   * @return: none
   */
  autoSetBoilDuration(boilDuration: number): void {
    this.variant.processSchedule = this.processService.autoSetBoilDuration(
      this.variant.processSchedule,
      boilDuration,
      this.variant.hops
    );
  }

  /**
   * Update process schedule with a timers for each hops addition that is not a dry-hop addition
   *
   * @param: none
   * @return: none
   */
  autoSetHopsAdditions(): void {
    this.variant.processSchedule = this.processService.autoSetHopsAdditions(
      this.variant.processSchedule,
      this.variant.boilDuration,
      this.variant.hops
    );
  }

  /**
   * Update process schedule with a timer for 'mash' with the given duration
   *
   * @param: mashDuration - mash duration time in minutes
   * @return: none
   */
  autoSetMashDuration(mashDuration: number): void {
    this.processService.autoSetMashDuration(this.variant.processSchedule, mashDuration);
  }

  /***** End form value auto-generation *****/


  /***** Form data handling *****/

  /**
   * Format form data for recipe based on whether formType is 'master'
   * or 'variant' and whether docMethod is 'create' or 'update'
   *
   * @param: none
   * @return: structured form data for recipe service input
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
            labelImage: this.master.labelImage
          },
          variant: this.variant
        };
      } else {
        payload = {
          name: this.master.name,
          style: this.master.style,
          notes: this.master.notes,
          isPublic: this.master.isPublic,
          labelImage: this.master.labelImage
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
   * @param: none
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
   * @param: recipeMaster - the recipe master on which the variant
   * will be added to and based on
   * @return: none
   */
  initCreateVariantForm(recipeMaster: RecipeMaster): void {
    this.submitSuccessMessage = 'New Variant Created';
    this.isGeneralFormComplete = false;
    this.title = 'Add Variant';
    this.master = recipeMaster;
    this.variant = this.utilService.clone(
      recipeMaster.variants.find((variant: RecipeVariant): boolean => variant.isMaster)
    );
    this.variant.notes = [];
    this.utilService.stripSharedProperties(this.variant);
    this.variant.variantName = '';
    this.previousRoute = `/tabs/recipe/${this.idService.getId(this.master)}`;
  }

  /**
   * Initialize the recipe form to update a recipe master
   *
   * @param: recipeMaster - the recipe master to update
   * @return: none
   */
  initUpdateMasterForm(recipeMaster: RecipeMaster): void {
    this.submitSuccessMessage = 'Recipe Update Successful';
    this.isGeneralFormComplete = true;
    this.title = 'Update Recipe';
    this.master = this.utilService.clone(recipeMaster);
    this.variant = this.utilService.clone(
      recipeMaster.variants.find((variant: RecipeVariant): boolean => variant.isMaster)
    );
    this.previousRoute = `/tabs/recipe/${this.idService.getId(this.master)}`;
  }

  /**
   * Initialize the recipe form to udpate a recipe variant
   *
   * @param: recipeMaster - the recipe master that contains the variant to update
   * @param: recipeVariant - the recipe variant to update
   * @return: none
   */
  initUpdateVariantForm(recipeMaster: RecipeMaster, recipeVariant: RecipeVariant): void {
    this.submitSuccessMessage = 'Variant Update Successful';
    this.isGeneralFormComplete = true;
    this.title = 'Update Variant';
    this.master = this.utilService.clone(recipeMaster);
    this.variant = this.utilService.clone(recipeVariant);
    this.previousRoute = `/tabs/recipe/${this.idService.getId(this.master)}`;
  }

  /**
   * Call appropriate document submission method
   *
   * @param: none
   * @return: none
   */
  onSubmit(): void {
    const isMaster: boolean = this.formType === 'master';
    const isCreation: boolean = this.docMethod === 'create';

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
            this.toastService.mediumDuration,
            'middle',
            'toast-bright'
          );
          this.navToPreviousRoute();
        },
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Set form configuration from nav param
   *
   * @param: state - nav extras state
   * @return: none
   */
  setFormTypeConfiguration(state: { [key: string]: any}): void {
    this.formType = state.formType;
    this.docMethod = state.docMethod;
    const isCreation: boolean = state.docMethod === 'create';
    const isMaster: boolean = state.formType === 'master';

    if (isCreation && isMaster) {
      this.initCreateMasterForm();
    } else if (isCreation && !isMaster) {
      this.initCreateVariantForm(state.masterData);
    } else if (!isCreation && isMaster) {
      this.initUpdateMasterForm(state.masterData);
    } else {
      this.initUpdateVariantForm(state.masterData, state.variantData);
    }
  }

  /**
   * Submit an update for a recipe master
   *
   * @param: none
   * @return: observable of updated recipe master
   */
  submitRecipeMasterPatch(): Observable<RecipeMaster> {
    return this.recipeService.updateRecipeInList(
      this.idService.getId(this.master),
      this.constructPayload()
    );
  }

  /**
   * Submit an update for a recipe variant
   *
   * @param: none
   * @return: observable of updated recipe variant
   */
  submitRecipeVariantPatch(): Observable<RecipeVariant> {
    return this.recipeService.updateVariantOfRecipeInList(
      this.idService.getId(this.master),
      this.idService.getId(this.variant),
      this.constructPayload()
    );
  }

  /**
   * Submit a new recipe master
   *
   * @param: none
   * @return: observable of new recipe master
   */
  submitRecipeMasterPost(): Observable<RecipeMaster> {
    return this.recipeService.createNewRecipe(this.constructPayload());
  }

  /**
   * Submit a new recipe variant
   *
   * @param: none
   * @return: observable of new recipe variant
   */
  submitRecipeVariantPost(): Observable<RecipeVariant> {
    return this.recipeService.addVariantToRecipeInList(
      this.idService.getId(this.master),
      <RecipeVariant>this.constructPayload()
    );
  }

  /***** End form data handling *****/


  /***** Ingredient List *****/

  /**
   * Get the ingredient index for a given type
   *
   * @param: type - the name of the ingredient array to search
   * @param: target - the ingredient instance to search for
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
   * @param: name1 - first position name to compare
   * @param: name2 - second position name to compare
   * @return: true if name2 should come before name1
   */
  shouldSwapByName(name1: string, name2: string): boolean {
    return name1.toLowerCase() > name2.toLowerCase();
  }

  /**
   * Sort grains instances in descending quantity; if quantities
   * are the same, sort in descending alphabetical
   *
   * @param: none
   * @return: none
   */
  sortGrains(): void {
    this.variant.grains.sort((g1: GrainBill, g2: GrainBill): number => {
      const difference: number = g2.quantity - g1.quantity;
      if (!difference) {
        return g2.grainType.name < g1.grainType.name ? 1 : -1;
      }
      return difference;
    });
  }

  /**
   * Sort hops instances with the following considerations:
   * - Hops are separated into two groups: Hops with timers and dry hop
   * - Hops with timers group should be before dry hop group
   * - Hops with timers group should first be ordered by timer duration
   * - Hops with timers group with equal duration should then be ordered by name
   * - Dry hop group should be ordered alphabetically
   *
   * @param: none
   * @return: none
   */
  sortHops(): void {
    this.variant.hops.sort((h1: HopsSchedule, h2: HopsSchedule): number => {
      if (h1.dryHop && h2.dryHop) {
        return this.shouldSwapByName(h1.hopsType.name, h2.hopsType.name) ? 1 : -1;
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
          return this.shouldSwapByName(h1.hopsType.name, h2.hopsType.name) ? 1 : -1;
        }
      }
    });
  }

  /**
   * Sort ingredient array
   *
   * @param: ingredientType - the name of ingredient array to sort
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
   * Sort yeast instances in descending quantity; if quantities
   * are the same, sort in descending alphabetical
   *
   * @param: none
   * @return: none
   */
  sortYeast(): void {
    this.variant.yeast.sort((y1: YeastBatch, y2: YeastBatch): number => {
      const difference: number = y2.quantity - y1.quantity;
      if (!difference) {
        return y2.yeastType.name < y1.yeastType.name ? 1 : -1;
      }
      return difference;
    });
  }

  /**
   * Update pre-save ingredient list
   *
   * @param: update - ingredient update data
   * @return: none
   */
  updateIngredientList(update: IngredientUpdateEvent): void {
    if (update.toUpdate) {
      const searchIndex: number = this.getIngredientIndex(update.type, update.toUpdate);
      if (update.ingredient.hasOwnProperty('delete')) {
        this.variant[update.type].splice(searchIndex, 1);
      } else {
        this.variant[update.type][searchIndex] = update.ingredient;
      }
    } else {
      this.variant[update.type].push(update.ingredient);
    }
  }

  /***** End ingredient list *****/


  /***** Other *****/

  /**
   * Navigate to previous route
   *
   * @param: none
   * @return: none
   */
  navToPreviousRoute(): void {
    this.router.navigate([this.previousRoute]);
  }

  /**
   * Ion reorder group handler - set process schedule order to match event
   *
   * @param: schedule - process schedule to apply to variant
   * @return: none
   */
  onReorder(schedule: Process[]): void {
    this.variant.processSchedule = schedule;
  }

  /**
   * Map data to RecipeMaster and/or RecipeVariant
   *
   * @param: data - data that may be contained in the master and/or variant
   * @return: none
   */
  updateDisplay(data: object): void {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (this.master.hasOwnProperty(key) || key === 'labelImage') {
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
   * @param: none
   * @return: none
   */
  updateRecipeValues(): void {
    this.calculator.calculateRecipeValues(this.variant);
  }

}
