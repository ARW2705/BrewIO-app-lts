/* Module imports */
import { BehaviorSubject } from 'rxjs';

/* Mock imports */
import { mockNestedObject, mockObjectArray, mockSubjectArray } from '../../../../test-config/mock-models/mock-generics';

/* Constant imports */
import { SHARED_PROPERTIES } from '../constants/shared-properties';
import { STATIC_LIBRARY_PROPERTIES } from '../constants/static-library-properties';


/* Utility imports */
import { clone } from './clone';
import { getId, getIndexById, hasDefaultIdType, hasId, isMissingServerId } from './id-helpers';
import { getArrayFromSubjects, toSubjectArray } from './subject-helpers';
import { stripSharedProperties } from './strip-shared-properties';
import { compareWith, roundToDecimalPlace, toTitleCase } from './utilities';


describe('UtilityFunctions', (): void => {

  describe('Clone', (): void => {

    test('should deep copy an object', (): void => {
      const _mockNestedObject: object = mockNestedObject();
      const cloned: object = clone(_mockNestedObject);
      expect(cloned).not.toBe(_mockNestedObject);
      expect(cloned['a']).toBe(_mockNestedObject['a']);
      expect(cloned['b']['e']['f']).toBe(_mockNestedObject['b']['e']['f']);
      expect(cloned['g'][0]['h']).toBe(_mockNestedObject['g'][0]['h']);
      expect(cloned['j'].length).toBe(3);
    });

  });


  describe('Id Helpers', (): void => {

    test('should get id', (): void => {
      const obj1: object = { _id: 'id' };
      const obj2: object = { cid: 'id' };
      const obj3: object = {};

      expect(getId(obj1)).toMatch('id');
      expect(getId(obj2)).toMatch('id');
      expect(getId(obj3)).toBeUndefined();
      expect(getId(null)).toBeUndefined();
    });

    test('should get index of object by id', (): void => {
      const _mockObjectArray: object[] = mockObjectArray();
      const foundIndex: number = getIndexById('c', _mockObjectArray);
      expect(foundIndex).toBe(2);
      const notFound: number = getIndexById('e', _mockObjectArray);
      expect(notFound).toBe(-1);
    });

    test('should check if id is a client or server id', (): void => {
      expect(hasDefaultIdType('0123456789012')).toBe(true);
      expect(hasDefaultIdType('0a1b2c3d4e5f6g7h8i9j0kl1')).toBe(false);
      expect(hasDefaultIdType(undefined)).toBe(true);
    });

    test('should check if server id is missing', (): void => {
      expect(isMissingServerId('0a1b2c3d4e5f6g7h8i9j0kl1')).toBe(false);
      expect(isMissingServerId(undefined)).toBe(true);
    });

    test('should check if object contains search id', (): void => {
      const obj1: object = { _id: 'id' };
      const obj2: object = { cid: 'id' };
      const obj3: object = {};

      expect(hasId(obj1, 'id')).toBe(true);
      expect(hasId(obj2, 'id')).toBe(true);
      expect(hasId(obj1, 'other')).toBe(false);
      expect(hasId(obj3, 'id')).toBe(false);
      expect(hasId(obj1, null)).toBe(false);
      expect(hasId(obj1, undefined)).toBe(false);
    });

  });


  describe('Subject Helpers', (): void => {

    test('should convert array of subjects to array of values', (): void => {
      const sourceArray: number[] = [1, 2, 3, 4, 5];
      const _mockSubjectArray: BehaviorSubject<number>[] = mockSubjectArray<number>(sourceArray);

      const converted: number[] = getArrayFromSubjects<number>(_mockSubjectArray);
      expect(converted).toStrictEqual(sourceArray);
    });

    test('should map an array to an array of behavior subject', (): void => {
      const sourceArray: number[] = [1, 2, 3, 4, 5];

      const converted: BehaviorSubject<number>[] = toSubjectArray(sourceArray);

      converted.forEach((num$: BehaviorSubject<number>, index: number): void => {
        expect(num$.value).toEqual(index + 1);
      });
    });

  });


  describe('Shared Properties', (): void => {

    test('should remove \'shared properties\'', (): void => {
      const _mockNestedObject: object = mockNestedObject();
      _mockNestedObject[SHARED_PROPERTIES[0]] = {};
      _mockNestedObject[STATIC_LIBRARY_PROPERTIES[0]] = {};
      stripSharedProperties(_mockNestedObject);
      expect(_mockNestedObject.hasOwnProperty(SHARED_PROPERTIES[0])).toBe(false);
      expect(_mockNestedObject.hasOwnProperty(STATIC_LIBRARY_PROPERTIES[0])).toBe(true);
    });

  });


  describe('Utilities', (): void => {

    test('should compare object ids or compare the arguments themselves with no ids', (): void => {
      expect(compareWith({_id: '1'}, {_id: '1'})).toBe(true);
      expect(compareWith({_id: '1'}, {_id: '2'})).toBe(false);
      expect(compareWith('a', 'a')).toBe(true);
      expect(compareWith('a', 'b')).toBe(false);
      expect(compareWith({_id: '1'}, null)).toBe(false);
    });

    test('should round number to specified decimal places', (): void => {
      expect(roundToDecimalPlace(Math.PI, 4)).toBe(3.1416);
      expect(roundToDecimalPlace(Math.PI, 10)).toBe(3.1415926536);
      expect(roundToDecimalPlace(Math.PI, 0)).toBe(3);
      expect(roundToDecimalPlace(1.000, -2)).toBe(-1);
    });

    test('should change string to title case', (): void => {
      expect(toTitleCase('the quick brown fox jumps over the lazy dog'))
        .toMatch('The Quick Brown Fox Jumps Over The Lazy Dog');
    });

  });

});
