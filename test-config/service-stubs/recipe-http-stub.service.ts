import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecipeHttpServiceStub {
  public fetchPublicAuthorByRecipeId(...options) {}
  public fetchPublicRecipeById(...options) {}
  public fetchPublicRecipeListByUser(...options) {}
  public fetchPublicVariantById(...options) {}
  public fetchPrivateRecipeList(...options) {}
  public configureBackgroundRequest(...options) {}
  public getBackgroundRequest(...options) {}
  public requestInBackground(...options) {}
  public getDeleteRequest(...options) {}
  public getPatchRequest(...options) {}
  public getPostRequest<T>(...options) {}
}
