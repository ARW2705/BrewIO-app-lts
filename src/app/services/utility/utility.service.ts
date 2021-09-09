/* Module imports */
import { Injectable, SimpleChange } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/* Custom Type imports */
import { ArrayElement, CustomError } from '../../shared/types';


@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  protoHasProperty: (v: string | number | symbol) => boolean = Object.prototype.hasOwnProperty;
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

  /***** Array Helpers *****/

  /**
   * Typescript array union workaround
   * https://github.com/microsoft/TypeScript/issues/30271
   * https://github.com/Microsoft/TypeScript/issues/7294#issuecomment-465794460
   *
   * @param: array - input array to convert
   * @return: converted array
   */
  flattenArrayType<T>(array: T): ArrayElement<T>[] {
    return array as any;
  }

  /**
   * Perform provided callback function within a given range of numbers
   *
   * @param: callbackFn - callback function to execute for each number
   * @param: stop - stop after this count (exclusive)
   * @param: [start] - optional start number; defaults to 0
   * @param: [step] - optional step size; defaults to 1
   *
   * @return: none
   */
  forInRange(
    callbackFn: (index: number) => void,
    stop: number,
    start: number = 0,
    step: number = 1
  ): void {
    if (step === 0) {
      const message: string = 'Range step interval must not be 0';
      const severity: number = 2;
      throw new CustomError('ValueError', message, severity, message);
    }

    const isIncreasing: boolean = step > 0;
    if (isIncreasing ? stop > start : stop < start) {
      const loopStop: number = Math.abs(stop);
      for (let i: number = start; Math.abs(i) < loopStop; i += step) {
        callbackFn(i);
      }
    }
  }

  /***** End Array Helpers *****/


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

  /**
   * Determines whether an object has a property with a specified name
   *
   *
   * @param: obj - the object to test
   * @param: key - property identifier
   *
   * @return: true if object contains the key
   */
  hasProperty(obj: object, key: (string | number | symbol)): boolean {
    return this.protoHasProperty.call(obj, key);
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
    const tens: number = 10;
    return Math.round(baseNum * tens ** places) / tens ** places;
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
        if (this.staticLibraryProperties.includes(key)) {
          continue;
        }

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


  /***** Lifecycle Helpers *****/

  /**
   * Check if new SimpleChange value has the same values as the previous SimpleChange value
   *
   * @params: changes - changes detected from ngOnChanges
   *
   * @return: true if current values are different than previous values
   */
  hasChanges(changes: SimpleChange): boolean {
    return JSON.stringify(changes.currentValue) !== JSON.stringify(changes.previousValue);
  }

  /***** End Lifecycle Helpers *****/


  /***** String Helpers *****/

  isUpperCase(str: string): boolean {
    return !(new RegExp(/[a-z]+/)).test(str);
  }

  isLowerCase(str: string): boolean {
    return !(new RegExp(/[A-Z]+/)).test(str);
  }

  /***** End String Helpers *****/

}
