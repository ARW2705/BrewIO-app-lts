/* Module imports */
import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonList } from '@ionic/angular';
import { BehaviorSubject, Subject } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';

/* Interface imports */
import { RecipeMaster, RecipeVariant } from '../../shared/interfaces';

/* Component imports */
import { RecipeSliderComponent } from '../../components/recipe-slider/recipe-slider.component';

/* Page imports */
import { ConfirmationPage } from '../confirmation/confirmation.page';

/* Service imports */
import { AnimationsService, ErrorReportingService, IdService, ModalService, RecipeService, ToastService, UserService, UtilityService } from '../../services/services';


@Component({
  selector: 'app-page-recipe',
  templateUrl: './recipe.page.html',
  styleUrls: ['./recipe.page.scss']
})
export class RecipePage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) ionContent: IonContent;
  @ViewChild('createButtonContainer', { read: ElementRef }) createButtonContainer: ElementRef;
  @ViewChild('slidingItemsList') slidingItemsList: IonList;
  @ViewChild('slidingItemsList', { read: ElementRef }) slidingItemsListRef: ElementRef;
  @ViewChildren(RecipeSliderComponent, { read: ViewContainerRef }) recipeSliderComponent: QueryList<ViewContainerRef>;
  creationMode: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isLoggedIn: boolean = false;
  oneSecond: number = 1000;
  recipeIndex: number = -1;
  recipeList: RecipeMaster[] = null;
  refreshPipes: boolean = false;
  variantList: RecipeVariant[] = null;
  sliderHeight: number = 0;
  createButtonHeight: number = 0;
  scrollOffsetHeight: number = 24; // offset is sum of app-recipe-slider's ion-sliding-item top and bottom margin and ion-list padding top

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
    public userService: UserService,
    public utilService: UtilityService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    this.listenForRecipes();
    this.listenForUser();
  }

  ionViewWillEnter(): void {
    this.refreshPipes = !this.refreshPipes;
    if (this.recipeSliderComponent.length) {
      const slider: HTMLElement = this.recipeSliderComponent.toArray()[0].element.nativeElement;
      const sliderItem: HTMLElement = <HTMLElement>slider.firstChild;
      this.sliderHeight = sliderItem.clientHeight;
    }
    this.createButtonHeight = this.createButtonContainer.nativeElement.clientHeight;
    console.log('slider height', this.sliderHeight, 'button height', this.createButtonHeight);
  }

  ionViewDidEnter(): void {
    if (this.animationService.shouldShowHint('sliding', 'recipe')) {
      this.runSlidingHints();
    }
  }

  // Close all sliding items on view exit
  ionViewDidLeave(): void {
    try {
      this.slidingItemsList.closeSlidingItems().then((): void => console.log('sliding items closed'));
    } catch (error) {
      console.log('Unable to close sliding items', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /***** End lifecycle hooks *****/


  /***** Listeners *****/

  /**
   * Subscribe to the recipe master list; update local list on changes
   *
   * @params: none
   * @return: none
   */
  listenForRecipes(): void {
    this.recipeService.getMasterList()
      .pipe(
        takeUntil(this.destroy$),
        map((masterList: BehaviorSubject<RecipeMaster>[]): RecipeMaster[] => {
          return masterList
            .map((recipe$: BehaviorSubject<RecipeMaster>): RecipeMaster => {
              return recipe$.value;
            });
        })
      )
      .subscribe(
        (masterList: RecipeMaster[]): void => {
          this.recipeList = masterList;
          console.log('got list', this.recipeList);
          this.mapMasterRecipes();
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Subscribe to user and listen for changes in login status
   *
   * @params: none
   * @return: none
   */
  listenForUser(): void {
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((): void => { this.isLoggedIn = this.userService.isLoggedIn(); },
        (error: any): void => {
          this.isLoggedIn = false;
          this.errorReporter.handleUnhandledError(error);
        }
      );
  }

  /***** End Listeners *****/


  /***** Navigation *****/

  /**
   * Navigate to Process Page if a process schedule is present
   * Pass the recipe master, the owner's id, selected recipe's id on nav
   *
   * @params: master - recipe master to use in brew process
   *
   * @return: none
   */
  navToBrewProcess(recipeMaster: RecipeMaster): void {
    const variant: RecipeVariant = recipeMaster.variants.find((_variant: RecipeVariant): boolean => {
      return this.idService.hasId(_variant, recipeMaster.master);
    });

    if (this.recipeService.isRecipeProcessPresent(variant)) {
      this.router.navigate(
        ['tabs/process'],
        {
          state: {
            recipeMasterId: this.idService.getId(recipeMaster),
            recipeVariantId: recipeMaster.master,
            requestedUserId: recipeMaster.owner,
            rootURL: 'tabs/recipe'
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
   * Navigate to Recipe Master details page
   *
   * @params: index - masterList index to send to details page
   *
   * @return: none
   */
  navToDetails(index: number): void {
    try {
      this.router.navigate([`tabs/recipe/${this.idService.getId(this.recipeList[index])}`]);
    } catch (error) {
      console.log('Details nav error', error);
      const message: string = 'Recipe details not found';
      const recipeIds: string[] = this.recipeList.map((recipe: RecipeMaster) => {
        return `${recipe._id ? recipe._id : recipe.cid},`;
      });
      this.errorReporter.setErrorReport(
        this.errorReporter.createErrorReport(
          'MissingError',
          `${message}: list index ${index}, present list [${recipeIds}]`,
          this.errorReporter.moderateSeverity,
          message,
        )
      );
    }
  }

  /**
   * Navigate to recipe form in master creation mode
   *
   * @params: none
   * @return: none
   */
  navToRecipeForm(): void {
    this.router.navigate(
      ['tabs/recipe-form'],
      { state: { formType: 'master', docMethod: 'create' } }
    );
  }

  /***** End navigation *****/


  /***** Modals *****/

  /**
   * Open confirmation modal prior to deletion
   *
   * @params: index - index of recipe master to delete
   *
   * @return: none
   */
  confirmDelete(index: number): void {
    this.modalService.openModal<boolean>(
      ConfirmationPage,
      {
        message: `Confirm deletion of "${this.recipeList[index].name}" and its variants`,
        subMessage: 'This action cannot be reversed'
      }
    )
    .subscribe(
      (shouldDelete: boolean): void => {
        if (shouldDelete) {
          this.deleteMaster(index);
        }
      },
      (error: Error): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /***** End Modals *****/


  /***** Other *****/

  /**
   * Delete a Recipe Master
   *
   * @params: index - index of recipe master to delete
   *
   * @return: none
   */
  deleteMaster(index: number): void {
    this.recipeService.removeRecipeMasterById(this.idService.getId(this.recipeList[index]))
      .subscribe(
        (): void => {
          this.toastService.presentToast('Deleted Recipe', this.oneSecond, 'middle', 'toast-bright');
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Toggle recipe master ingredient list expansion; if expanding, scroll to
   * the opened list
   *
   * @params: index - index in recipeIndex array to expand
   *
   * @return: none
   */
  expandIngredientList(index: number): void {
    if (this.recipeIndex === index) {
      this.recipeIndex = -1;
    } else {
      this.recipeIndex = index;
      this.ionContent.scrollToPoint(
        0,
        this.sliderHeight * index + this.createButtonHeight + this.scrollOffsetHeight,
        this.oneSecond
      );
    }
  }

  /**
   * Populate variantList with a copy of each recipe master's selected variant
   *
   * @params: none
   *
   * @return: none
   */
  mapMasterRecipes(): void {
    try {
      this.variantList = this.recipeList
        .map((master: RecipeMaster): RecipeVariant => {
          const selected: RecipeVariant = this.utilService.clone(
              master.variants.find((variant: RecipeVariant): boolean => {
                return this.idService.hasId(variant, master.master);
              })
            );

          selected.hops = this.recipeService.getCombinedHopsSchedule(selected.hops);
          return selected;
          }
        )
        .filter((variant: RecipeVariant): boolean => variant !== undefined);
    } catch (error) {
      console.log('Error generating variant list', error);
      this.toastService.presentErrorToast('Error generating recipe list');
    }
  }

  /***** End other *****/


  /***** Animation *****/

  /**
   * Trigger horizontally sliding gesture hint animations
   *
   * @params: none
   * @return: none
   */
  runSlidingHints(): void {
    const topLevelContent: HTMLElement = this.ionContent['el'];
    if (!topLevelContent) {
      this.animationService.reportSlidingHintError();
      return;
    }

    this.toggleSlidingItemClass(true);

    this.animationService.playCombinedSlidingHintAnimations(
      topLevelContent,
      this.slidingItemsListRef.nativeElement,
      this.animationService.getEstimatedItemOptionWidth(this.slidingItemsListRef.nativeElement, 1, 2)
    )
    .pipe(finalize((): void => this.toggleSlidingItemClass(false)))
    .subscribe(
      (): void => this.animationService.setHintShownFlag('sliding', 'recipe'),
      (error: any): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Toggle classes on IonItemSliding for hint animations;
   * This will show the IonOptions underneath the IonItem
   *
   * @params: show - true if classes should be added prior to animation; false to remove classes
   *  after animations have completed
   *
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
