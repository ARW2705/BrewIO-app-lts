import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Convert an array of observables to an array of the current value of those
 * observables
 *
 * @params: obsArr - an array of observables of an object
 *
 * @return: new array of the current values of each observable
 */
export function getArrayFromObservables<T>(obsArr: Observable<T>[]): T[] {
  return obsArr.map((obs: Observable<T>) => {
    let object: T = null;
    obs.subscribe((data) => object = data);
    return object;
  });
}

/**
 * Convert an array of behavior subjects to an array of the current value of
 * those subjects
 *
 * @params: subArr - an array of behavior subjects of an object
 *
 * @return: new array of the current values of each behavior subject
 */
export function getArrayFromSubjects<T>(subArr: BehaviorSubject<T>[]): T[] {
  return subArr.map((sub: BehaviorSubject<T>): T => sub.value);
}

/**
 * Convert an array into an array of behavior subjects
 *
 * @params: array - array to convert
 *
 * @return: array of behavior subjects
 */
export function toSubjectArray<T>(array: T[]): BehaviorSubject<T>[] {
  return array.map((item) => new BehaviorSubject<T>(item));
}
