import { BehaviorSubject } from 'rxjs';

export const mockNestedObject: () => object = (): object => {
  const mock: object = {
    _id: 0,
    a: 1,
    b: {
      c: 2,
      d: 3,
      e: {
        f: 4
      }
    },
    g: [
      {
        h: 5
      },
      {
        i: 6
      }
    ],
    j: [
      1,
      2,
      3
    ],
    k: null
  };
  return mock;
};

export const mockObjectArray: () => object[] = (): object[] => {
  const mock: object[] = [
    {_id: 'a'},
    {_id: 'b'},
    {_id: 'c'},
    {_id: 'd'}
  ];
  return mock;
};

export const mockSubjectArray: <T>(array: T[]) => BehaviorSubject<T>[] = <T>(array: T[]): BehaviorSubject<T>[] => {
  const mock: BehaviorSubject<T>[] = array.map((item: T): BehaviorSubject<T> => new BehaviorSubject<T>(item));
  return mock;
};
