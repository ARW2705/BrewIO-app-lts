/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

/* Constants imports */
import { API_VERSION, BASE_URL, HIGH_SEVERITY } from '@shared/constants';

/* Interface imports */
import { Author, Image, ImageRequestMetadata, RecipeMaster, RecipeVariant } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Default imports */
import { defaultImage } from '@shared/defaults';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { IdService } from '@services/id/id.service';
import { RecipeImageService } from '@services/recipe/image/recipe-image.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeHttpService {
  readonly privateRoute: string = `${BASE_URL}/${API_VERSION}/recipes/private`;
  readonly publicRoute: string = `${BASE_URL}/${API_VERSION}/recipes/public`;
  defaultImage: Image = defaultImage();

  constructor(
    public errorReporter: ErrorReportingService,
    public http: HttpClient,
    public idService: IdService,
    public recipeImageService: RecipeImageService
  ) { }

  /***** Public API *****/

  /**
   * Get recipe author data
   *
   * @param: recipeId - valid server recipe id to use as base for author search
   * @return: observable of author data or null if an error occurred (such as not found)
   */
  fetchPublicAuthorByRecipeId(recipeId: string): Observable<Author> {
    return this.http.get<Author>(`${this.publicRoute}/master/${recipeId}/author`)
      .pipe(
        catchError((error: Error): Observable<Author> => {
          console.log('Error fetching author', error);
          return of(null);
        })
      );
  }

  /**
   * Get a public recipe by its id
   *
   * @param: recipeId - valid server recipe id to search
   * @return: observable of recipe
   */
  fetchPublicRecipeById(recipeId: string): Observable<RecipeMaster> {
    return this.http.get<RecipeMaster>(`${this.publicRoute}/master/${recipeId}`)
      .pipe(catchError(this.errorReporter.handleGenericCatchError()));
  }

  /**
   * Get all public recipes owned by a user
   *
   * @param: userId - user id to use to search for recipes
   * @return: observable of an array of recipes
   */
  fetchPublicRecipeListByUser(userId: string): Observable<RecipeMaster[]> {
    return this.http.get<RecipeMaster[]>(`${this.publicRoute}/${userId}`)
      .pipe(catchError(this.errorReporter.handleGenericCatchError()));
  }

  /**
   * Get a public recipe variant by its id
   *
   * @param: recipeId - recipe id to which the requested variant belongs
   * @param: variantId - variant id to search
   * @return: observable of recipe
   */
  fetchPublicVariantById(recipeId: string, variantId: string): Observable<RecipeVariant> {
    return this.http.get<RecipeVariant>(`${this.publicRoute}/master/${recipeId}/variant/${variantId}`)
      .pipe(catchError(this.errorReporter.handleGenericCatchError()));
  }

  /***** END Public API *****/


  /***** Private API *****/

  /**
   * Get all recipes owned by the user
   *
   * @param: none
   * @return: observable of recipe list
   */
  fetchPrivateRecipeList(): Observable<RecipeMaster[]> {
    return this.http.get<RecipeMaster[]>(this.privateRoute)
      .pipe(catchError(this.errorReporter.handleGenericCatchError()));
  }

  /***** End Private API *****/


  /***** Background Server Update Methods *****/

  /**
   * Configure a background request while defining which error handling method to use
   *
   * @param: requestMethod - the http method to apply ('post', 'patch', or 'delete')
   * @param: shouldResolveError - true if error should return the error response as an observable
   * or false if error should be handled as an error
   * @param: recipe - the recipe to use in request body
   * @return: observable of recipe, variant, or http error response
   */
  configureBackgroundRequest(
    requestMethod: string,
    shouldResolveError: boolean,
    recipe: RecipeMaster,
    deletionId?: string
  ): Observable<RecipeMaster | HttpErrorResponse> {
    return this.getBackgroundRequest<RecipeMaster>(requestMethod, recipe, null, deletionId)
      .pipe(
        catchError(
          this.errorReporter.handleResolvableCatchError<HttpErrorResponse | never>(shouldResolveError)
        )
      );
  }

  /**
   * Construct a server background request
   *
   * @param: requestMethod - the http method to apply ('post', 'patch', or 'delete')
   * @param: recipe - the recipe to base the request on
   * @param: [variant] - optional variant to base the request on
   * @param: [deletionId] - optional id for deletion if client side doc has already been deleted
   * @return: observable of configured server request
   */
  getBackgroundRequest<T>(
    requestMethod: string,
    recipe: RecipeMaster,
    variant?: RecipeVariant,
    deletionId?: string
  ): Observable<T> {
    if (requestMethod === 'delete') {
      return this.getDeleteRequest<T>(recipe, variant, deletionId);
    }

    const isMaster: boolean = !variant;
    return this.recipeImageService.getImageRequest(recipe, isMaster)
      .pipe(
        mergeMap((imageData: ImageRequestMetadata[]): Observable<T> => {
          const formData: FormData = new FormData();
          formData.append(
            isMaster ? 'recipeMaster' : 'recipeVariant',
            JSON.stringify(isMaster ? recipe : variant)
          );
          if (imageData.length) { // only one image is possible with a recipe
            formData.append(imageData[0].name, imageData[0].blob, imageData[0].filename);
          }

          if (requestMethod === 'post') {
            return this.getPostRequest<T>(recipe, formData, isMaster);
          } else if (requestMethod === 'patch') {
            return this.getPatchRequest<T>(recipe, formData, variant);
          } else {
            const message: string = `Invalid http method: ${requestMethod}`;
            return throwError(new CustomError('HttpRequestError', message, HIGH_SEVERITY, message));
          }
        })
      );
  }

  /**
   * Send server request in background
   *
   * @param: requestMethod - the http method to apply ('post', 'patch', or 'delete')
   * @param: recipe - the recipe to base request on
   * @param: [recipeVariant] - optional variant to base the request on
   * @return: none
   */
  requestInBackground(
    requestMethod: string,
    recipe: RecipeMaster,
    variant?: RecipeVariant
  ): Observable<RecipeMaster | RecipeVariant> {
    console.log(`${requestMethod}ing in background`, recipe, variant);
    if (requestMethod === 'post' || requestMethod === 'patch' || requestMethod === 'delete') {
      return this.getBackgroundRequest<RecipeMaster | RecipeVariant>(requestMethod, recipe, variant);
    } else {
      const message: string = `Unknown request type: ${requestMethod}`;
      return throwError(new CustomError('RecipeError', message, HIGH_SEVERITY, message));
    }
  }

  /***** End Background Server Update Methods *****/


  /***** Request Helpers *****/

  /**
   * Get a configured delete request
   *
   * @param: recipe - the recipe to base the request on
   * @param: [variant] - optional variant to base the request on
   * @param: [deletionId] - optional id for deletion if client side doc has already been deleted
   * @return: observable of configured server delete request
   */
  getDeleteRequest<T>(recipe: RecipeMaster, variant: RecipeVariant, deletionId?: string): Observable<T> {
    // TODO: variant deletions now use recipe update - change to handle with ids only
    let route = `${this.privateRoute}/master/`;
    if (!recipe && !variant && deletionId) {
      route += deletionId;
    } else if (!variant) {
      route += recipe._id;
    } else {
      route += `${recipe._id}/variant/${variant._id}`;
    }
    return this.http.delete<T>(route);
  }

  /**
   * Get a configured patch request
   *
   * @param: recipe - the recipe to base the request on
   * @param: formData - request body form data
   * @param: [variant] - optional variant to base the request on
   * @return: observable of configured server patch request
   */
  getPatchRequest<T>(recipe: RecipeMaster, formData: FormData, variant?: RecipeVariant): Observable<T> {
    return this.http.patch<T>(
      `${this.privateRoute}/master/${recipe._id}${variant ? `/variant/${variant._id}` : ''}`,
      formData
    );
  }

  /**
   * Get a configured post request
   *
   * @param: recipe - the recipe to base the request on
   * @param: formData - request body form data
   * @param: isMaster - true if request is a new recipe; false for a new variant
   * @return: observable of configured server post request
   */
  getPostRequest<T>(recipe: RecipeMaster, formData: FormData, isMaster: boolean): Observable<T> {
    return this.http.post<T>(
      `${this.privateRoute}${isMaster ? '' : `/master/${recipe._id}`}`,
      formData
    );
  }

  /***** End Request Helpers *****/
}
