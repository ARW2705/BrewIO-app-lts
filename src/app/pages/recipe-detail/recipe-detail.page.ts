/* Module imports */
import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonList, IonItemSliding, ModalController, IonContent } from '@ionic/angular';
import { Subject, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Interface imports */
import { RecipeMaster } from '../../shared/interfaces/recipe-master';
import { RecipeVariant } from '../../shared/interfaces/recipe-variant';

/* Utility imports */
import { clone } from '../../shared/utility-functions/clone';
import { getId, hasId } from '../../shared/utility-functions/id-helpers';

/* Component imports */
import { AccordionComponent } from '../../components/accordion/accordion.component';

/* Page imports */
import { ConfirmationPage } from '../confirmation/confirmation.page';

/* Service imports */
import { RecipeService } from '../../services/recipe/recipe.service';
import { ToastService } from '../../services/toast/toast.service';


@Component({
  selector: 'page-recipe-detail',
  templateUrl: './recipe-detail.page.html',
  styleUrls: ['./recipe-detail.page.scss']
})
export class RecipeDetailPage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) ionContent: IonContent;
  @ViewChild('noteContainerScrollLandmark') noteContainerScrollLandmark: AccordionComponent;
  @ViewChild('slidingItemsList') slidingItemsList: IonList;
  @ViewChildren('ingredientScrollLandmark') ingredientScrollLandmarks: QueryList<IonItemSliding>;
  @ViewChildren('noteScrollLandmark') noteScrollLandmarks: QueryList<IonItemSliding>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  displayVariantList: RecipeVariant[] = null;
  noteIndex: number = -1;
  recipeIndex: number = -1;
  recipeMaster: RecipeMaster = null;
  recipeMasterId: string = null;
  showNotes: boolean = false;


  constructor(
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public router: Router,
    public recipeService: RecipeService,
    public toastService: ToastService
  ) {
    this.recipeMasterId = this.route.snapshot.paramMap.get('masterId');
  }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('details page init');
    try {
      this.recipeService.getRecipeMasterById(this.recipeMasterId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (recipeMaster: RecipeMaster): void => {
            this.recipeMaster = recipeMaster;
            this.mapVariantList();
          },
          (error: string): void => {
            console.log('Recipe details error', this.recipeMasterId, error);
            this.toastService.presentErrorToast(
              'Recipe error',
              this.navToRoot.bind(this)
            );
          }
        );
    } catch (error) {
      console.log('Recipe details error', this.recipeMasterId, error);
      this.toastService.presentErrorToast(
        'Error initializing recipe',
        this.navToRoot.bind(this)
      );
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
      .catch((error: any): void => {
        console.log('error closing sliding items', error);
      });
  }

  /***** End lifecycle hooks *****/


  /***** Navigation *****/

  /**
   * Navigate to process page to start a new batch based on selected variant
   *
   * @params: variant - recipe variant to be used as base for brew process
   *
   * @return: none
   */
  navToBrewProcess(variant: RecipeVariant): void {
    if (this.recipeService.isRecipeProcessPresent(variant)) {
      this.router.navigate(
        ['tabs/process'],
        {
          state: {
            recipeMasterId: this.recipeMasterId,
            recipeVariantId: getId(variant),
            requestedUserId: this.recipeMaster.owner,
            rootURL: `tabs/recipe/${getId(this.recipeMaster)}`
          }
        }
      );
    } else {
      this.toastService.presentErrorToast('Recipe missing a process guide!');
    }
  }

  /**
   * Navigate to recipe form
   *
   * @params: formType - which form type to open; either 'master' or 'variant'
   * @params: [variant] - optional recipe variant to update
   *
   * @return: none
   */
  navToRecipeForm(formType: string, variant?: RecipeVariant): void {
    const options: object = {
      docMethod: 'update',
      formType: formType,
      masterData: this.recipeMaster
    };

    if (formType === 'variant') {
      if (variant) {
        options['variantData'] = this.recipeMaster.variants.find(
          (recipeVariant: RecipeVariant): boolean => {
            return hasId(recipeVariant, getId(variant));
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
   * @params: none
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
   * @params: index - index of recipe variant to delete
   *
   * @return: none
   */
  async confirmDelete(index: number): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: ConfirmationPage,
      componentProps: {
        message: `Confirm deletion of "${this.displayVariantList[index].variantName}"`,
        subMessage: 'This action cannot be reversed'
      }
    });

    from(modal.onDidDismiss())
      .subscribe(this.onConfirmDeleteModalDismiss(index));

    return await modal.present();
  }

  /**
   * Handle deletion confirmation modal dismiss
   *
   * @params: index - index of recipe variant to delete
   *
   * @return: callback function to handle dimissal
   */
  onConfirmDeleteModalDismiss(index: number): (confirmation: object) => void {
    return (confirmation: object): void => {
      const confirmed: boolean = confirmation['data'];

      if (confirmed) {
        this.recipeService.removeRecipeVariantById(
          getId(this.recipeMaster),
          getId(this.displayVariantList[index])
        )
        .subscribe(
          (): void => {
            this.toastService.presentToast(
              'Variant deleted!',
              1500,
              'middle'
            );
          },
          (error: string): void => {
            console.log(`Variant deletion error: ${error}`);
            this.toastService.presentErrorToast('Error deleting variant');
          }
        );
      }
    };
  }

  /***** End Modals *****/


  /***** Notes *****/

  /**
   * Toggle note display and button icon
   *
   * @params: none
   * @return: none
   */
  expandNote(): void {
    this.showNotes = !this.showNotes;
    if (this.showNotes) {
      this.ionContent.scrollToPoint(
        0,
        this.getTotalOffsetTop(
          this.noteContainerScrollLandmark.container.nativeElement
        ),
        1000
      );
    }
  }

  /***** End notes *****/


  /***** Recipe *****/

  /**
   * Select recipe variant to expand
   *
   * @params: index - index for variant to expand, if index matches recipeIndex,
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
        this.getTotalOffsetTop(
          this.ingredientScrollLandmarks.toArray()[index]['el']
        ),
        1000
      );
    }
  }

  /**
   * Get the height from offsetTop property from
   * a given element to the top of ion-content
   *
   * @params: currentLevel - starting element
   *
   * @return: total offset top property to top of ion-content in pixels
   */
  getTotalOffsetTop(currentLevel: Element): number {
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
   * @params: none
   * @return: none
   */
  mapVariantList(): void {
    this.displayVariantList = this.recipeMaster.variants
      .map((variant: RecipeVariant): RecipeVariant => {
        const selected: RecipeVariant = clone(variant);
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
   * @params: variant - Recipe variant instance to modify
   *
   * @return: none
   */
  toggleFavorite(variant: RecipeVariant): void {
    this.recipeService.updateRecipeVariantById(
      getId(this.recipeMaster),
      getId(variant),
      { isFavorite: !variant.isFavorite }
    )
    .subscribe(
      (updatedRecipeVariant: RecipeVariant): void => {
        if (updatedRecipeVariant) {
          this.toastService.presentToast(
            `${updatedRecipeVariant.isFavorite ? 'Added to' : 'Removed from'} favorites`,
            1500,
            'bottom',
            'toast-fav'
          );
        }
      },
      (error: string): void => {
        console.log('Favorite error', error);
        this.toastService.presentErrorToast(
          `Unable to ${ !variant.isFavorite ? 'add to' : 'remove from'} favorites`,
        );
      }
    );
  }

  /***** End recipe *****/

}
