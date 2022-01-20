/* Module imports */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { finalize, map, mergeMap } from 'rxjs/operators';

/* Interface imports */
import { Author, GrainBill, HopsSchedule, Image, OtherIngredients, Process, RecipeMaster, RecipeVariant, User, YeastBatch } from '@shared/interfaces';

/* Default imports */
import { defaultImage } from '@shared/defaults';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { EventService } from '@services/event/event.service';
import { IdService } from '@services/id/id.service';
import { RecipeHttpService } from '@services/recipe/http/recipe-http.service';
import { RecipeImageService } from '@services/recipe/image/recipe-image.service';
import { RecipeStateService } from '@services/recipe/state/recipe-state.service';
import { RecipeTypeGuardService } from '@services/recipe/type-guard/recipe-type-guard.service';
import { UserService } from '@services/user/user.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  constructor(
    public errorReporter: ErrorReportingService,
    public event: EventService,
    public idService: IdService,
    public recipeHttpService: RecipeHttpService,
    public recipeImageService: RecipeImageService,
    public recipeStateService: RecipeStateService,
    public recipeTypeGuardService: RecipeTypeGuardService,
    public userService: UserService
  ) {
    this.registerEvents();
  }

  /***** Public API *****/

  /**
   * Get recipe author data
   *
   * @param: recipeId - recipe id to use as base for user search
   * @return: observable of author data
   */
  getPublicAuthorByRecipeId(recipeId: string): Observable<Author> {
    const _defaultImage: Image = defaultImage();
    const defaultAuthor: Author = {
      username: 'Not Found',
      userImage: _defaultImage,
      breweryLabelImage: _defaultImage
    };
    const recipe: RecipeMaster = this.recipeStateService.getRecipeById(recipeId);
    if (!recipe) {
      return of(defaultAuthor);
    }

    const user: User = this.userService.getUser().value;
    if (this.idService.hasId(user, recipe.owner)) {
      return of({
        username: user.username,
        userImage: user.userImage,
        breweryLabelImage: user.breweryLabelImage
      });
    }

    let searchId: string = recipeId;
    if (this.idService.hasDefaultIdType(searchId)) {
      searchId = recipe._id;
      if (!searchId) {
        return of(defaultAuthor);
      }
    }

    return this.recipeHttpService.fetchPublicAuthorByRecipeId(searchId)
      .pipe(map((author: Author): Author => author ?? defaultAuthor));
  }

  /**
   * Get a public recipe master by its id
   *
   * @param: recipeId - recipe master id string to search
   * @return: Observable of recipe master
   */
  getPublicRecipe(recipeId: string): Observable<RecipeMaster> {
    return this.recipeHttpService.fetchPublicRecipeById(recipeId);
  }

  /**
   * Get all public recipe masters owned by a user
   *
   * @param: userId - user id string to search
   * @return: Observable of an array of recipe masters
   */
  getPublicRecipeListByUser(userId: string): Observable<RecipeMaster[]> {
    return this.recipeHttpService.fetchPublicRecipeListByUser(userId);
  }

  /**
   * Get a public recipe variant by its id
   *
   * @param: recipeId - recipe master id which requested recipe belongs
   * @param: variantId - recipe id string to search
   * @return: Observable of recipe
   */
  getPublicRecipeVariantById(recipeId: string, variantId: string): Observable<RecipeVariant> {
    return this.recipeHttpService.fetchPublicVariantById(recipeId, variantId);
  }

  /***** END Public API *****/


  /***** Private API *****/

  /**
   * Create a new recipe variant
   *
   * @param: masterId - recipe master id to add variant to
   * @param: variant - the new RecipeVariant to add
   * @return: observable of null - emits to signal completion
   */
  addVariantToRecipeInList(recipeId: string, variant: RecipeVariant): Observable<null> {
    return this.recipeStateService.addVariantToRecipeInList(recipeId, variant);
  }

  /**
   * Create a new recipe and initial variant
   *
   * @param: newMasterValues - object with data to construct a recipe and an initial variant
   * @return: observable of null - emits to signal completion
   */
  createNewRecipe(newRecipeValues: object): Observable<null> {
    return this.recipeStateService.createNewRecipe(newRecipeValues);
  }

  /**
   * Remove a recipe master and its variants
   *
   * @param: recipeId - if of recipe master to delete
   * @return: observable of null - emits to signal completion
   */
  removeRecipeFromList(recipeId: string): Observable<null> {
    return this.recipeStateService.removeRecipeFromList(recipeId);
  }

  /**
   * Remove a recipe variant from its parent
   *
   * @param: recipeId - recipe variant's master's id
   * @param: variantId - id of variant to delete
   * @return: observable of null - emits to signal completion
   */
  removeVariantFromRecipeInList(recipeId: string, variantId: string): Observable<null> {
    return this.recipeStateService.removeVariantFromRecipeInList(recipeId, variantId);
  }

  /**
   * Update a recipe master
   *
   * @param: recipeId - recipe master's id
   * @param: update - object containing update data
   * @return: observable of null - emits to signal completion
   */
  updateRecipeInList(recipeId: string, update: object): Observable<null> {
    return this.recipeStateService.updateRecipeInList(recipeId, update);
  }

  /**
   * Update a recipe variant
   *
   * @param: recipeId - if of recipe variant's parent master
   * @param: variantId - if of variant to update
   * @param: update - object containing update data
   * @return: observable of null - emits to signal completion
   */
  updateVariantOfRecipeInList(recipeId: string, variantId: string, update: object): Observable<null> {
    return this.recipeStateService.updateVariantOfRecipeInList(recipeId, variantId, update);
  }

  /***** END private API *****/


  /***** Public Helper Methods *****/

  /**
   * Combine hops schedule instances of the same type
   *
   * @param: hopsSchedule - the recipe's hops schedule
   * @return: combined hops schedule
   * @explanation: if the hops schedule contains two separate additions of the same type of hops
   * (e.g. cascade at 30 minutes and another cascade addition at 15 minutes), combine the two
   * instance quantities and keep one instance of that type of hops
   */
  getCombinedHopsSchedule(hopsSchedule: HopsSchedule[]): HopsSchedule[] {
    if (!hopsSchedule) {
      return undefined;
    }

    const combinedSchedule: HopsSchedule[] = [];
    hopsSchedule.forEach((hops: HopsSchedule): void => {
      const combined: HopsSchedule = combinedSchedule.find((combinedHops: HopsSchedule): boolean => {
        return hops.hopsType._id === combinedHops.hopsType._id;
      });
      if (!combined) {
        combinedSchedule.push(hops);
      } else {
        combined.quantity += hops.quantity;
      }
    });
    combinedSchedule.sort((h1: HopsSchedule, h2: HopsSchedule): number => h2.quantity - h1.quantity);
    return combinedSchedule;
  }

  /**
   * Get list of recipe masters, fetch from server if list is empty
   *
   * @param: none
   * @return: subject of array of recipe subjects
   */
  getRecipeList(): BehaviorSubject<BehaviorSubject<RecipeMaster>[]> {
    return this.recipeStateService.getRecipeList();
  }

  /**
   * Get a recipe subject by its id
   *
   * @param: recipeId - the id to search for (can be either cid or _id)
   * @return: the associated recipe subject or undefined if not found
   */
  getRecipeSubjectById(recipeId: string): BehaviorSubject<RecipeMaster> {
    return this.recipeStateService.getRecipeSubjectById(recipeId);
  }

  /**
   * Check if there is a process schedule available for a recipe variant
   *
   * @param: variant - variant to check for a process
   * @return: true if at least one process is in the schedule
   */
  isRecipeProcessPresent(variant: RecipeVariant): boolean {
    return (variant && variant.processSchedule !== undefined && variant.processSchedule.length > 0);
  }

  /**
   * Check if array of grain bills correctly implement the GrainBill interface
   *
   * @param: grainBill - expects an array of GrainBill objects
   * @return: true if all items in array correctly implement GrainBill
   */
  isSafeGrainBillCollection(grainBill: GrainBill[]): boolean {
    return this.recipeTypeGuardService.isSafeGrainBillCollection(grainBill);
  }

  /**
   * Check if array of hops schedule correctly implement the HopsSchedule interface
   *
   * @param: hopsSchedule - expects an array of HopsSchedule objects
   * @return: true if all items in array correctly implement HopsSchedule
   */
  isSafeHopsScheduleCollection(hopsSchedule: HopsSchedule[]): boolean {
    return this.recipeTypeGuardService.isSafeHopsScheduleCollection(hopsSchedule);
  }

  /**
   * Check if other ingredients correctly implement the OtherIngredients interface
   *
   * @param: otherIngredients - expects a OtherIngredients objects
   * @return: true if object correctly implement OtherIngredients
   */
  isSafeOtherIngredientsCollection(otherIngredients: OtherIngredients[]): boolean {
    return this.recipeTypeGuardService.isSafeOtherIngredientsCollection(otherIngredients);
  }

  /**
   * Check if given process schedule array is valid by correctly implementing the Process interface
   * as well as the appropriate extended interface defined by the type property
   *
   * @param: schedule - expects array of Process objects at runtime
   * @return: true if all processes within schedule implements the Process interface as well as their
   * individual extended interface
   */
  isSafeProcessSchedule(schedule: Process[]): boolean {
    return this.recipeTypeGuardService.isSafeProcessSchedule(schedule);
  }

  /**
   * Check if array of yeast batch correctly implement the YeastBatch interface
   *
   * @param: yeastBatch - expects an array of YeastBatch objects
   * @return: true if all items in array correctly implement YeastBatch
   */
  isSafeYeastBatchCollection(yeastBatch: YeastBatch[]): boolean {
    return this.recipeTypeGuardService.isSafeYeastBatchCollection(yeastBatch);
  }

  /**
   * Register event listeners
   *
   * @param: none
   * @return: none
   */
  registerEvents(): void {
    this.event.register('init-recipes')
      .pipe(
        finalize((): void => this.event.emit('init-batches')),
        mergeMap((): Observable<null> => this.recipeStateService.initRecipeList())
      )
      .subscribe(
        (): void => {
          this.event.emit('init-batches');
          console.log('recipe init complete');
        },
        (error: Error): void => { console.log('TEST', error); this.errorReporter.handleUnhandledError(error); }
      );
    this.event.register('clear-data')
      .subscribe((): void => this.recipeStateService.clearRecipes());
    this.event.register('sync-recipes-on-signup')
      .subscribe((): void => this.recipeStateService.syncOnSignup());
    this.event.register('connected')
      .pipe(mergeMap((): Observable<null> => this.recipeStateService.syncOnConnection(false)))
      .subscribe(
        (): void => console.log('recipe sync on connection complete'),
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Public Helper Methods *****/
}
