/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockDocumentGuard } from '@test/mock-models';

/* Interface imports */
import { DocumentGuard } from '@shared/interfaces';

/* Service imports */
import { TypeGuardService } from './type-guard.service';


describe('TypeGuardService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: TypeGuardService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [ TypeGuardService ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(TypeGuardService);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should concat document guards', (): void => {
    const _mockDocumentGuard: DocumentGuard = mockDocumentGuard();
    const _mockDocumentGuard2: DocumentGuard = {
      prop4: { type: 'string', required: false },
      prop5: { type: 'number', required: true  }
    };

    const concatted: DocumentGuard = service.concatGuards(_mockDocumentGuard, _mockDocumentGuard2);
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
    service.hasValidPropertyHelper = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);

    expect(service.hasValidProperties(validSource, _mockDocumentGuard)).toBe(true);
    expect(service.hasValidProperties(invalidSourceWrongType, _mockDocumentGuard)).toBe(false);
    expect(service.hasValidProperties(invalidSourceMissingRequired, _mockDocumentGuard)).toBe(false);
    expect(service.hasValidProperties(null, _mockDocumentGuard)).toBe(false);
  });

  test('should check if a given property is valid', (): void => {
    const validSourceRequired: object = { prop2: true };
    const validSourceArray: object = { prop1: [ '1', '2', '3' ] };
    const validSourceNotRequired: object = { prop1: undefined };
    const invalidSource: object = {};

    expect(service.hasValidPropertyHelper(validSourceRequired, 'prop2', 'boolean', true)).toBe(true);
    expect(service.hasValidPropertyHelper(validSourceArray, 'prop1', 'string', false)).toBe(true);
    expect(service.hasValidPropertyHelper(validSourceNotRequired, 'prop1', 'string', false)).toBe(true);
    expect(service.hasValidPropertyHelper(invalidSource, 'prop1', 'string', true)).toBe(false);
  });

});
