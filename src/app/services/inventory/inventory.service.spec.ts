/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockBatch, mockInventoryItem } from '@test/mock-models';
import { InventoryStateServiceStub } from '@test/service-stubs';

/* Interface imports*/
import { Batch, InventoryItem } from '@shared/interfaces';

/* Service imports */
import { InventoryStateService } from '@services/inventory/state/inventory-state.service';
import { InventoryService } from './inventory.service';


describe('InventoryService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: InventoryService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        InventoryService,
        { provide: InventoryStateService, useClass: InventoryStateServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(InventoryService);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should create an item', (done: jest.DoneCallback): void => {
    service.inventoryStateService.createItem = jest.fn().mockReturnValue(of(null));
    const createSpy: jest.SpyInstance = jest.spyOn(service.inventoryStateService, 'createItem');
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    service.createItem(_mockInventoryItem)
      .subscribe(
        (results: any): void => {
          expect(results).toBeNull();
          expect(createSpy).toHaveBeenCalledWith(_mockInventoryItem);
          done();
        },
        (error: any): void => {
          console.log('Error in: should create an item', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should create an item from a batch', (done: jest.DoneCallback): void => {
    service.inventoryStateService.createItemFromBatch = jest.fn().mockReturnValue(of(null));
    const createSpy: jest.SpyInstance = jest.spyOn(service.inventoryStateService, 'createItemFromBatch');
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockBatch: Batch = mockBatch();

    service.createItemFromBatch(_mockBatch, _mockInventoryItem)
      .subscribe(
        (results: any): void => {
          expect(results).toBeNull();
          expect(createSpy).toHaveBeenCalledWith(_mockBatch, _mockInventoryItem);
          done();
        },
        (error: any): void => {
          console.log('Error in: should create an item from a batch', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get the inventory list', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockList$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
      _mockInventoryItem,
      _mockInventoryItem
    ]);
    service.inventoryStateService.getInventoryList = jest.fn().mockReturnValue(_mockList$);

    const list$: BehaviorSubject<InventoryItem[]> = service.getInventoryList();
    expect(list$.value).toStrictEqual(_mockList$.value);
  });

  test('should remove an item', (done: jest.DoneCallback): void => {
    service.inventoryStateService.removeItem = jest.fn().mockReturnValue(of(null));
    const removeSpy: jest.SpyInstance = jest.spyOn(service.inventoryStateService, 'removeItem');

    service.removeItem('test-id')
      .subscribe(
        (results: any): void => {
          expect(results).toBeNull();
          expect(removeSpy).toHaveBeenCalledWith('test-id');
          done();
        },
        (error: any): void => {
          console.log('Error in: should create an item', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should update an item', (done: jest.DoneCallback): void => {
    service.inventoryStateService.updateItem = jest.fn().mockReturnValue(of(null));
    const updateSpy: jest.SpyInstance = jest.spyOn(service.inventoryStateService, 'updateItem');

    service.updateItem('test-id', { update: true })
      .subscribe(
        (results: any): void => {
          expect(results).toBeNull();
          expect(updateSpy).toHaveBeenCalledWith('test-id', { update: true });
          done();
        },
        (error: any): void => {
          console.log('Error in: should create an item', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should determine if stock type is capacity based', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    _mockInventoryItem.stockType = 'bottle';
    expect(service.isCapacityBased(_mockInventoryItem)).toBe(false);

    _mockInventoryItem.stockType = 'growler';
    expect(service.isCapacityBased(_mockInventoryItem)).toBe(true);

    _mockInventoryItem.stockType = 'keg';
    expect(service.isCapacityBased(_mockInventoryItem)).toBe(true);
  });

});
