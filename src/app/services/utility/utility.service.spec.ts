/* Module imports */
import { SimpleChange } from '@angular/core';
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockNestedObject, mockSubjectArray } from '@test/mock-models';
import { ConnectionServiceStub, IdServiceStub, UserServiceStub } from '@test/service-stubs';

/* Service imports */
import { ConnectionService, IdService, UserService } from '@services/public';
import { UtilityService } from './utility.service';


describe('UtilityService', () => {
  let injector: TestBed;
  let service: UtilityService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        UtilityService,
        { provide: ConnectionService, useClass: ConnectionServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: UserService, useClass: UserServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(UtilityService);
  });

  test('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('Object Helpers', (): void => {

    test('should deep copy an object', (): void => {
      const _mockNestedObject: object = mockNestedObject();
      const cloned: object = service.clone(_mockNestedObject);
      expect(cloned).not.toBe(_mockNestedObject);
      expect(cloned['a']).toBe(_mockNestedObject['a']);
      expect(cloned['b']['e']['f']).toBe(_mockNestedObject['b']['e']['f']);
      expect(cloned['g'][0]['h']).toBe(_mockNestedObject['g'][0]['h']);
      expect(cloned['j'].length).toBe(3);
    });

    test('should compare object ids or compare the arguments themselves with no ids', (): void => {
      expect(service.compareWith({_id: '1'}, {_id: '1'})).toBe(true);
      expect(service.compareWith({_id: '1'}, {_id: '2'})).toBe(false);
      expect(service.compareWith('a', 'a')).toBe(true);
      expect(service.compareWith('a', 'b')).toBe(false);
      expect(service.compareWith({_id: '1'}, null)).toBe(false);
    });

    test('shoudl check if object has property', (): void => {
      const test: object = { a: 1, b: true, c: 'test' };

      expect(service.hasProperty(test, 'a')).toBe(true);
      expect(service.hasProperty(test, 'b')).toBe(true);
      expect(service.hasProperty(test, 'c')).toBe(true);
      expect(service.hasProperty(test, 'd')).toBe(false);
    });

  });


  describe('RXJS Helpers', (): void => {

    test('should convert array of subjects to array of values', (): void => {
      const sourceArray: number[] = [1, 2, 3, 4, 5];
      const _mockSubjectArray: BehaviorSubject<number>[] = mockSubjectArray<number>(sourceArray);

      const converted: number[] = service.getArrayFromBehaviorSubjects<number>(_mockSubjectArray);
      expect(converted).toStrictEqual(sourceArray);
    });

    test('should map an array to an array of behavior subject', (): void => {
      const sourceArray: number[] = [1, 2, 3, 4, 5];

      const converted: BehaviorSubject<number>[] = service.toBehaviorSubjectArray(sourceArray);

      converted.forEach((num$: BehaviorSubject<number>, index: number): void => {
        expect(num$.value).toEqual(index + 1);
      });
    });

  });


  describe('Formatting Helpers', (): void => {

    test('should round number to specified decimal places', (): void => {
      expect(service.roundToDecimalPlace(Math.PI, 4)).toBe(3.1416);
      expect(service.roundToDecimalPlace(Math.PI, 10)).toBe(3.1415926536);
      expect(service.roundToDecimalPlace(Math.PI, 0)).toBe(3);
      expect(service.roundToDecimalPlace(1.000, -2)).toBe(-1);
    });

    test('should remove \'shared properties\'', (): void => {
      const _mockNestedObject: object = mockNestedObject();
      _mockNestedObject[service.sharedProperties[0]] = {};
      _mockNestedObject[service.staticLibraryProperties[0]] = {};
      service.stripSharedProperties(_mockNestedObject);
      expect(_mockNestedObject.hasOwnProperty(service.sharedProperties[0])).toBe(false);
      expect(_mockNestedObject.hasOwnProperty(service.staticLibraryProperties[0])).toBe(true);
    });

    test('should change string to title case', (): void => {
      expect(service.toTitleCase('the quick brown fox jumps over the lazy dog'))
        .toMatch('The Quick Brown Fox Jumps Over The Lazy Dog');
    });

  });


  describe('Lifecycle Helpers', (): void => {

    test('should check if simple changes has new values', (): void => {
      const change: SimpleChange = new SimpleChange(
        { test: true, other: 1 },
        { test: false, other: 1},
        false
      );
      const nonChange: SimpleChange = new SimpleChange(
        { test: true, other: 1 },
        { test: true, other: 1 },
        true
      );

      expect(service.hasChanges(change)).toBe(true);
      expect(service.hasChanges(nonChange)).toBe(false);
    });

  });

  describe('Request helper', (): void => {

    test('should check if a request can be sent', (): void => {
      service.connectionService.isConnected = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      service.userService.isLoggedIn = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      service.idService.hasDefaultIdType = jest.fn().mockReturnValue(false);

      expect(service.canSendRequest(['1a2b3c4d5e', '6f7g8h9i10j'])).toBe(true);
      expect(service.canSendRequest()).toBe(false);
    });

  });

});
