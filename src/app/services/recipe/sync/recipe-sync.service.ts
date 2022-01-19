/* Module imports */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/* Constants imports */
import { HIGH_SEVERITY } from '@shared/constants';

/* Interface imports */
import { RecipeMaster, SyncData, SyncError, SyncMetadata, SyncRequests, SyncResponse, User } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { IdService } from '@services/id/id.service';
import { RecipeHttpService } from '@services/recipe/http/recipe-http.service';
import { RecipeTypeGuardService } from '@services/recipe/type-guard/recipe-type-guard.service';
import { SyncService } from '@services/sync/sync.service';
import { UserService } from '@services/user/user.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeSyncService {
  readonly syncBaseRoute: string = 'recipes/private';
  readonly syncKey: string = 'recipe';
  syncErrors: SyncError[] = [];

  constructor(
    public errorReporter: ErrorReportingService,
    public idService: IdService,
    public recipeHttpService: RecipeHttpService,
    public recipeTypeGuardService: RecipeTypeGuardService,
    public syncService: SyncService,
    public userService: UserService
  ) { }

  /**
   * Add a sync flag for a recipe
   *
   * @param: method - valid options - 'create', 'update', or 'delete'
   * @param: docId - document id to apply sync
   * @return: none
   */
  addSyncFlag(method: string, docId: string): void {
    this.syncService.addSyncFlag({ docId, method, docType: 'recipe' });
  }

  /**
   * Convert an http request method name to a sync method name
   *
   * @param: requestMethod - the http request method name
   * @return: the sync method counterpart of request method
   */
  convertRequestMethodToSyncMethod(requestMethod: string): string {
    return this.syncService.convertRequestMethodToSyncMethod(requestMethod);
  }

  /**
   * Clear all sync errors
   *
   * @param: none
   * @return: none
   */
  dismissAllSyncErrors(): void {
    this.syncErrors = [];
  }

  /**
   * Clear a sync error at the given index
   *
   * @param: index - error array index to remove
   * @return: none
   */
  dismissSyncError(index: number): void {
    this.syncErrors.splice(index, 1);
  }

  /**
   * Construct sync requests based on stored sync flags
   *
   * @param: recipeList - current list of recipe behavior subjects
   * @return: configured sync requests object
   */
  generateSyncRequests(recipeList: BehaviorSubject<RecipeMaster>[]): SyncRequests<RecipeMaster> {
    const errors: SyncError[] = [];
    const requests: Observable<HttpErrorResponse | RecipeMaster | SyncData<RecipeMaster>>[] = [];

    this.syncService.getSyncFlagsByType('recipe')
      .forEach((syncFlag: SyncMetadata): void => {
        const recipe$: BehaviorSubject<RecipeMaster> = recipeList
          .find((searchRecipe$: BehaviorSubject<RecipeMaster>): boolean => {
            return this.idService.hasId(searchRecipe$.value, syncFlag.docId);
          });
        if (!recipe$ && syncFlag.method !== 'delete') {
          const errMsg: string = `Sync error: Recipe with id ${syncFlag.docId} not found`;
          errors.push(this.syncService.constructSyncError(errMsg));
          return;
        } else if (syncFlag.method === 'delete') {
          requests.push(
            this.recipeHttpService.configureBackgroundRequest('delete', true, null, syncFlag.docId)
          );
          return;
        }

        const recipe: RecipeMaster = recipe$.value;
        if (this.idService.hasDefaultIdType(recipe.owner)) {
          const user$: BehaviorSubject<User> = this.userService.getUser();
          if (user$ === undefined || user$.value._id === undefined) {
            const errMsg: string = 'Sync error: Cannot get recipe owner\'s id';
            errors.push(this.syncService.constructSyncError(errMsg));
            return;
          }

          recipe.owner = user$.value._id;
        }

        if (syncFlag.method === 'update' && this.idService.isMissingServerId(recipe._id)) {
          const errMsg: string = `Sync error: Recipe with id ${recipe.cid} is missing a server id`;
          errors.push(this.syncService.constructSyncError(errMsg));
        } else if (syncFlag.method === 'create') {
          recipe['forSync'] = true;
          requests.push(this.recipeHttpService.configureBackgroundRequest('post', true, recipe));
        } else if (syncFlag.method === 'update' && !this.idService.isMissingServerId(recipe._id)) {
          requests.push(this.recipeHttpService.configureBackgroundRequest('patch', true, recipe));
        } else {
          const errMsg = `Sync error: Unknown sync flag method '${syncFlag.method}'`;
          errors.push(this.syncService.constructSyncError(errMsg));
        }
      });

    return { syncRequests: requests, syncErrors: errors };
  }

  /**
   * Process sync successes to update in memory docs
   *
   * @param: syncedDataList - an array of successfully synced docs; deleted docs will contain a special
   * flag to avoid searching for an already removed doc
   * @param: recipeList - current list of recipe behavior subjects
   * @return: array of updated recipe behavior subjects
   */
  processSyncSuccess(
    syncDataList: (RecipeMaster | SyncData<RecipeMaster>)[],
    recipeList: BehaviorSubject<RecipeMaster>[]
  ): BehaviorSubject<RecipeMaster>[] {
    syncDataList.forEach((syncData: (RecipeMaster | SyncData<RecipeMaster>)): void => {
      if (!syncData.hasOwnProperty('isDeleted') || !syncData['isDeleted']) { // no further action needed after a deletion operation
        const recipeIndex: number = recipeList
          .findIndex((recipe$: BehaviorSubject<RecipeMaster>): boolean => {
            return this.idService.hasId(recipe$.value, (<RecipeMaster>syncData).cid);
          });
        if (recipeIndex === -1) {
          this.syncErrors.push({
            errCode: -1,
            message: `Sync error: recipe with id ${(<RecipeMaster>syncData).cid} not found`
          });
        } else {
          this.recipeTypeGuardService.checkTypeSafety(syncData);
          recipeList[recipeIndex].next(<RecipeMaster>syncData);
        }
      }
    });

    return recipeList;
  }

  /**
   * Process all sync flags on login or reconnect; ignore reconnects if not logged in
   *
   * @param: onLogin - true if calling sync at login, false for sync on reconnect
   * @param: recipeList - current list of recipe behavior subjects
   * @return: observable of processed list of recipe behavior subjects
   */
  syncOnConnection(
    onLogin: boolean,
    recipeList: BehaviorSubject<RecipeMaster>[]
  ): Observable<BehaviorSubject<RecipeMaster>[]> {
    // Ignore reconnects if not logged in
    if (!onLogin && !this.userService.isLoggedIn()) {
      return of(null);
    }

    const generatedRequests: SyncRequests<RecipeMaster> = this.generateSyncRequests(recipeList);
    const errors: SyncError[] = generatedRequests.syncErrors;
    return this.syncService.sync('recipe', generatedRequests.syncRequests)
      .pipe(
        map((responses: SyncResponse<RecipeMaster>): BehaviorSubject<RecipeMaster>[] => {
          this.syncErrors = responses.errors.concat(errors);
          if (!onLogin) {
            return this.processSyncSuccess(
              <(RecipeMaster | SyncData<RecipeMaster>)[]>(responses.successes),
              recipeList
            );
          }

          return null;
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Post all stored recipes to server
   *
   * @param: recipeList - current list of recipe behavior subjects
   * @return: observable of processed list of recipe behavior subjects
   */
  syncOnSignup(recipeList: BehaviorSubject<RecipeMaster>[]): Observable<BehaviorSubject<RecipeMaster>[]> {
    const requests: (Observable<HttpErrorResponse | RecipeMaster>)[] = [];
    const user$: BehaviorSubject<User> = this.userService.getUser();
    if (!user$ || !user$.value._id) {
      const message: string = 'Sync error: Cannot find recipe owner\'s id';
      requests.push(throwError(new CustomError('SyncError', message, HIGH_SEVERITY, message)));
    } else {
      const user: User = user$.value;
      recipeList.forEach((recipe$: BehaviorSubject<RecipeMaster>): void => {
        const payload: RecipeMaster = recipe$.value;
        payload['owner'] = user._id;
        payload['forSync'] = true;
        requests.push(this.recipeHttpService.configureBackgroundRequest('post', true, payload));
      });
    }

    return this.syncService.sync<RecipeMaster | HttpErrorResponse>('recipe', requests)
      .pipe(
        map((responses: SyncResponse<RecipeMaster>): BehaviorSubject<RecipeMaster>[] => {
          this.syncErrors = responses.errors;
          return this.processSyncSuccess(
            <(RecipeMaster | SyncData<RecipeMaster>)[]>responses.successes,
            recipeList
          );
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }
}
