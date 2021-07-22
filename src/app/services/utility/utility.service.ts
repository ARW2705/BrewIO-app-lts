/* Module imports */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  staticLibraryProperties: string[] = [
    'grainType',
    'hopsType',
    'yeastType',
    'style'
  ];
  sharedProperties: string[] = [
    '_id',
    'createdAt',
    'updatedAt'
  ];

  constructor() { }

  /***** Object Helpers *****/

  /**
   * Deep copy an object - use with objects whose values follow the types
   *  Object, Array, string, number, boolean, or Date
   *
   * @params: obj - object to copy
   *
   * @return: deep copied object
   */
  clone<T>(obj: T): T {
    let newObj: any;

    if (Array.isArray(obj)) {
      newObj = [];
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          newObj.push(this.clone(item));
        } else {
          newObj.push(item);
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      newObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            newObj[key] = this.clone(obj[key]);
          } else {
            newObj[key] = obj[key];
          }
        }
      }
    }

    return newObj;
  }

  /**
   * ion-select comparison function - allows objects as values
   *
   * @params: o1 - comparison object
   * @params: o2 - comparison object
   *
   * @return: true if object ids match
   */
  compareWith(o1: any, o2: any): boolean {
    if (o1 && typeof o1 === 'object' && o2 && typeof o2 === 'object') {
      return o1['_id'] === o2['_id'];
    } else {
      return o1 === o2;
    }
  }

  /***** End Object Helpers *****/


  /***** RXJS Helpers *****/

  /**
   * Convert an array of behavior subjects to an array of the current value of
   * those subjects
   *
   * @params: subArr - an array of behavior subjects of an object
   *
   * @return: new array of the current values of each behavior subject
   */
  getArrayFromSubjects<T>(subArr: BehaviorSubject<T>[]): T[] {
    return subArr.map((sub: BehaviorSubject<T>): T => sub.value);
  }

  /**
   * Convert an array into an array of behavior subjects
   *
   * @params: array - array to convert
   *
   * @return: array of behavior subjects
   */
  toSubjectArray<T>(array: T[]): BehaviorSubject<T>[] {
    return array.map((item: T): BehaviorSubject<T> => new BehaviorSubject<T>(item));
  }

  /***** End RXJS Helpers *****/


  /***** Formatting Helpers *****/

  /**
   * Round a number to a given decimal place
   *
   * @params: numToRound - source number to round off
   * @params: places - number of places to round to
   *
   * @return: rounded off number
   */
  roundToDecimalPlace(baseNum: number, places: number): number {
    if (places < 0) {
      return -1;
    }
    return Math.round(baseNum * Math.pow(10, places)) / Math.pow(10, places);
  }

  /**
   * Remove database specific shared properties from object
   *
   * @params: obj - object to modify
   *
   * @return: none
   */
  stripSharedProperties(obj: object): void {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          this.stripSharedProperties(item);
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (this.staticLibraryProperties.includes(key)) continue;

        if (this.sharedProperties.includes(key)) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.stripSharedProperties(obj[key]);
        }
      }
    }
  }

  /**
   * Change string to title case
   *
   * @params: str - string to modify
   *
   * @return: string in title case
   */
  toTitleCase(str: string): string {
    return str.replace(
      /\b[a-z]/g,
      (firstChar: string): string => firstChar.toUpperCase()
    );
  }

  /***** End Formatting Helpers *****/

}
