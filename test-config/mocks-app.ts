import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class CalculationsServiceMock {
  public convertDensity(...options) {}
  public convertTemperature(...options) {}
  public convertVolume(...options) {}
  public convertWeight(...options) {}
  public isValidUnit(...options) {}
  public requiresConversion(...options) {}
  public calculateMashEfficiency(...options) {}
  public calculateRecipeValues(...options) {}
  public calculateTotalOriginalGravity(...options) {}
  public calculateTotalIBU(...options) {}
  public calculateTotalSRM(...options) {}
  public getAverageAttenuation(...options) {}
  public getABV(...options) {}
  public getOriginalGravity(...options) {}
  public getFinalGravity(...options) {}
  public getBoilGravity(...options) {}
  public getBignessFactor(...options) {}
  public getBoilTimeFactor(...options) {}
  public getUtilization(...options) {}
  public getIBU(...options) {}
  public getMCU(...options) {}
  public getSRM(...options) {}
}

@Injectable()
export class ClientIdServiceMock {
  public getNewId() { }
}

@Injectable()
export class ConnectionServiceMock {
  public isConnected() {}
  public monitor() {}
  public setOfflineMode(...options) {}
}

@Injectable()
export class EventServiceMock {
  public register(...args) {
    return new Observable();
  }
  public unregister(...args) { }
  public emit(...args) { }
}

@Injectable()
export class FileServiceMock {
  public convertCordovaFileToJSFile(...args) { }
  public convertFileEntrytoCordovaFile(...args) { }
  public copyFileToLocalTmpDir(...args) { }
  public deleteLocalFile(...args) { }
  public getLocalFile(...args) { }
  public getLocalUrl(...args) { }
  public getMetadata(...args) { }
  public getPersistentDirPath() { }
  public getTmpDirPath() { }
  public resolveNativePath() { }
}

@Injectable()
export class ImageServiceMock {
  public copyImageToLocalTmpDir(...options) {}
  public deleteLocalImage(...options) {}
  public importImage() {}
  public storeImageToLocalDir(...options) {}
  public resizeImage(...options) {}
  public blobbifyImages(...options) {}
  public getServerURL(...options) {}
  public handleImageError(...options) {}
  public hasDefaultImage(...options) {}
  public isTempImage(...options) {}
  public setInitialURL(...options) {}
}

@Injectable()
export class LibraryServiceMock {
  public fetchAllLibraries() {}
  public fetchGrainsLibrary() {}
  public fetchHopsLibrary() {}
  public fetchStyleLibrary() {}
  public fetchYeastLibrary() {}
  public getAllLibraries() {}
  public getGrainsLibrary() {}
  public getGrainsById(...options) {}
  public getHopsLibrary() {}
  public getHopsById(...options) {}
  public getYeastLibrary() {}
  public getYeastById(...options) {}
  public getStyleLibrary() {}
  public getStyleById(...options) {}
  public sortAlpha(...options) {}
  public updateStorage() {}
}

@Injectable()
export class HttpErrorServiceMock {
  public handlError(...options) {}
}

@Injectable()
export class PreferencesServiceMock {
  public getPreferredUnitSystemName() {}
  public getSelectedUnits() {}
  public isValidDensityUnit(...options) {}
  public isValidTemperatureUnit(...options) {}
  public isValidUnits(...options) {}
  public isValidVolumeUnit(...options) {}
  public isValidWeightUnit(...options) {}
  public isValidSystem(...options) {}
  public setUnits(...options) {}
}

@Injectable()
export class ProcessServiceMock {
  public initFromServer() {}
  public initFromStorage() {}
  public initializeBatchLists() {}
  public registerEvents() {}
  public endBatchById(...options) {}
  public startNewBatch(...options) {}
  public updateBatch(...options) {}
  public updateMeasuredValues(...options) {}
  public updateStepById(...options) {}
  public configureBackgroundRequest(...options) {}
  public getBackgroundRequest(...options) {}
  public requestInBackground(...options) {}
  public addSyncFlag(...options) {}
  public dismissAllErrors() {}
  public dismissSyncError(...options) {}
  public generateSyncRequests() {}
  public processSyncSuccess(...options) {}
  public syncOnConnection(...options) {}
  public syncOnReconnect(...options) {}
  public syncOnSignup() {}
  public addBatchToActiveList(...options) {}
  public archiveActiveBatch(...options) {}
  public canSendRequest(...options) {}
  public clearBatchList(...options) {}
  public clearAllBatchLists() {}
  public emitBatchListUpdate(...options) {}
  public generateBatchFromRecipe(...options) {}
  public getAllBatchesList() {}
  public getBatchById(...options) {}
  public getBatchList(...options) {}
  public mapBatchArrayToSubjectArray(...options) {}
  public removeBatchFromList(...options) {}
  public updateBatchStorage(...options) {}
}

@Injectable()
export class RecipeServiceMock {
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

@Injectable()
export class StorageServiceMock {
  public getBatches(...options) {}
  public removeBatches(...options) {}
  public setBatches(...options) {}
  public getInventory() {}
  public removeInventory() {}
  public setInventory(...options) {}
  public getLibrary() {}
  public setLibrary(...options) {}
  public getRecipes() {}
  public removeRecipes() {}
  public setRecipes(...options) {}
  public getSyncFlags() {}
  public removeSyncFlags() {}
  public setSyncFlags(...options) {}
  public getUser() {}
  public removeUser() {}
  public setUser(...options) {}
}

@Injectable()
export class SyncServiceMock {
  public clearSyncData() {}
  public clearSyncFlagByType(...options) {}
  public constructSyncError(...options) {}
  public getAllSyncFlags() {}
  public getSyncFlagsByType(...options) {}
  public addSyncFlag(...options) {}
  public processSyncErrors(...options) {}
  public sync<T>(...options) {}
  public updateStorage() {}
}

@Injectable()
export class ToastServiceMock {
  public presentToast(...options) {}
  public presentErrorToast(...options) {}
}

@Injectable()
export class UserServiceMock {
  public checkJWToken() {}
  public clearUserData() {}
  public getToken() {}
  public getUser() {}
  public isLoggedIn() {}
  public loadUserFromStorage() {}
  public logIn(...options) {}
  public logOut() {}
  public mapUserData(...options) {}
  public navToHome() {}
  public signUp(...options) {}
  public updateUserProfile(...options) {}
  public updateUserStorage() {}
  public canSendRequest(...options) {}
  public composeImageStoreRequests(...options) {}
  public composeImageploadRequests(...options) {}
  public configureBackgroundRequest(...options) {}
  public configureRequestBody(...options) {}
  public requestInBackground(...options) {}
  public addSyncFlag(...options) {}
  public syncOnConnection() {}
}
