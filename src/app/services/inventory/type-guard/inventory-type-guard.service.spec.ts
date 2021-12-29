/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockInventoryItem, mockOptionalItemData } from '@test/mock-models';
import { TypeGuardServiceStub } from '@test/service-stubs';

/* Interface imports*/
import { InventoryItem, OptionalItemData } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { TypeGuardService } from '@services/public';
import { InventoryTypeGuardService } from './inventory-type-guard.service';


describe('InventoryTypeGuardService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: InventoryTypeGuardService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        InventoryTypeGuardService,
        { provide: TypeGuardService, useClass: TypeGuardServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(InventoryTypeGuardService);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should check item type safety', (): void => {
    const _mockError: Error = new Error('test-error');
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    service.isSafeInventoryItem = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.getUnsafeError = jest.fn().mockReturnValue(_mockError);

    service.checkTypeSafety(_mockInventoryItem);

    expect((): void => {
      service.checkTypeSafety(null);
    }).toThrow(_mockError);
  });

  test('should get an unsafe type error', (): void => {
    const _mockError: Error = new Error('test-error');
    const errorString: string = JSON.stringify(_mockError);

    const unsafeError: CustomError = <CustomError>service.getUnsafeError(_mockError);

    expect(unsafeError.name).toMatch('InventoryError');
    expect(unsafeError.message).toMatch(`Given inventory item is invalid: got ${errorString}`);
    expect(unsafeError.severity).toEqual(2);
    expect(unsafeError.userMessage).toMatch('An internal error occurred: invalid inventory item');
  });

  test('should check if an inventory item is type safe', (): void => {
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);
    service.isSafeOptionalItemData = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    expect(service.isSafeInventoryItem(_mockInventoryItem)).toBe(false);
    expect(service.isSafeInventoryItem(_mockInventoryItem)).toBe(false);
    expect(service.isSafeInventoryItem(_mockInventoryItem)).toBe(true);
  });

  test('should check if optional item data is type safe', (): void => {
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const _mockOptionalItemData: OptionalItemData = mockOptionalItemData();

    expect(service.isSafeOptionalItemData(_mockOptionalItemData)).toBe(false);
    expect(service.isSafeOptionalItemData(_mockOptionalItemData)).toBe(true);
  });

});
