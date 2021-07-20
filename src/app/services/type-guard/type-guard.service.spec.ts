/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockDocumentGuard } from '../../../../test-config/mock-models';

/* Interface imports */
import { DocumentGuard } from '../../shared/interfaces';

/* Service imports */
import { TypeGuardService } from './type-guard.service';


describe('TypeGuardService', (): void => {
  let injector: TestBed;
  let typeGuard: TypeGuardService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        TypeGuardService
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    typeGuard = injector.get(TypeGuardService);
  });

  test('should create the service', (): void => {
    expect(typeGuard).toBeDefined();
  });

  test('should concat document guards', (): void => {
    const _mockDocumentGuard: DocumentGuard = mockDocumentGuard();
    const _mockDocumentGuard2: DocumentGuard = {
      prop4: { type: 'string', required: false },
      prop5: { type: 'number', required: true  }
    };

    const concatted: DocumentGuard = typeGuard.concatGuards(_mockDocumentGuard, _mockDocumentGuard2);
    Object.keys(concatted).forEach((key: string, index: number): void => {
      expect(key).toMatch(`prop${index + 1}`);
    });
  });

  test('should check if a given source has the correct types according to a given guard', (): void => {
    const _mockDocumentGuard: DocumentGuard = mockDocumentGuard();
    const validSource: object = {
      prop1: 'test',
      prop2: true,
      prop3: 1
    };
    const invalidSourceWrongType: object = {
      prop1: 'test',
      prop2: true,
      prop3: '1'
    };
    const invalidSourceMissingRequired: object = {
      prop1: 'test',
      prop3: 1
    };

    typeGuard.hasValidPropertyHelper = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);

    expect(typeGuard.hasValidProperties(validSource, _mockDocumentGuard)).toBe(true);
    expect(typeGuard.hasValidProperties(invalidSourceWrongType, _mockDocumentGuard)).toBe(false);
    expect(typeGuard.hasValidProperties(invalidSourceMissingRequired, _mockDocumentGuard)).toBe(false);
    expect(typeGuard.hasValidProperties(null, _mockDocumentGuard)).toBe(false);
  });

  test('should check if a given property is valid', (): void => {
    const validSourceRequired: object = { prop2: true };
    const validSourceArray: object = { prop1: [ '1', '2', '3' ] };
    const validSourceNotRequired: object = { prop1: undefined };
    const invalidSource: object = {};

    expect(typeGuard.hasValidPropertyHelper(validSourceRequired, 'prop2', 'boolean', true)).toBe(true);
    expect(typeGuard.hasValidPropertyHelper(validSourceArray, 'prop1', 'string', false)).toBe(true);
    expect(typeGuard.hasValidPropertyHelper(validSourceNotRequired, 'prop1', 'string', false)).toBe(true);
    expect(typeGuard.hasValidPropertyHelper(invalidSource, 'prop1', 'string', true)).toBe(false);
  });

});
