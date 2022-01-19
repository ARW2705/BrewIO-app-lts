import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecipeServiceStub {
  public getPublicAuthorByRecipeId(...options) {}
  public getPublicRecipe(...options) {}
  public getPublicRecipeListByUser(...options) {}
  public getPublicRecipeVariantById(...options) {}
  public addVariantToRecipeInList(...options) {}
  public createNewRecipe(...options) {}
  public removeRecipeFromList(...options) {}
  public removeVariantFromRecipeInList(...options) {}
  public updateRecipeInList(...options) {}
  public updateVariantOfRecipeInList(...options) {}
  public getCombinedHopsSchedule(...options) {}
  public getRecipeList() {}
  public getRecipeSubjectById(...options) {}
  public isRecipeProcessPresent(...options) {}
  public registerEvents() {}
}
