/* Module imports */
import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonItemSliding, IonList } from '@ionic/angular';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

/* Interface imports */
import { RecipeMaster, RecipeVariant } from '@shared/interfaces';

/* Component imports */
import { AccordionComponent, ConfirmationComponent } from '@components/shared/public';

/* Service imports */
import { AnimationsService, ErrorReportingService, IdService, ModalService, RecipeService, ToastService, UtilityService } from '@services/public';


@Component({
  selector: 'page-recipe-detail',
  templateUrl: './recipe-detail.page.html',
  styleUrls: ['./recipe-detail.page.scss']
})
export class RecipeDetailPage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) ionContent: IonContent;
  @ViewChild('noteContainerScrollLandmark') noteContainerScrollLandmark: AccordionComponent;
  @ViewChild('slidingItemsList') slidingItemsList: IonList;
  @ViewChild('slidingItemsList', { read: ElementRef }) slidingItemsListRef: ElementRef;
  @ViewChildren('ingredientScrollLandmark') ingredientScrollLandmarks: QueryList<IonItemSliding>;
  @ViewChildren('noteScrollLandmark') noteScrollLandmarks: QueryList<IonItemSliding>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  displayVariantList: RecipeVariant[] = null;
  noteIndex: number = -1;
  oneSecond: number = 1000;
  recipeIndex: number = -1;
  recipeMaster: RecipeMaster = null;
  recipeMasterId: string = null;
  showNotes: boolean = false;


  constructor(
    public animationService: AnimationsService,
    public errorReporter: ErrorReportingService,
    public idService: IdService,
    public modalService: ModalService,
    public recipeService: RecipeService,
    public renderer: Renderer2,
    public route: ActivatedRoute,
    public router: Router,
    public toastService: ToastService,
    public utilService: UtilityService
  ) {
    this.recipeMasterId = this.route.snapshot.paramMap.get('masterId');
  }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('details page init');
    this.recipeService.getRecipeMasterById(this.recipeMasterId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (recipeMaster: RecipeMaster): void => {
          this.recipeMaster = recipeMaster;
          this.mapVariantList();
        },
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  ionViewDidEnter() {
    if (this.animationService.shouldShowHint('sliding', 'recipeDetail')) {
      this.runSlidingHints();
    }
  }

  ngOnDestroy() {
    console.log('details page destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  ionViewDidLeave() {
    console.log('details page did leave');
    // Close all sliding items on view exit
    this.slidingItemsList.closeSlidingItems()
      .then((): void => console.log('sliding items closed'))
      .catch((error: Error): void => console.log('error closing sliding items', error));
  }

  /***** End lifecycle hooks *****/


  /***** Navigation *****/

  /**
   * Navigate to process page to start a new batch based on selected variant
   *
   * @param: variant - recipe variant to be used as base for brew process
   * @return: none
   */
  navToBrewProcess(variant: RecipeVariant): void {
    if (this.recipeService.isRecipeProcessPresent(variant)) {
      this.router.navigate(
        ['tabs/process'],
        {
          state: {
            recipeMasterId: this.recipeMasterId,
            recipeVariantId: this.idService.getId(variant),
            requestedUserId: this.recipeMaster.owner,
            rootURL: `tabs/recipe/${this.idService.getId(this.recipeMaster)}`
          }
        }
      );
    } else {
      const message: string = 'Recipe is missing a process guide';
      this.errorReporter.setErrorReport(
        this.errorReporter.createErrorReport(
          'MissingError',
          message,
          this.errorReporter.moderateSeverity,
          message,
        )
      );
    }
  }

  /**
   * Navigate to recipe form
   *
   * @param: formType - which form type to open; either 'master' or 'variant'
   * @param: [variant] - optional recipe variant to update
   * @return: none
   */
  navToRecipeForm(formType: string, variant?: RecipeVariant): void {
    const options: object = {
      formType,
      docMethod: 'update',
      masterData: this.recipeMaster
    };

    if (formType === 'variant') {
      if (variant) {
        options['variantData'] = this.recipeMaster.variants
          .find((recipeVariant: RecipeVariant): boolean => {
            return this.idService.hasId(recipeVariant, this.idService.getId(variant));
          });
      } else {
        options['docMethod'] = 'create';
      }
    }

    this.router.navigate(['tabs/recipe-form'], { state: options });
  }

  /**
   * Navigate to the root recipe page
   *
   * @param: none
   * @return: none
   */
  navToRoot(): void {
    this.router.navigate(['tabs/recipe']);
  }

  /***** End navigation *****/


  /***** Modals *****/

  /**
   * Open confirmation modal prior to deletion
   *
   * @param: index - index of recipe master to delete
   * @return: none
   */
  confirmDelete(index: number): void {
    this.modalService.openModal<boolean>(
      ConfirmationComponent,
      {
        message: `Confirm deletion of "${this.displayVariantList[index].variantName}"`,
        subMessage: 'This action cannot be reversed'
      }
    )
    .subscribe(
      (shouldDelete: boolean): void => {
        if (shouldDelete) {
          this.deleteVariant(index);
        }
      },
      (error: Error): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /***** End Modals *****/


  /***** Notes *****/

  /**
   * Toggle note display and button icon
   *
   * @param: none
   * @return: none
   */
  expandNote(): void {
    this.showNotes = !this.showNotes;
    if (this.showNotes) {
      this.ionContent.scrollToPoint(
        0,
        this.getTotalOffsetTop(this.noteContainerScrollLandmark.container.nativeElement),
        this.oneSecond
      );
    }
  }

  /**
   * Handle notes update event
   *
   * @param: notesUpdate - the current notes array to apply
   * @return: none
   */
  noteUpdateEventHandler(notesUpdate: string[]): void {
    this.recipeService.updateRecipeMasterById(this.recipeMasterId, { notes: notesUpdate })
      .subscribe(
        (): void => {}, // no further actions required
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End notes *****/


  /***** Recipe *****/

  /**
   * Delete a Recipe Variant
   *
   * @param: index - index of recipe variant to delete
   * @return: none
   */
  deleteVariant(index: number): void {
    this.recipeService.removeRecipeVariantById(
      this.idService.getId(this.recipeMaster),
      this.idService.getId(this.displayVariantList[index])
    )
    .subscribe(
      (): void => {
        this.toastService.presentToast(
          'Variant deleted!',
          this.toastService.mediumDuration,
          'middle',
          'toast-bright'
        );
      },
      (error: Error): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Select recipe variant to expand
   *
   * @param: index - index for variant to expand, if index matches recipeIndex,
   * set recipeIndex to -1 instead
   *
   * @return: none
   */
  expandRecipe(index: number): void {
    if (this.recipeIndex === index) {
      this.recipeIndex = -1;
    } else {
      this.recipeIndex = index;
      this.ionContent.scrollToPoint(
        0,
        this.getTotalOffsetTop(this.ingredientScrollLandmarks.toArray()[index]['el']),
        this.oneSecond
      );
    }
  }

  /**
   * Get the height from offsetTop property from
   * a given element to the top of ion-content
   *
   * @param: startLevel - starting element
   * @return: total offset top property to top of ion-content in pixels
   */
  getTotalOffsetTop(startLevel: Element): number {
    let currentLevel = startLevel;
    try {
      let total: number = 0;
      while (currentLevel['offsetParent']['nodeName'] !== 'ION-CONTENT') {
        total += currentLevel['offsetTop'];
        currentLevel = currentLevel['offsetParent'];
      }
      return total;
    } catch (error) {
      console.log('Unable to get element offset', error);
      return 0;
    }
  }

  /**
   * Map recipe variants to their own list;
   * Combine hops instances of the same type
   *
   * @param: none
   * @return: none
   */
  mapVariantList(): void {
    this.displayVariantList = this.recipeMaster.variants
      .map((variant: RecipeVariant): RecipeVariant => {
        const selected: RecipeVariant = this.utilService.clone(variant);
        selected.hops = this.recipeService.getCombinedHopsSchedule(selected.hops);
        return selected;
      })
      .filter((variant: RecipeVariant): boolean => {
        return variant !== undefined;
      });
  }

  /**
   * Toggle isFavorite property of recipe
   *
   * @param: variant - Recipe variant instance to modify
   * @return: none
   */
  toggleFavorite(variant: RecipeVariant): void {
    this.recipeService.updateRecipeVariantById(
      this.idService.getId(this.recipeMaster),
      this.idService.getId(variant),
      { isFavorite: !variant.isFavorite }
    )
    .subscribe(
      (updatedRecipeVariant: RecipeVariant): void => {
        if (updatedRecipeVariant) {
          this.toastService.presentToast(
            `${updatedRecipeVariant.isFavorite ? 'Added to' : 'Removed from'} favorites`,
            this.toastService.mediumDuration,
            'bottom',
            'toast-fav'
          );
        }
      },
      (error: Error): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /***** End recipe *****/


  /***** Animation *****/

  /**
   * Trigger horizontally sliding gesture hint animations
   *
   * @param: none
   * @return: none
   */
  runSlidingHints() {
    const topLevelContent: HTMLElement = this.ionContent['el'];
    if (!topLevelContent) {
      this.animationService.reportSlidingHintError();
      return;
    }

    this.toggleSlidingItemClass(true);
    const slideDistance: number = this.animationService.getEstimatedItemOptionWidth(
      this.slidingItemsListRef.nativeElement,
      this.recipeMaster.variants[0].isMaster ? 0 : 1,
      2
    );

    this.animationService.playCombinedSlidingHintAnimations(
      topLevelContent,
      this.slidingItemsListRef.nativeElement,
      slideDistance
    )
    .pipe(finalize((): void => this.toggleSlidingItemClass(false)))
    .subscribe(
      (): void => this.animationService.setHintShownFlag('sliding', 'recipeDetail'),
      (error: Error): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Toggle classes on IonItemSliding for hint animations;
   * This will show the IonOptions underneath the IonItem
   *
   * @param: show - true if classes should be added prior to animation; false to remove classes
   *  after animations have completed
   * @return: none
   */
  toggleSlidingItemClass(show: boolean): void {
    this.animationService.toggleSlidingItemClass(
      this.slidingItemsListRef.nativeElement,
      show,
      this.renderer
    );
  }

  /***** End Animation *****/

}
