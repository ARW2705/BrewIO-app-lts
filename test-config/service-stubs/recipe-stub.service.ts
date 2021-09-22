import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecipeServiceStub {
  public initFromServer() {}
  public initFromStorage() {}
  public initializeRecipeMasterList() {}
  public registerEvents() {}
  public getPublicAuthorByRecipeId(...options) {}
  public getPublicRecipeMasterById(...options) {}
  public getPublicRecipeMasterListByUser(...options) {}
  public getPublicRecipeVariantById(...options) {}
  public createRecipeMaster(...options) {}
  public createRecipeVariant(...options) {}
  public removeRecipeMasterById(...options) {}
  public removeRecipeVariantById(...options) {}
  public updateRecipeMasterById(...options) {}
  public updateRecipeVariantById(...options) {}
  public configureBackgroundRequest<T>(...options) {}
  public getBackgroundRequest<T>(...options) {}
  public handleBackgroundUpdateResponse(...options) {}
  public requestInBackground(...options) {}
  public addSyncFlag(...options) {}
  public dismissAllSyncErrors() {}
  public dismissSyncError(...options) {}
  public generateSyncRequests() {}
  public processSyncSuccess(...options) {}
  public syncOnConnection(...options) {}
  public syncOnReconnect() {}
  public syncOnSignup() {}
  public addRecipeMasterToList(...options) {}
  public addRecipeVariantToMasterInList(...options) {}
  public canSendRequest(...options) {}
  public formatNewRecipeMaster(...options) {}
  public emitListUpdate() {}
  public getCombinedHopsSchedule(...options) {}
  public getRecipeMasterById(...options) {}
  public getMasterList() {}
  public getRecipeVariantById(...options) {}
  public isRecipeProcessPresent(...options) {}
  public mapRecipeMasterArrayToSubjects(...options) {}
  public removeRecipeFromMasterInList(...options) {}
  public removeRecipeMasterFromList(...options) {}
  public removeRecipeAsMaster(...options) {}
  public setRecipeAsMaster(...options) {}
  public setRecipeIds(...options) {}
  public setRecipeNestedIds<T>(...options) {}
  public updateRecipeStorage() {}
  public updateRecipeMasterInList(...options) {}
  public updateRecipeVariantOfMasterInList(...options) {}
}
