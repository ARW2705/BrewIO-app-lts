import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecipeStateServiceStub {
  public initFromServer() {}
  public initFromStorage() {}
  public initRecipeList() {}
  public handleSyncResponse(...options) {}
  public syncOnSignup() {}
  public syncOnConnection(...options) {}
  public addRecipeToList(...options) {}
  public addVariantToRecipeInList(...options) {}
  public clearRecipes(...options) {}
  public emitListUpdate(...options) {}
  public removeVariantFromRecipeInList(...options) {}
  public removeRecipeFromList(...options) {}
  public removeRecipeAsMaster(...options) {}
  public setRecipeAsMaster(...options) {}
  public updateRecipeStorage() {}
  public updateRecipeInList(...options) {}
  public updateVariantOfRecipeInList(...options) {}
  public createBaseRecipe(...options) {}
  public createNewRecipe(...options) {}
  public getCustomError(...options) {}
  public getRecipeById(...options) {}
  public getRecipeList() {}
  public getRecipeSubjectById(...options) {}
  public mapRecipeListToSubjectList(...options) {}
  public setRecipeIds(...options) {}
  public setRecipeNestedIds<T>(...options) {}
  public handleBackgroundUpdateResponse(...options) {}
  public sendBackgroundRequest(...options) {}
}
