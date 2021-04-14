/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/* Constants imports */
import { API_VERSION } from '../../shared/constants/api-version';
import { BASE_URL } from '../../shared/constants/base-url';

/* Interface imports */
import { Grains, Hops, LibraryStorage, Style, Yeast } from '../../shared/interfaces/library';

/* Service imports */
import { HttpErrorService } from '../http-error/http-error.service';
import { StorageService } from '../storage/storage.service';


@Injectable()
export class LibraryService {
  grainsLibrary: Grains[] = null;
  hopsLibrary: Hops[] = null;
  yeastLibrary: Yeast[] = null;
  styleLibrary: Style[] = null;
  libraryNames: string[] = ['grains', 'hops', 'yeast', 'style'];

  constructor(
    public http: HttpClient,
    public httpError: HttpErrorService,
    public storageService: StorageService
  ) { }

  /***** API access methods *** */

  /**
   * Fetch all libraries from the server; overwrite any existing library
   *
   * @params: none
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
      (error: string): void => {
        // TODO error handle forkjoin
        console.log(`Library fetch error: ${error}`);
      });
  }

  /**
   * Fetch each library type to pre-load into memory, not to be used to return
   * the observables
   *
   * @params: none
   * @return: none
   */
  fetchAllLibraries(): void {
    this.getAllLibrariesFromStorage();
    this.fetchAllLibrariesFromServer();
  }

  /**
   * Helper method to fetch a library for a given type
   *
   * @params: libraryName - the name of the library for the given type;
   * choices include 'grains', 'hops', 'yeast', or 'style'
   *
   * @return: observable of requested library
   */
  fetchLibrary<T>(libraryName: string): Observable<T[]> {
    if (!this.libraryNames.includes(libraryName)) {
      return throwError(`Invalid library name: ${libraryName}`);
    }

    return this.http.get(`${BASE_URL}/${API_VERSION}/library/${libraryName}`)
      .pipe(
        map((library: T[]): T[] => {
          this[`${libraryName}Library`] = library.sort(this.sortAlpha);
          this.updateStorage();
          return library;
        }),
        catchError((error: HttpErrorResponse): Observable<never> => {
          return this.httpError.handleError(error);
        })
      );
  }

  /**
   * Fetch grains library
   *
   * @params: none
   *
   * @return: observable of array of grains
   */
  fetchGrainsLibrary(): Observable<Grains[]> {
    return this.fetchLibrary<Grains>('grains');
  }

  /**
   * Fetch hops library
   *
   * @params: none
   *
   * @return: observable of array of hops
   */
  fetchHopsLibrary(): Observable<Hops[]> {
    return this.fetchLibrary<Hops>('hops');
  }

  /**
   * Fetch yeast library
   *
   * @params: none
   *
   * @return: observable of array of yeast
   */
  fetchYeastLibrary(): Observable<Yeast[]> {
    return this.fetchLibrary<Yeast>('yeast');
  }

  /**
   * Fetch style library
   *
   * @params: none
   *
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
   * @params: none
   *
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
   * @params: none
   *
   * @return: observable of array of grains
   */
  getGrainsLibrary(): Observable<Grains[]> {
    return this.grainsLibrary === null ? this.fetchGrainsLibrary() : of(this.grainsLibrary);
  }

  /**
   * Get hops library from memory or fetch from server if not present
   *
   * @params: none
   *
   * @return: observable of array of hops
   */
  getHopsLibrary(): Observable<Hops[]> {
    return this.hopsLibrary === null ? this.fetchHopsLibrary() : of(this.hopsLibrary);
  }

  /**
   * Get yeast library from memory or fetch from server if not present
   *
   * @params: none
   *
   * @return: observable of array of yeast
   */
  getYeastLibrary(): Observable<Yeast[]> {
    return this.yeastLibrary === null ? this.fetchYeastLibrary() : of(this.yeastLibrary);
  }

  /**
   * Get style library from memory or fetch from server if not present
   *
   * @params: none
   *
   * @return: observable of array of style
   */
  getStyleLibrary(): Observable<Style[]> {
    return this.styleLibrary === null ? this.fetchStyleLibrary() : of(this.styleLibrary);
  }

  /**
   * Helper method to get a library for a given type
   *
   * @params: libraryName - the name of the library for the given type;
   * choices include 'grains', 'hops', 'yeast', or 'style'
   *
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
   * @params: grainId - id of grains document to retrieve
   *
   * @return: observable of grains document
   */
  getGrainsById(grainId: string): Observable<Grains> {
    return this.getIngredientById('grains', grainId);
  }

  /**
   * Get hops by id, fetch the library if one is not present
   *
   * @params: hopsId - id of hops document to retrieve
   *
   * @return: observable of hops document
   */
  getHopsById(hopsId: string): Observable<Hops> {
    return this.getIngredientById('hops', hopsId);
  }

  /**
   * Get yeast by id, fetch the library if one is not present
   *
   * @params: yeastId - id of yeast document to retrieve
   *
   * @return: observable of yeast document
   */
  getYeastById(yeastId: string): Observable<Yeast> {
    return this.getIngredientById('yeast', yeastId);
  }

  /**
   * Get style by id, fetch the library if one is not present
   *
   * @params: styleId - id of yeast document to retrieve
   *
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
   * @params: none
   * @return: none
   */
  getAllLibrariesFromStorage(): void {
    this.storageService.getLibrary()
      .subscribe(
        (libraries: LibraryStorage): void => {
          if (this.grainsLibrary === null) this.grainsLibrary = libraries.grains;
          if (this.hopsLibrary === null) this.hopsLibrary = libraries.hops;
          if (this.yeastLibrary === null) this.yeastLibrary = libraries.yeast;
          if (this.styleLibrary === null) this.styleLibrary = libraries.style;
        },
        (error: string): void => {
          console.log(`${error}: awaiting data from server`);
        }
      );
  }

  /**
   * Comparator to sort object alphabetically
   *
   * @params: a - lefthand object to compare
   * @params: b - righthand object to compare
   *
   * @return: -1 if lefthand should be first, 1 if righthand should be first,
   *          0 if equal
   */
  sortAlpha(a: any, b: any): number {
    if (!a.name || !b.name) return 0;
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  }

  /**
   * Update library storage
   *
   * @params: none
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
      (error: string): void => {
        console.log(`Library store error: ${error}`);
      }
    );
  }

  /***** End utility methods *** */

}
