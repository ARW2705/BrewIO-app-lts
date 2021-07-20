/* Module imports */
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/* Interface imports */
import {
  Batch,
  ErrorReport,
  LibraryStorage,
  InventoryItem,
  RecipeMaster,
  SelectedUnits,
  SyncMetadata,
  User
} from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Default imports */
import { defaultEnglishUnits } from '../../shared/defaults';


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  activeBatchStorageKey: string = 'active';
  archiveBatchStorageKey: string = 'archive';
  inventoryStorageKey: string = 'inventory';
  libraryStorageKey: string = 'library';
  errorReportStorageKey: string = 'logger';
  recipeStorageKey: string = 'recipe';
  syncStorageKey: string = 'sync';
  userStorageKey: string = 'user';

  constructor(public storage: Storage) { }

  /***** Batches *****/

  /**
   * Get all active or archive batches from storage
   *
   * @params: isActive - true for active batches, false for archive batches
   *
   * @return: Observable of array of active batches
   */
  getBatches(isActive: boolean): Observable<Batch[]> {
    return from(this.storage.get(isActive ? this.activeBatchStorageKey : this.archiveBatchStorageKey))
      .pipe(
        map((batches: string): Batch[] => {
          if (batches === null) {
            return [];
          }
          return JSON.parse(batches);
        }),
        catchError((error: Error): Observable<never> => {
          const message: string = 'An error occurred trying to get batches from storage';
          return throwError(this.getCustomError(message, error));
        })
      );
  }

  /**
   * Remove active or archive batches from storage
   *
   * @params: isActive - true for active batches, false for archive batches
   *
   * @return: none
   */
  removeBatches(isActive: boolean): void {
    this.storage.remove(isActive ? this.activeBatchStorageKey : this.archiveBatchStorageKey)
      .then((): void => console.log(`${ isActive ? 'Active' : 'Archive' } batch data cleared`))
      .catch((error: any): void => {
        const message: string = 'An error occurred trying to remove batches from storage';
        throw this.getCustomError(message, error);
      });
  }

  /**
   * Store list of active or archive batches
   *
   * @params: isActive - true for active batches, false for archive batches
   * @params: batchList - list of all active batches
   *
   * @return: Observable of storage set response
   */
  setBatches(isActive: boolean, batchList: Batch[]): Observable<any> {
    return from(
      this.storage.set(
        isActive ? this.activeBatchStorageKey : this.archiveBatchStorageKey,
        JSON.stringify(batchList)
      )
    )
    .pipe(
      catchError((error: Error): Observable<never> => {
        const message: string = 'An error occurred trying to set batches in storage';
        return throwError(this.getCustomError(message, error));
      })
    );
  }

  /***** End Batches *****/


  /***** Error Reports *****/

  /**
   * Get all error reports from storage
   *
   * @params: none
   *
   * @return: Observable of array of error reports
   */
  getErrorReports(): Observable<ErrorReport[]> {
    return from(this.storage.get(this.errorReportStorageKey))
      .pipe(
        map((errorReports: string): ErrorReport[] => {
          if (errorReports === null) {
            return [];
          }
          return JSON.parse(errorReports);
        }),
        catchError((error: Error): Observable<never> => {
          const message: string = 'An error occurred trying to get error reports from storage';
          return throwError(this.getCustomError(message, error));
        })
      );
  }

  /**
   * Remove error reports from storage
   *
   * @params: none
   * @return: none
   */
  removeErrorReports(): void {
    this.storage.remove(this.errorReportStorageKey)
      .then((): void => console.log('Error reports cleared'))
      .catch((error: any): void => {
        const message: string = 'An error occurred trying to remove error reports from storage';
        throw this.getCustomError(message, error);
      });
  }

  /**
   * Store list of error reports
   *
   * @params: none
   *
   * @return: Observable of storage set response
   */
  setErrorReports(errorReports: ErrorReport[]): Observable<any> {
    return from(this.storage.set(this.errorReportStorageKey, JSON.stringify(errorReports)))
      .pipe(
        catchError((error: Error): Observable<never> => {
          const message: string = 'An error occurred trying to set error reports in storage';
          return throwError(this.getCustomError(message, error));
        })
      );
  }

  /***** End Error Reports *****/


  /***** Inventory *****/

  /**
   * Get inventory from storage
   *
   * @params: none
   *
   * @return: Observable of array of inventory items
   */
  getInventory(): Observable<InventoryItem[]> {
    return from(this.storage.get(this.inventoryStorageKey))
      .pipe(
        map((inventory: string): InventoryItem[] => {
          if (inventory === null) {
            return [];
          }
          return JSON.parse(inventory);
        }),
        catchError((error: Error): Observable<never> => {
          const message: string = 'An error occurred trying to get inventory from storage';
          return throwError(this.getCustomError(message, error));
        })
      );
  }

  /**
   * Remove inventory from storage
   *
   * @params: none
   * @return: none
   */
  removeInventory(): void {
    this.storage.remove(this.inventoryStorageKey)
      .then((): void => console.log('Inventory data cleared'))
      .catch((error: any): void => {
        const message: string = 'An error occurred trying to remove inventory from storage';
        throw this.getCustomError(message, error);
      });
  }

  /**
   * Store inventory
   *
   * @params: inventory - array of items in inventory
   *
   * @return: Observable of storage set response
   */
  setInventory(inventory: InventoryItem[]): Observable<any> {
    return from(this.storage.set(this.inventoryStorageKey, JSON.stringify(inventory)))
      .pipe(
        catchError((error: Error): Observable<never> => {
          const message: string = 'An error occurred trying to set inventory in storage';
          return throwError(this.getCustomError(message, error));
        })
      );
  }

  /***** End Inventory *****/


  /***** Library *****/

  /**
   * Get all ingredient/style libraries from storage
   *
   * @params: none
   *
   * @return: Observable of object with each library type
   */
  getLibrary(): Observable<LibraryStorage> {
    return from(this.storage.get(this.libraryStorageKey))
      .pipe(
        map((libraries: string): LibraryStorage => {
          if (libraries === null) {
            return {
              grains: [],
              hops:   [],
              yeast:  [],
              style:  []
            };
          }
          return JSON.parse(libraries);
        }),
        catchError((error: Error): Observable<never> => {
          const message: string = 'An error occurred trying to get library from storage';
          return throwError(this.getCustomError(message, error));
        })
      );
  }

  /**
   * Store ingredient libraries
   *
   * @params: library - object containing libraries of each type
   *
   * @return: Observable of storage set response
   */
  setLibrary(library: LibraryStorage): Observable<any> {
    return from(this.storage.set(this.libraryStorageKey, JSON.stringify(library)))
      .pipe(
        catchError((error: Error): Observable<never> => {
          const message: string = 'An error occurred trying to set library in storage';
          return throwError(this.getCustomError(message, error));
        })
      );
  }

  /***** End Library *****/


  /***** Recipe *****/

  /**
   * Get all recipe masters from storage
   *
   * @params: none
   *
   * @return: Observable of array of recipe masters
   */
  getRecipes(): Observable<RecipeMaster[]> {
    return from(this.storage.get(this.recipeStorageKey))
      .pipe(
        map((recipes: string): RecipeMaster[] => {
          if (recipes === null) {
            return [];
          }
          return JSON.parse(recipes);
        }),
        catchError((error: Error): Observable<never> => {
          const message: string = 'An error occurred trying to get recipes from storage';
          return throwError(this.getCustomError(message, error));
        })
      );
  }

  /**
   * Remove all recipe masters from storage
   *
   * @params: none
   * @return: none
   */
  removeRecipes(): void {
    this.storage.remove(this.recipeStorageKey)
      .then((): void => console.log('Recipe data cleared'))
      .catch((error: any): void => {
        const message: string = 'An error occurred trying to remove recipes from storage';
        throw this.getCustomError(message, error);
      });
  }

  /**
   * Store recipe masters
   *
   * @params: recipeMasterList - array of recipe masters
   *
   * @return: Observable of storage set response
   */
  setRecipes(recipeMasterList: RecipeMaster[]): Observable<any> {
    return from(this.storage.set(this.recipeStorageKey, JSON.stringify(recipeMasterList)))
      .pipe(
        catchError((error: Error): Observable<never> => {
          const message: string = 'An error occurred trying to set recipes in storage';
          return throwError(this.getCustomError(message, error));
        })
      );
  }

  /***** End Recipe *****/


  /***** Sync Flags *****/

  /**
   * Get all sync flags from storage
   *
   * @params: none
   *
   * @return: Observable of array of sync metadata
   */
  getSyncFlags(): Observable<SyncMetadata[]> {
    return from(this.storage.get(this.syncStorageKey))
      .pipe(
        map((flags: string): SyncMetadata[] => {
          if (flags === null) {
            return [];
          }
          return JSON.parse(flags);
        }),
        catchError((error: Error): Observable<never> => {
          const message: string = 'An error occurred trying to get sync flags from storage';
          return throwError(this.getCustomError(message, error));
        })
      );
  }

  /**
   * Remove all sync flags from storage
   *
   * @params: none
   * @return: none
   */
  removeSyncFlags(): void {
    this.storage.remove(this.syncStorageKey)
      .then((): void => console.log('Sync flags cleared'))
      .catch((error: any): void => {
        const message: string = 'An error occurred trying to remove sync flags from storage';
        throw this.getCustomError(message, error);
      });
  }

  /**
   * Store sync flags for given type
   *
   * @params: flags - array of sync flags to store
   *
   * @return: Observable of storage response
   */
  setSyncFlags(flags: SyncMetadata[]): Observable<any> {
    return from(this.storage.set(this.syncStorageKey, JSON.stringify(flags)))
      .pipe(
        catchError((error: Error): Observable<never> => {
          const message: string = 'An error occurred trying to set sync flags in storage';
          return throwError(this.getCustomError(message, error));
        })
      );
  }

  /***** End Sync Flags *****/


  /***** User *****/

  /**
   * Get user data and credentials; if an error is encountered, return an offline user
   *
   * @params: none
   *
   * @return: Observable of user data
   */
  getUser(): Observable<User> {
    return from(this.storage.get(this.userStorageKey))
      .pipe(
        map((user: string): User => {
          if (user === null) {
            throw new Error();
          }
          return JSON.parse(user);
        }),
        catchError((): Observable<User> => {
          const _defaultEnglishUnits: SelectedUnits = defaultEnglishUnits();
          return of({
            cid: 'offline',
            username: '',
            token: '',
            preferredUnitSystem: _defaultEnglishUnits.system,
            units: _defaultEnglishUnits
          });
        })
      );
  }

  /**
   * Remove user data from storage
   *
   * @params: none
   * @return: none
   */
  removeUser(): void {
    this.storage.remove(this.userStorageKey)
      .then((): void => console.log('User data cleared'))
      .catch((error: any): void => {
        const message: string = 'An error occurred trying to remove user from storage';
        throw this.getCustomError(message, error);
      });
  }

  /**
   * Store user data and credentials
   *
   * @params: user - user profile and credentials
   *
   * @return: Observable of storage set response
   */
  setUser(user: User): Observable<any> {
    return from(this.storage.set(this.userStorageKey, JSON.stringify(user)))
      .pipe(
        catchError((error: Error): Observable<never> => {
          const message: string = 'An error occurred trying to set user in storage';
          return throwError(this.getCustomError(message, error));
        })
      );
  }

  /***** End User *****/


  /***** Utilitie Functions *****/

  /**
   * Get a custom storage error
   *
   * @param: baseMessage - additional error message
   * @param: error - the error thrown
   *
   * @return: a new custom error
   */
  getCustomError(baseMessage: string, error: Error): CustomError {
    return new CustomError(
      'StorageError',
      `${baseMessage}: ${error.message}`,
      3,
      baseMessage
    );
  }

  /***** End Utility Functions *****/

}
