/* Module imports */
import { Injectable } from '@angular/core';

/* Interface imports */
import { DocumentGuard } from '../../shared/interfaces';


@Injectable({
  providedIn: 'root'
})
export class TypeGuardService {

  constructor() { }

  /**
   * Combine two or more type guard metadata into a single guard
   *
   * @param: guards - collection of type guard metadata to combine
   *
   * @return: unified document validation metadata
   */
  concatGuards(...guards: DocumentGuard[]): DocumentGuard {
    const combinedValidations: DocumentGuard = {};
    guards.forEach((guard: DocumentGuard): void => {
      for (const key in guard) {
        if (guard.hasOwnProperty(key) && !combinedValidations.hasOwnProperty(key)) {
          combinedValidations[key] = guard[key];
        }
      }
    });
    return combinedValidations;
  }

  /**
   * Check if given source adheres to its document validation legend
   * Shallow check only: nested interfaces must have their own validation performed
   *
   * @param: source - the source document to verify
   * @param: guard - the corresponding validation metadata to use to determine correctness
   *
   * @return: true if all properties with primitive types are correct
   */
  hasValidProperties(source: any, guard: DocumentGuard): boolean {
    console.log('Checking...', source);
    if (source && typeof source === 'object') {
      for (const key in guard) {
        if (!this.hasValidPropertyHelper(source, key, guard[key].type, guard[key].required)) {
          console.error(`Invalid type for ${key}: expected ${guard[key].type}, got ${typeof source[key]}`);
          return false;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Check if a given source's property is valid
   *
   * @param: source - parent source to check
   * @param: propName - property key to check,
   * @param: type - the expected type of the property's value
   * @param: required - true if property must be present
   *
   * @return: true if given source property is present when required and of the correct type
   */
  hasValidPropertyHelper(source: any, propName: string, type: string, required: boolean): boolean {
    const hasProperty: boolean = source.hasOwnProperty(propName);
    const isMissing: boolean = !hasProperty || source[propName] === undefined || source[propName] === null;

    if (!required && isMissing) {
      return true;
    } else if (isMissing) {
      return false;
    } else if (Array.isArray(source[propName])) {
      return source[propName].length === 0 || typeof source[propName][0] === type;
    } else {
      return typeof source[propName] === type;
    }
  }
}
