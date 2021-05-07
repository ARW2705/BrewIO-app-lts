import { Injectable } from '@angular/core';

@Injectable()
export class LibraryServiceStub {
  public fetchAllLibrariesFromServer() {}
  public fetchAllLibraries() {}
  public fetchLibrary<T>(...options) {}
  public fetchGrainsLibrary() {}
  public fetchHopsLibrary() {}
  public fetchYeastLibrary() {}
  public fetchStyleLibrary() {}
  public getAllLibraries() {}
  public getGrainsLibrary() {}
  public getHopsLibrary() {}
  public getYeastLibrary() {}
  public getStyleLibrary() {}
  public getIngredientById<T>(...options) {}
  public getGrainsById(...options) {}
  public getHopsById(...options) {}
  public getYeastById(...options) {}
  public getStyleById(...options) {}
  public getAllLibrariesFromStorage() {}
  public sortAlpha(...options) {}
  public updateStorage() {}
}
