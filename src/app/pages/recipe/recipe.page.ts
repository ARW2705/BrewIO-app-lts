/* Module imports */
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController, IonList, IonContent } from '@ionic/angular';
import { BehaviorSubject, Subject, from } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

/* Interface imports */
import { RecipeMaster } from '../../shared/interfaces/recipe-master';
import { RecipeVariant } from '../../shared/interfaces/recipe-variant';

/* Utility function imports */
import { clone } from '../../shared/utility-functions/clone';
import { getId, hasId } from '../../shared/utility-functions/id-helpers';

/* Page imports */
import { ConfirmationComponent } from '../../components/confirmation/confirmation.component';

/* Service imports */
import { RecipeService } from '../../services/recipe/recipe.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';


@Component({
  selector: 'page-recipe',
  templateUrl: './recipe.page.html',
  styleUrls: ['./recipe.page.scss']
})
export class RecipePage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) ionContent: IonContent;
  @ViewChild('slidingItemsList') slidingItemsList: IonList;
  creationMode: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isLoggedIn: boolean = false;
  masterIndex: number = -1;
  masterList: RecipeMaster[] = null;
  refreshPipes: boolean = false;
  variantList: RecipeVariant[] = null;

  constructor(
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public router: Router,
    public recipeService: RecipeService,
    public toastService: ToastService,
    public userService: UserService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    this.listenForRecipes();
    this.listenForUser();
  }

  ionViewWillEnter() {
    this.refreshPipes = !this.refreshPipes;
  }

  // Close all sliding items on view exit
  ionViewDidLeave() {
    try {
      this.slidingItemsList.closeSlidingItems()
        .then(() => console.log('sliding items closed'))
        .catch((error: any) => console.log('error closing sliding items', error));
    } catch (error) {
      console.log('Unable to close sliding items');
    }
  }

  ngOnDestroy() {
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
          this.masterList = masterList;
          console.log('got list', this.masterList);
          this.mapMasterRecipes();
        },
        (error: string): void => {
          console.log('Recipe list error', error);
          this.toastService.presentErrorToast('Recipe list error');
        }
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
      .subscribe(
        (): void => {
          this.isLoggedIn = this.userService.isLoggedIn();
        },
        (error: string): void => {
          console.log('user subject error', error);
          this.isLoggedIn = false;
          this.toastService.presentErrorToast('User Error');
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
    const variant: RecipeVariant = recipeMaster.variants
      .find((_variant: RecipeVariant) => hasId(_variant, recipeMaster.master));

    if (this.recipeService.isRecipeProcessPresent(variant)) {
      this.router.navigate(
        ['tabs/process'],
        {
          state: {
            recipeMasterId: getId(recipeMaster),
            recipeVariantId: recipeMaster.master,
            requestedUserId: recipeMaster.owner,
            rootURL: 'tabs/recipe'
          }
        }
      );
    } else {
      this.toastService.presentErrorToast('Recipe is missing a process guide!');
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
      this.router.navigate([`tabs/recipe/${getId(this.masterList[index])}`]);
    } catch (error) {
      console.log('Details nav error', error);
      this.toastService.presentErrorToast('Error: invalid Recipe Master list index');
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
      {
        state: {
          formType: 'master',
          docMethod: 'create'
        }
      }
    );
  }

  /***** End navigation *****/


  /***** Modals *****/

  /**
   * Handle confirmation modal success
   *
   * @params: index = the index to apply deletion if confirmed
   *
   * @return: success handler function
   */
  onConfirmDeleteSuccess(index: number): (data: object) => void {
    return (confirmation: object): void => {
      const confirmed: boolean = confirmation['data'];
      if (confirmed) {
        this.deleteMaster(index);
      }
    };
  }

  /**
   * Handle confirmation modal error
   *
   * @params: none
   *
   * @return: error handler function
   */
  onConfirmDeleteError(): (error: string) => void {
    return (error: string): void => {
      console.log('recipe master deletion error', error);
      this.toastService.presentErrorToast('Unable to delete recipe master');
    };
  }

  /**
   * Open confirmation modal prior to deletion
   *
   * @params: index - index of recipe master to delete
   *
   * @return: none
   */
  async confirmDelete(index: number): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: ConfirmationComponent,
      componentProps: {
        message: `Confirm deletion of "${this.masterList[index].name}" and its variants`,
        subMessage: 'This action cannot be reversed'
      }
    });

    from(modal.onDidDismiss())
      .subscribe(
        this.onConfirmDeleteSuccess(index),
        this.onConfirmDeleteError()
      );

    return await modal.present();
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
    this.recipeService.removeRecipeMasterById(getId(this.masterList[index]))
      .subscribe(
        (): void => {
          this.toastService.presentToast(
            'Deleted Recipe',
            1000,
            'middle',
            'toast-bright'
          );
        },
        (error: string): void => {
          console.log('Error deleting recipe master', error);
          this.toastService.presentErrorToast('An error occured during recipe deletion');
        }
      );
  }

  /**
   * Toggle recipe master ingredient list expansion; if expanding, scroll to
   * the opened list
   *
   * @params: index - index in masterIndex array to expand
   *
   * @return: none
   */
  expandMaster(index: number): void {
    if (this.masterIndex === index) {
      this.masterIndex = -1;
    } else {
      this.masterIndex = index;
      const accordionElement: HTMLElement = document.querySelector(`#scroll-landmark-${index}`);
      this.ionContent.scrollToPoint(0, accordionElement.offsetTop, 1000);
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
      this.variantList = this.masterList
        .map((master: RecipeMaster): RecipeVariant => {
          const selected: RecipeVariant = clone(
              master.variants.find((variant: RecipeVariant): boolean => {
                return hasId(variant, master.master);
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

}
