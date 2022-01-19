/* Module imports */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

/* Constants imports */
import { HIGH_SEVERITY } from '@shared/constants';

/* Default imports */
import { defaultImage } from '@shared/defaults';

/* Interface imports */
import { GrainBill, HopsSchedule, Image, OtherIngredients, Process, RecipeMaster, RecipeVariant, User, YeastBatch } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { IdService } from '@services/id/id.service';
import { RecipeHttpService } from '@services/recipe/http/recipe-http.service';
import { RecipeImageService } from '@services/recipe/image/recipe-image.service';
import { RecipeSyncService } from '@services/recipe/sync/recipe-sync.service';
import { RecipeTypeGuardService } from '@services/recipe/type-guard/recipe-type-guard.service';
import { StorageService } from '@services/storage/storage.service';
import { UserService } from '@services/user/user.service';
import { UtilityService } from '@services/utility/utility.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeStateService {
  recipeList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);

  constructor(
    public errorReporter: ErrorReportingService,
    public idService: IdService,
    public recipeHttpService: RecipeHttpService,
    public recipeImageService: RecipeImageService,
    public recipeSyncService: RecipeSyncService,
    public recipeTypeGuardService: RecipeTypeGuardService,
    public storageService: StorageService,
    public userService: UserService,
    public utilService: UtilityService
  ) { }

  /***** Initializations *****/

  /**
   * Get recipe list from server; perform pending sync operations prior to fetching updated list
   *
   * @param: none
   * @return: observable of null - emits to signal completion
   */
  initFromServer(): Observable<null> {
    if (this.utilService.canSendRequest()) {
      return this.syncOnConnection(true)
        .pipe(
          mergeMap((): Observable<RecipeMaster[]> => this.recipeHttpService.fetchPrivateRecipeList()),
          map((recipeList: RecipeMaster[]): null => {
            this.mapRecipeListToSubjectList(recipeList);
            this.updateRecipeStorage();
            return null;
          })
        );
    } else {
      return of(null);
    }
  }

  /**
   * Get recipe list from storage; apply list only if current list has not already been populated -
   * server response takes priority
   *
   * @param: none
   * @return: observable of null - emits to signal completion
   */
  initFromStorage(): Observable<null> {
    return this.storageService.getRecipes()
      .pipe(
        map((recipeList: RecipeMaster[]): null => {
          console.log('recipes from storage');
          if (this.recipeList$.value.length === 0) {
            this.mapRecipeListToSubjectList(recipeList);
          }
          return null;
        })
      );
  }

  /**
   * Initialize recipe lists
   *
   * @param: none
   * @return: observable of null - emits to signal completion
   */
  initRecipeList(): Observable<null> {
    return this.initFromStorage().pipe(mergeMap((): Observable<null> => this.initFromServer()));
  }

  /***** End Initializations *****/


  /***** Sync Calls *****/

  /**
   * Handle recipe list response from sync call
   *
   * @param: syncedList - the response returned from a sync call
   * @return: none
   */
  handleSyncResponse(syncedList: BehaviorSubject<RecipeMaster>[]): void {
    syncedList.forEach((recipe$: BehaviorSubject<RecipeMaster>): void => {
      this.recipeTypeGuardService.checkTypeSafety(recipe$.value);
    });
    this.getRecipeList().next(syncedList);
  }

  /**
   * Perform sync on signup action
   *
   * @param: none
   * @return: none
   */
  syncOnSignup(): void {
    this.recipeSyncService.syncOnSignup(this.getRecipeList().value)
      .subscribe(
        (syncedList: BehaviorSubject<RecipeMaster>[]): void => this.handleSyncResponse(syncedList),
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Perform sync on connection action
   *
   * @param: onLogin - true if connection event was due to user login
   * @return: observable of null - emits to signal completion
   */
  syncOnConnection(onLogin: boolean): Observable<null> {
    return this.recipeSyncService.syncOnConnection(onLogin, this.getRecipeList().value)
      .pipe(
        map((syncedList: BehaviorSubject<RecipeMaster>[]): null => {
          this.handleSyncResponse(syncedList);
          return null;
        })
      );
  }

  /***** End Sync Calls *****/


  /***** State Handlers *****/

  /**
   * Add a new recipe to the list
   *
   * @param: recipe - the new recipe
   * @return: observable of null - emits to signal completion
   */
  addRecipeToList(recipe: RecipeMaster): Observable<null> {
    this.recipeTypeGuardService.checkTypeSafety(recipe);
    const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = this.getRecipeList();
    const list: BehaviorSubject<RecipeMaster>[] = list$.value;
    list.push(new BehaviorSubject<RecipeMaster>(recipe));
    list$.next(list);
    this.updateRecipeStorage();
    this.sendBackgroundRequest('post', recipe);
    return of(null);
  }

  /**
   * Add a variant to a recipe in the list
   *
   * @param: recipeId - id for recipe to which to add the variant
   * @param: variant - new variant to add to a recipe
   * @return: observable of null - emits to signal completion
   */
  addVariantToRecipeInList(recipeId: string, variant: RecipeVariant): Observable<null> {
    const recipe$: BehaviorSubject<RecipeMaster> = this.getRecipeSubjectById(recipeId);
    if (!recipe$) {
      const message: string = 'An error occurred trying to add a new variant to a recipe: recipe not found';
      return throwError(this.getCustomError(message, recipeId));
    }

    const recipe: RecipeMaster = recipe$.value;
    variant.owner = this.idService.getId(recipe);
    this.setRecipeIds(variant);
    recipe.variants.push(variant);
    if (variant.isMaster) {
      this.setRecipeAsMaster(recipe, recipe.variants.length - 1);
    }

    this.recipeTypeGuardService.checkTypeSafety(recipe);
    recipe$.next(recipe);
    this.emitListUpdate();
    this.updateRecipeStorage();
    this.sendBackgroundRequest('post', recipe, variant);
    return of(null);
  }

  /**
   * Call complete for all recipe subjects and clear recipe list
   *
   * @param: none
   * @return: none
   */
  clearRecipes(): void {
    const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = this.getRecipeList();
    list$.value.forEach((recipeMaster$: BehaviorSubject<RecipeMaster>) => recipeMaster$.complete());
    list$.next([]);
    this.storageService.removeRecipes();
  }

  /**
   * Trigger an emit event of the recipe list subject
   *
   * @param: none
   * @return: none
   */
  emitListUpdate(): void {
    const recipeList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = this.getRecipeList();
    recipeList$.next(recipeList$.value);
  }

  /**
   * Remove a variant from a recipe
   *
   * @param: recipeId - id of the variant's parent recipe
   * @param: variantId - id of the variant to remove
   * @return: observable of null - emits to signal completion
   */
  removeVariantFromRecipeInList(recipeId: string, variantId: string): Observable<null> {
    const recipe$: BehaviorSubject<RecipeMaster> = this.getRecipeSubjectById(recipeId);
    if (!recipe$) {
      const message: string = 'An error occurred trying to remove variant from recipe: missing parent recipe';
      return throwError(this.getCustomError(message, recipeId));
    }

    const recipe: RecipeMaster = recipe$.value;
    const recipeIndex: number = this.idService.getIndexById(variantId, recipe.variants);
    if (recipeIndex === -1) {
      return of(null); // no action required if variant is already removed
    }

    if (recipe.variants[recipeIndex].isMaster) {
      this.removeRecipeAsMaster(recipe, recipeIndex);
    }

    const variant: RecipeVariant = recipe.variants[recipeIndex];
    recipe.variants.splice(recipeIndex, 1);
    this.recipeTypeGuardService.checkTypeSafety(recipe);
    recipe$.next(recipe);
    this.emitListUpdate();
    this.updateRecipeStorage();
    this.sendBackgroundRequest('delete', recipe, variant);
    return of(null);
  }

  /**
   * Remove a recipe from the list
   *
   * @param: recipeId - the id of the recipe to delete
   * @return: observable of null - emits to signal completion
   */
  removeRecipeFromList(recipeId: string): Observable<null> {
    const recipeList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = this.getRecipeList();
    const recipeList: BehaviorSubject<RecipeMaster>[] = recipeList$.value;
    const indexToRemove: number = this.idService.getIndexById(
      recipeId,
      this.utilService.getArrayFromBehaviorSubjects(recipeList)
    );
    if (indexToRemove === -1) {
      return of(null); // no action required if recipe is already removed
    }

    const recipe$: BehaviorSubject<RecipeMaster> = recipeList[indexToRemove];
    const recipe: RecipeMaster = recipe$.value;
    this.recipeImageService.deleteImage(recipe.labelImage);
    recipe$.complete();
    recipeList.splice(indexToRemove, 1);
    recipeList$.next(recipeList);
    this.updateRecipeStorage();
    this.sendBackgroundRequest('delete', recipe);
    return of(null);
  }

  /**
   * Deselect a variant as the master, set the first variant in the array that is not the currently
   * selected variant as the new master. Does not perform action if there is only one variant
   *
   * @param: recipe - the variant's parent recipe
   * @param: changeIndex - the index of the recipe variants array to change
   * @return: none
   */
  removeRecipeAsMaster(recipe: RecipeMaster, changeIndex: number): void {
    if (recipe.variants.length > 1) {
      recipe.variants[changeIndex].isMaster = false;
      const newMaster: RecipeVariant = recipe.variants[changeIndex === 0 ? 1 : 0];
      newMaster.isMaster = true;
      recipe.master = newMaster._id || newMaster.cid; // favor server id over client id
    }
  }

  /**
   * Set a variant as the master, deselect previous master
   *
   * @param: recipe - the variant's parent recipe
   * @param: changeIndex - the index of the recipe variants array to change
   * @return: none
   */
  setRecipeAsMaster(recipe: RecipeMaster, changeIndex: number): void {
    recipe.variants.forEach((variant: RecipeVariant, index: number): void => {
      variant.isMaster = index === changeIndex;
    });
    recipe.master = recipe.variants[changeIndex].cid;
  }

  /**
   * Store the current recipe list
   *
   * @param: none
   * @return: none
   */
  updateRecipeStorage(): void {
    this.storageService.setRecipes(
      this.getRecipeList().value
        .map((recipe$: BehaviorSubject<RecipeMaster>): RecipeMaster => recipe$.value)
    )
    .subscribe(
      (): void => console.log('stored recipes'),
      (error: any): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Update a recipe in the list
   *
   * @param: recipeId - id of recipe to update
   * @param: update - key value pairs to apply to recipe
   * @return: observable of null - emits to signal completion
   */
  updateRecipeInList(recipeId: string, update: object): Observable<null> {
    const recipe$: BehaviorSubject<RecipeMaster> = this.getRecipeSubjectById(recipeId);
    if (!recipe$) {
      const message: string = 'An error occurred trying to update recipe: recipe not found';
      return throwError(this.getCustomError(message, recipeId));
    }

    const recipe: RecipeMaster = recipe$.value;
    let previousImagePath: string = '';
    let isTemp: boolean = false;
    if (recipe && recipe.labelImage) {
      previousImagePath = recipe.labelImage.filePath;
      isTemp = this.recipeImageService.isTempImage(recipe.labelImage);
    }

    for (const key in update) {
      if (update.hasOwnProperty(key) && recipe.hasOwnProperty(key) && key !== 'variants') {
        recipe[key] = update[key];
      }
    }

    let storeImage$: Observable<Image>;
    const labelImage: Image = update['labelImage'];
    if (labelImage && labelImage.hasPending) {
      storeImage$ = this.recipeImageService.storeImageToLocalDir(
        labelImage,
        isTemp ? null : previousImagePath
      );
    } else {
      storeImage$ = of(null);
    }

    this.recipeTypeGuardService.checkTypeSafety(recipe);
    return storeImage$
      .pipe(
        map((storedImage: Image): null => {
          if (storedImage) {
            recipe.labelImage = storedImage;
          }
          recipe$.next(recipe);
          this.emitListUpdate();
          this.updateRecipeStorage();
          this.sendBackgroundRequest('patch', recipe);
          return null;
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Update a variant within a recipe in list
   *
   * @param: recipeId - recipe master of variant
   * @param: variantId - recipe variant id to update
   * @param: update - key value pairs to apply to variant
   * @return: observable of null - emits to signal completion
   */
  updateVariantOfRecipeInList(recipeId: string, variantId: string, update: object): Observable<null> {
    const recipe$: BehaviorSubject<RecipeMaster> = this.getRecipeSubjectById(recipeId);
    if (!recipe$) {
      const message: string = 'An error occurred trying to update variant in recipe: parent recipe not found';
      return throwError(this.getCustomError(message, recipeId));
    }

    const recipe: RecipeMaster = recipe$.value;
    const recipeIndex: number = this.idService.getIndexById(variantId, recipe.variants);
    if (recipeIndex === -1) {
      const message: string = 'An error occurred trying to update variant in recipe: variant not found';
      return throwError(this.getCustomError(message, `recipe: ${recipeId}, variant: ${variantId}`));
    }

    const variant: RecipeVariant = recipe.variants[recipeIndex];
    if (update.hasOwnProperty('isMaster')) {
      if (update['isMaster']) {
        this.setRecipeAsMaster(recipe, recipeIndex);
      } else if (!update['isMaster'] && variant.isMaster) {
        this.removeRecipeAsMaster(recipe, recipeIndex);
      }
    }

    for (const key in update) {
      if (update.hasOwnProperty(key)) {
        variant[key] = update[key];
      }
    }

    this.recipeTypeGuardService.checkTypeSafety(variant);
    recipe$.next(recipe);
    this.emitListUpdate();
    this.updateRecipeStorage();
    this.sendBackgroundRequest('patch', recipe, variant);
    return of(null);
  }

  /***** End State Handlers *****/


  /***** Helper Methods *****/

  /**
   * Create a minimally valid new recipe with given values
   *
   * @param: newRecipeValues - object containing data to create a new recipe with initial variant
   * @return: a new basic recipe
   */
  createBaseRecipe(newRecipeValues: object): RecipeMaster {
    const user: User = this.userService.getUser().value;
    const userId: string = this.idService.getId(user);
    if (!userId) {
      const message: string = 'Client Validation Error: missing user id';
      throw this.getCustomError(message);
    }

    const newRecipeId: string = this.idService.getNewId();
    const initialVariant: RecipeVariant = newRecipeValues['variant'];
    this.setRecipeIds(initialVariant);
    initialVariant.isMaster = true;
    initialVariant.owner = newRecipeId;
    const masterData: object = newRecipeValues['master'];
    return {
      cid: newRecipeId,
      name: masterData['name'],
      style: masterData['style'],
      notes: masterData['notes'],
      master: initialVariant.cid,
      owner: userId,
      isPublic: false,
      isFriendsOnly: false,
      variants: [ initialVariant ],
      labelImage: masterData['labelImage'] || defaultImage()
    };
  }

  /**
   * Create a new recipe and initial variant
   *
   * @param: newMasterValues - object with data to construct a recipe and an initial variant
   * @return: observable of new recipe master
   */
  createNewRecipe(newRecipeValues: object): Observable<null> {
    const newRecipe: RecipeMaster = this.createBaseRecipe(newRecipeValues);
    return this.recipeImageService.storeNewImage(newRecipe.labelImage)
      .pipe(mergeMap((storedImage: Image): Observable<null> => {
        if (storedImage) {
          newRecipe.labelImage = storedImage;
        }
        return this.addRecipeToList(newRecipe);
      }));
  }

  /**
   * Get a custom error
   *
   * @param: userMessage - user accessible error message
   * @param: [additionalMessage] - additional error text that is not displayed to user;
   * defaults to empty string
   * @return: a new recipe custom error
   */
  getCustomError(userMessage: string, additionalMessage: string = ''): CustomError {
    const errMsg: string = `${userMessage} ${additionalMessage}`;
    return new CustomError('RecipeError', errMsg, HIGH_SEVERITY, userMessage);
  }

  /**
   * Get a recipe by its id
   *
   * @param: recipeId - the id to search for (can be either cid or _id)
   * @return: the associated recipe or undefined if not found
   */
  getRecipeById(recipeId: string): RecipeMaster {
    const recipe$: BehaviorSubject<RecipeMaster> = this.getRecipeSubjectById(recipeId);
    if (!recipe$) {
      return undefined;
    }
    return recipe$.value;
  }

  /**
   * Get list of recipe masters, fetch from server if list is empty
   *
   * @param: none
   * @return: subject of array of recipe subjects
   */
  getRecipeList(): BehaviorSubject<BehaviorSubject<RecipeMaster>[]> {
    return this.recipeList$;
  }

  /**
   * Get a recipe subject by its id
   *
   * @param: recipeId - the id to search for (can be either cid or _id)
   * @return: the associated recipe subject or undefined if not found
   */
  getRecipeSubjectById(recipeId: string): BehaviorSubject<RecipeMaster> {
    return this.getRecipeList().value.find((recipe$: BehaviorSubject<RecipeMaster>): boolean => {
      return this.idService.hasId(recipe$.value, recipeId);
    });
  }

  /**
   * Convert an array of recipes into a BehaviorSubject of an array of BehaviorSubjects of recipes
   *
   * @param: newRecipeList - array of recipes to apply to recipe list
   * @return: none
   */
  mapRecipeListToSubjectList(newRecipeList: RecipeMaster[]): void {
    this.getRecipeList().next(this.utilService.toBehaviorSubjectArray<RecipeMaster>(newRecipeList));
  }

  /**
   * Populate variant and child property cid fields
   *
   * @param: variant - variant to add cids
   * @return: none
   */
  setRecipeIds(variant: RecipeVariant): void {
    variant.cid = this.idService.getNewId();
    this.setRecipeNestedIds<GrainBill>(variant.grains);
    this.setRecipeNestedIds<HopsSchedule>(variant.hops);
    this.setRecipeNestedIds<YeastBatch>(variant.yeast);
    this.setRecipeNestedIds<OtherIngredients>(variant.otherIngredients);
    this.setRecipeNestedIds<Process>(variant.processSchedule);
  }

  /**
   * Populate all cid fields of each object in array
   *
   * @param: array - array of objects that require a cid field
   * @return: none
   */
  setRecipeNestedIds<T>(array: T[]): void {
    array.forEach((member: T): void => { member['cid'] = this.idService.getNewId(); });
  }

  /***** End Helper Methods *****/


  /***** Background Requests *****/

  /**
   * Handle updating client doc with server response
   *
   * @param: recipeId - recipe id to update; alternatively variant's parent recipe id
   * @param: variantId - variant id to update
   * @param: recipeResponse - the updated recipe master or variant
   * @param: isDeletion - true if a doc was deleted
   * @return: observable of the updated recipe master or variant
   */
  handleBackgroundUpdateResponse(
    recipeId: string,
    variantId: string,
    recipeResponse: RecipeMaster | RecipeVariant,
    isDeletion: boolean
  ): void {
    const recipe$: BehaviorSubject<RecipeMaster> = this.getRecipeSubjectById(recipeId);
    if (!isDeletion && !recipe$) {
      const message: string = 'Error processing background update response: recipe not found';
      throw this.getCustomError(message, this.idService.getId(recipeResponse));
    } else if (!isDeletion) {
      this.recipeTypeGuardService.checkTypeSafety(recipeResponse);
      if (!variantId) {
        recipe$.next(<RecipeMaster>recipeResponse);
      } else {
        const recipe: RecipeMaster = recipe$.value;
        const updateIndex: number = recipe.variants.findIndex((variant: RecipeVariant): boolean => {
          return this.idService.hasId(variant, variantId);
        });
        if (updateIndex !== -1) {
          recipe.variants[updateIndex] = <RecipeVariant>recipeResponse;
        }

        recipe$.next(recipe);
        this.emitListUpdate();
        this.updateRecipeStorage();
      }
    }
  }

  /**
   * Send a background request to server or set sync flag if request cannot be sent at this time
   *
   * @param: requestMethdod - the http request method ('post', 'patch', or 'delete')
   * @param: recipe - the recipe master to use in request body
   * @param: [variant] - optional variant to use in request body
   * @return: none
   */
  sendBackgroundRequest(requestMethod: string, recipe: RecipeMaster, variant?: RecipeVariant): void {
    const recipeId: string = this.idService.getId(recipe);
    const variantId: string = this.idService.getId(variant);
    const ids: string[] = [];
    if (requestMethod === 'patch' || requestMethod === 'delete') {
      ids.push(recipeId);
      if (variant) {
        ids.push(variantId);
      }
    }

    if (this.utilService.canSendRequest(ids)) {
      if (variant) {
        this.recipeTypeGuardService.checkTypeSafety(variant);
      } else {
        this.recipeTypeGuardService.checkTypeSafety(recipe);
      }
      this.recipeHttpService.requestInBackground(requestMethod, recipe, variant)
        .subscribe(
          (recipeResponse: RecipeMaster | RecipeVariant): void => {
            const isDeletion: boolean = requestMethod === 'delete';
            this.handleBackgroundUpdateResponse(recipeId, variantId, recipeResponse, isDeletion);
          },
          (error: Error): void => this.errorReporter.handleUnhandledError(error)
        );
    } else {
      this.recipeSyncService.addSyncFlag(
        this.recipeSyncService.convertRequestMethodToSyncMethod(requestMethod),
        recipeId
      );
    }
  }

  /***** End Background Requests *****/

}
