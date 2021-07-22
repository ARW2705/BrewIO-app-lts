/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockNestedObject, mockSubjectArray } from '../../../../test-config/mock-models';

/* Service imports */
import { UtilityService } from './utility.service';


describe('UtilityService', () => {
  let injector: TestBed;
  let utilService: UtilityService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        UtilityService
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    utilService = injector.get(UtilityService);
  });

  test('should create the service', () => {
    expect(utilService).toBeTruthy();
  });


  describe('Object Helpers', (): void => {

    test('should deep copy an object', (): void => {
      const _mockNestedObject: object = mockNestedObject();
      const cloned: object = utilService.clone(_mockNestedObject);
      expect(cloned).not.toBe(_mockNestedObject);
      expect(cloned['a']).toBe(_mockNestedObject['a']);
      expect(cloned['b']['e']['f']).toBe(_mockNestedObject['b']['e']['f']);
      expect(cloned['g'][0]['h']).toBe(_mockNestedObject['g'][0]['h']);
      expect(cloned['j'].length).toBe(3);
    });

    test('should compare object ids or compare the arguments themselves with no ids', (): void => {
      expect(utilService.compareWith({_id: '1'}, {_id: '1'})).toBe(true);
      expect(utilService.compareWith({_id: '1'}, {_id: '2'})).toBe(false);
      expect(utilService.compareWith('a', 'a')).toBe(true);
      expect(utilService.compareWith('a', 'b')).toBe(false);
      expect(utilService.compareWith({_id: '1'}, null)).toBe(false);
    });

  });


  describe('RXJS Helpers', (): void => {

    test('should convert array of subjects to array of values', (): void => {
      const sourceArray: number[] = [1, 2, 3, 4, 5];
      const _mockSubjectArray: BehaviorSubject<number>[] = mockSubjectArray<number>(sourceArray);

      const converted: number[] = utilService.getArrayFromSubjects<number>(_mockSubjectArray);
      expect(converted).toStrictEqual(sourceArray);
    });

    test('should map an array to an array of behavior subject', (): void => {
      const sourceArray: number[] = [1, 2, 3, 4, 5];

      const converted: BehaviorSubject<number>[] = utilService.toSubjectArray(sourceArray);

      converted.forEach((num$: BehaviorSubject<number>, index: number): void => {
        expect(num$.value).toEqual(index + 1);
      });
    });

  });


  describe('Formatting Helpers', (): void => {

    test('should round number to specified decimal places', (): void => {
      expect(utilService.roundToDecimalPlace(Math.PI, 4)).toBe(3.1416);
      expect(utilService.roundToDecimalPlace(Math.PI, 10)).toBe(3.1415926536);
      expect(utilService.roundToDecimalPlace(Math.PI, 0)).toBe(3);
      expect(utilService.roundToDecimalPlace(1.000, -2)).toBe(-1);
    });

    test('should remove \'shared properties\'', (): void => {
      const _mockNestedObject: object = mockNestedObject();
      _mockNestedObject[utilService.sharedProperties[0]] = {};
      _mockNestedObject[utilService.staticLibraryProperties[0]] = {};
      utilService.stripSharedProperties(_mockNestedObject);
      expect(_mockNestedObject.hasOwnProperty(utilService.sharedProperties[0])).toBe(false);
      expect(_mockNestedObject.hasOwnProperty(utilService.staticLibraryProperties[0])).toBe(true);
    });

    test('should change string to title case', (): void => {
      expect(utilService.toTitleCase('the quick brown fox jumps over the lazy dog'))
        .toMatch('The Quick Brown Fox Jumps Over The Lazy Dog');
    });

  });

});
