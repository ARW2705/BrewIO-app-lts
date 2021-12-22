/* Module imports */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/* Constants imports */
import { API_VERSION, BASE_URL } from '../../shared/constants';

/* Interface imports */
import { Grains, Hops, LibraryStorage, Style, Yeast } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Type guard imports */
import { GrainsGuardMetadata, HopsGuardMetadata, StyleGuardMetadata, YeastGuardMetadata } from '../../shared/type-guard-metadata';

/* Service imports */
import { ErrorReportingService } from '../error-reporting/error-reporting.service';
import { StorageService } from '../storage/storage.service';
import { TypeGuardService } from '../type-guard/type-guard.service';


@Injectable()
export class LibraryService {
  grainsLibrary: Grains[] = null;
  hopsLibrary: Hops[] = null;
  libraryNames: string[] = ['grains', 'hops', 'yeast', 'style'];
  styleLibrary: Style[] = null;
  yeastLibrary: Yeast[] = null;

  constructor(
    public errorReporter: ErrorReportingService,
    public http: HttpClient,
    public storageService: StorageService,
    public typeGuard: TypeGuardService
  ) { }

  /***** API access methods *** */

  /**
   * Fetch all libraries from the server; overwrite any existing library
   *
   * @param: none
   * @return: none
   */
  fetchAllLibrariesFromServer(): void {
    forkJoin(
      this.fetchGrainsLibrary(),
      this.fetchHopsLibrary(),
      this.fetchYeastLibrary(),
      this.fetchStyleLibrary()
    )
    .subscribe(
      ([grainsLibrary, hopsLibrary, yeastLibrary, styleLibrary]): void => {
        this.grainsLibrary = grainsLibrary;
        this.hopsLibrary = hopsLibrary;
        this.yeastLibrary = yeastLibrary;
        this.styleLibrary = styleLibrary;
        this.updateStorage();
      },
      (error: any): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Fetch each library type to pre-load into memory, not to be used to return
   * the observables
   *
   * @param: none
   * @return: none
   */
  fetchAllLibraries(): void {
    this.getAllLibrariesFromStorage();
    this.fetchAllLibrariesFromServer();
  }

  /**
   * Helper method to fetch a library for a given type
   *
   * @param: libraryName - the name of the library for the given type;
   * choices include 'grains', 'hops', 'yeast', or 'style'
   * @return: observable of requested library
   */
  fetchLibrary<T>(libraryName: string): Observable<T[]> {
    if (!this.libraryNames.includes(libraryName)) {
      const message: string = `Invalid library name: ${libraryName}`;
      return throwError(new CustomError('LibraryError', message, 2, message));
    }

    return this.http.get(`${BASE_URL}/${API_VERSION}/library/${libraryName}`)
      .pipe(
        map((library: T[]): T[] => {
          this[`${libraryName}Library`] = library.sort(this.sortAlpha);
          this.updateStorage();
          return library;
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Fetch grains library
   *
   * @param: none
   * @return: observable of array of grains
   */
  fetchGrainsLibrary(): Observable<Grains[]> {
    return this.fetchLibrary<Grains>('grains');
  }

  /**
   * Fetch hops library
   *
   * @param: none
   * @return: observable of array of hops
   */
  fetchHopsLibrary(): Observable<Hops[]> {
    return this.fetchLibrary<Hops>('hops');
  }

  /**
   * Fetch yeast library
   *
   * @param: none
   * @return: observable of array of yeast
   */
  fetchYeastLibrary(): Observable<Yeast[]> {
    return this.fetchLibrary<Yeast>('yeast');
  }

  /**
   * Fetch style library
   *
   * @param: none
   * @return: observable of array of style
   */
  fetchStyleLibrary(): Observable<Style[]> {
    return this.fetchLibrary<Style>('style');
  }

  /***** End API access methods *****/


  /***** Local Get Methods *****/

  /**
   * Call get methods for each library type
   *
   * @param: none
   * @return: combined observable of all library requests
   */
  getAllLibraries(): Observable<(Grains[] | Hops[] | Yeast[] | Style[])[]> {
    console.log('get libraries');
    return forkJoin(
      this.getGrainsLibrary(),
      this.getHopsLibrary(),
      this.getYeastLibrary(),
      this.getStyleLibrary()
    );
  }

  /**
   * Get grains library from memory or fetch from server if not present
   *
   * @param: none
   * @return: observable of array of grains
   */
  getGrainsLibrary(): Observable<Grains[]> {
    return this.grainsLibrary === null ? this.fetchGrainsLibrary() : of(this.grainsLibrary);
  }

  /**
   * Get hops library from memory or fetch from server if not present
   *
   * @param: none
   * @return: observable of array of hops
   */
  getHopsLibrary(): Observable<Hops[]> {
    return this.hopsLibrary === null ? this.fetchHopsLibrary() : of(this.hopsLibrary);
  }

  /**
   * Get yeast library from memory or fetch from server if not present
   *
   * @param: none
   * @return: observable of array of yeast
   */
  getYeastLibrary(): Observable<Yeast[]> {
    return this.yeastLibrary === null ? this.fetchYeastLibrary() : of(this.yeastLibrary);
  }

  /**
   * Get style library from memory or fetch from server if not present
   *
   * @param: none
   * @return: observable of array of style
   */
  getStyleLibrary(): Observable<Style[]> {
    return this.styleLibrary === null ? this.fetchStyleLibrary() : of(this.styleLibrary);
  }

  /**
   * Helper method to get a library for a given type
   *
   * @param: libraryName - the name of the library for the given type;
   * choices include 'grains', 'hops', 'yeast', or 'style'
   * @return: observable of requested library
   */
  getIngredientById<T>(ingredientName: string, id: string): Observable<T> {
    if (!this.libraryNames.includes(ingredientName)) {
      return throwError(`Invalid library name: ${ingredientName}`);
    }

    let ingredient: T;

    if (this[`${ingredientName}Library`] !== null) {
      ingredient = this[`${ingredientName}Library`]
        .find((entry: T): boolean => entry['_id'] === id);
    }

    return ingredient !== undefined
      ? of(ingredient)
      : this.fetchLibrary<T>(ingredientName)
        .pipe(map((library: T[]): T => library.find((entry: T): boolean => entry['_id'] === id)));
  }

  /**
   * Get grains by id, fetch the library if one is not present
   *
   * @param: grainId - id of grains document to retrieve
   * @return: observable of grains document
   */
  getGrainsById(grainId: string): Observable<Grains> {
    return this.getIngredientById('grains', grainId);
  }

  /**
   * Get hops by id, fetch the library if one is not present
   *
   * @param: hopsId - id of hops document to retrieve
   * @return: observable of hops document
   */
  getHopsById(hopsId: string): Observable<Hops> {
    return this.getIngredientById('hops', hopsId);
  }

  /**
   * Get yeast by id, fetch the library if one is not present
   *
   * @param: yeastId - id of yeast document to retrieve
   * @return: observable of yeast document
   */
  getYeastById(yeastId: string): Observable<Yeast> {
    return this.getIngredientById('yeast', yeastId);
  }

  /**
   * Get style by id, fetch the library if one is not present
   *
   * @param: styleId - id of yeast document to retrieve
   * @return: observable of style
   */
  getStyleById(styleId: string): Observable<Style> {
    return this.getIngredientById('style', styleId);
  }

  /***** End Local Get Methods *****/


  /***** Utility Methods *****/

  /**
   * Get all libraries that have been stored; do not overwrite any library that is already present
   *
   * @param: none
   * @return: none
   */
  getAllLibrariesFromStorage(): void {
    this.storageService.getLibrary()
      .subscribe(
        (libraries: LibraryStorage): void => {
          if (this.grainsLibrary === null) {
            this.grainsLibrary = libraries.grains;
          }
          if (this.hopsLibrary === null) {
            this.hopsLibrary = libraries.hops;
          }
          if (this.yeastLibrary === null) {
            this.yeastLibrary = libraries.yeast;
          }
          if (this.styleLibrary === null) {
            this.styleLibrary = libraries.style;
          }
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Comparator to sort object alphabetically
   *
   * @param: a - lefthand object to compare
   * @param: b - righthand object to compare
   * @return: -1 if lefthand should be first, 1 if righthand should be first,
   *          0 if equal
   */
  sortAlpha(a: any, b: any): number {
    if (!a.name || !b.name) {
      return 0;
    }
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  /**
   * Update library storage
   *
   * @param: none
   * @return: none
   */
  updateStorage(): void {
    this.storageService.setLibrary({
      grains: this.grainsLibrary,
      hops: this.hopsLibrary,
      yeast: this.yeastLibrary,
      style: this.styleLibrary
    })
    .subscribe(
      (): void => {},
      (error: any): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /***** End utility methods *****/


  /***** Type Guard *****/

  /**
   * Check if given grains object is valid by correctly implementing the Grains interface
   *
   * @param: grains - expects a Grains at runtime
   * @return: true if given grains correctly implements Grains interface
   */
  isSafeGrains(grains: any): boolean {
    return this.typeGuard.hasValidProperties(grains, GrainsGuardMetadata);
  }

  /**
   * Check if given hops object is valid by correctly implementing the Hops interface
   *
   * @param: hops - expects a Hops at runtime
   * @return: true if given hops correctly implements Hops interface
   */
  isSafeHops(hops: any): boolean {
    return this.typeGuard.hasValidProperties(hops, HopsGuardMetadata);
  }

  /**
   * Check if given yeast object is valid by correctly implementing the Yeast interface
   *
   * @param: yeast - expects a Yeast at runtime
   * @return: true if given yeast correctly implements Yeast interface
   */
  isSafeYeast(yeast: any): boolean {
    return this.typeGuard.hasValidProperties(yeast, YeastGuardMetadata);
  }

  /**
   * Check if given style object is valid by correctly implementing the Style interface
   *
   * @param: style - expects a Style at runtime
   * @return: true if given style correctly implements Style interface
   */
  isSafeStyle(style: any): boolean {
    return this.typeGuard.hasValidProperties(style, StyleGuardMetadata);
  }

  /***** End Type Guard *****/

}
