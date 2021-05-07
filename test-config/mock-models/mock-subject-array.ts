/* Module imports */
import { BehaviorSubject } from 'rxjs';

export const mockSubjectArray: <T>(array: T[]) => BehaviorSubject<T>[] = <T>(array: T[]): BehaviorSubject<T>[] => {
  const mock: BehaviorSubject<T>[] = array.map((item: T): BehaviorSubject<T> => new BehaviorSubject<T>(item));
  return mock;
};
