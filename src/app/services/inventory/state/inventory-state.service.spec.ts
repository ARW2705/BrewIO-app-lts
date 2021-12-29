/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { BehaviorSubject, Observable, Subject, concat, forkJoin, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockAuthor, mockBatch, mockImage, mockImageRequestMetadata, mockInventoryItem, mockOptionalItemData, mockRecipeMasterActive, mockErrorResponse, mockStyles, mockSyncMetadata, mockSyncError, mockSyncResponse } from '@test/mock-models';
import { ConnectionServiceStub, ErrorReportingServiceStub, EventServiceStub, IdServiceStub, InventoryHttpServiceStub, InventoryImageServiceStub, InventorySyncServiceStub, InventoryTypeGuardServiceStub, LibraryServiceStub, RecipeServiceStub, StorageServiceStub, UserServiceStub } from '@test/service-stubs';
import { SplashScreenStub } from '@test/ionic-stubs';

/* Constants imports */
import { API_VERSION, BASE_URL } from '@shared/constants';

/* Default imports */
import { defaultImage } from '@shared/defaults';

/* Interface imports*/
import { Author, Batch, Image, ImageRequestFormData, ImageRequestMetadata, InventoryItem, OptionalItemData, RecipeMaster, Style, SyncData, SyncRequests, SyncMetadata, SyncError, SyncResponse } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { InventoryHttpService } from '@services/inventory/http/inventory-http.service';
import { InventoryImageService } from '@services/inventory/image/inventory-image.service';
import { InventorySyncService } from '@services/inventory/sync/inventory-sync.service';
import { InventoryTypeGuardService } from '@services/inventory/type-guard/inventory-type-guard.service';
import { ConnectionService, ErrorReportingService, EventService, IdService, LibraryService, RecipeService, StorageService, UserService } from '@services/public';
import { InventoryStateService } from './inventory-state.service';


describe('InventoryStateService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: InventoryStateService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        InventoryStateService,
        { provide: ConnectionService, useClass: ConnectionServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: EventService, useClass: EventServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: InventoryHttpService, useClass: InventoryHttpServiceStub },
        { provide: InventoryImageService, useClass: InventoryImageServiceStub },
        { provide: InventorySyncService, useClass: InventorySyncServiceStub },
        { provide: InventoryTypeGuardService, useClass: InventoryTypeGuardServiceStub },
        { provide: LibraryService, useClass: LibraryServiceStub },
        { provide: RecipeService, useClass: RecipeServiceStub },
        { provide: SplashScreen, useClass: SplashScreenStub },
        { provide: StorageService, useClass: StorageServiceStub },
        { provide: UserService, useClass: UserServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(InventoryStateService);
    service.errorReporter.handleUnhandledError = jest.fn();
    service.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: any) => Observable<never> => {
        return (error: any): Observable<never> => throwError(error);
      });
    service.inventoryTypeGuardService.checkTypeSafety = jest.fn();
  });

  test('should create the service', (): void => {
    service.registerEvents = jest.fn();
    expect(service).toBeTruthy();
  });

  describe('Initializations', (): void => {

    test('should initialize inventory from server', (done: jest.DoneCallback): void => {
      service.registerEvents = jest.fn();
      service.canSendRequest = jest.fn().mockReturnValue(true);
      service.syncOnConnection = jest.fn().mockReturnValue(of(null));
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const mockInventoryList: InventoryItem[] = [ _mockInventoryItem, _mockInventoryItem ];
      service.inventoryHttpService.getInventoryFromServer = jest.fn()
        .mockReturnValue(of(mockInventoryList));
      service.setInventory = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setInventory');

      service.initFromServer()
        .subscribe(
          (results: any): void => {
            expect(results).toBeNull();
            expect(setSpy).toHaveBeenCalledWith(mockInventoryList);
            done();
          },
          (error: any): void => {
            console.log('Error in: should initialize inventory from server', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should not initialize inventory from server if request cannot be sent', (done: jest.DoneCallback): void => {
      service.registerEvents = jest.fn();
      service.canSendRequest = jest.fn().mockReturnValue(false);
      const syncSpy: jest.SpyInstance = jest.spyOn(service, 'syncOnConnection');

      service.initFromServer()
        .subscribe(
          (results: any): void => {
            expect(results).toBeNull();
            expect(syncSpy).not.toHaveBeenCalled();
            done();
          },
          (error: any): void => {
            console.log('Error in: should not initialize inventory from server if request cannot be sent', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should init inventory from storage', (done: jest.DoneCallback): void => {
      service.registerEvents = jest.fn();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);
      service.storageService.getInventory = jest.fn()
        .mockReturnValue(of([_mockInventoryItem, _mockInventoryItem]));
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.setInventory = jest.fn();
      service.splashScreen.hide = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setInventory');
      const hideSpy: jest.SpyInstance = jest.spyOn(service.splashScreen, 'hide');

      service.initFromStorage()
        .subscribe(
          (results: any): void => {
            expect(results).toBeNull();
            expect(setSpy).toHaveBeenCalledWith([_mockInventoryItem, _mockInventoryItem]);
            setTimeout((): void => {
              expect(hideSpy).toHaveBeenCalled();
              done();
            }, 10);
          },
          (error: any): void => {
            console.log('Error in: should init inventory from storage', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should initialize the inventory', (done: jest.DoneCallback): void => {
      service.initFromStorage = jest.fn().mockReturnValue(of(null));
      service.initFromServer = jest.fn().mockReturnValue(of(null));
      const storageSpy: jest.SpyInstance = jest.spyOn(service, 'initFromStorage');
      const serverSpy: jest.SpyInstance = jest.spyOn(service, 'initFromServer');

      service.initInventory()
        .subscribe(
          (results: any): void => {
            expect(results).toBeNull();
            expect(storageSpy).toHaveBeenCalled();
            expect(serverSpy).toHaveBeenCalled();
            done();
          },
          (error: any): void => {
            console.log('Error in: should initialize the inventory', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should register events', (): void => {
      const mockSubjects: Subject<object>[] = Array.from(Array(4), () => new Subject<object>());
      let counter: number = 0;
      service.eventService.register = jest.fn().mockImplementation(() => mockSubjects[counter++]);
      service.initInventory = jest.fn().mockReturnValue(of(null));
      service.clearInventory = jest.fn().mockReturnValue(of(null));
      service.syncOnSignup = jest.fn().mockReturnValue(of(null));
      service.syncOnConnection = jest.fn().mockReturnValue(of(null));
      const spies: jest.SpyInstance[] = [
        jest.spyOn(service, 'initInventory'),
        jest.spyOn(service, 'clearInventory'),
        jest.spyOn(service, 'syncOnSignup'),
        jest.spyOn(service, 'syncOnConnection')
      ];
      const eventSpy: jest.SpyInstance = jest.spyOn(service.eventService, 'register');

      service.registerEvents();

      const calls: any[] = eventSpy.mock.calls;
      expect(calls[0][0]).toMatch('init-inventory');
      expect(calls[1][0]).toMatch('clear-data');
      expect(calls[2][0]).toMatch('sync-inventory-on-signup');
      expect(calls[3][0]).toMatch('connected');
      mockSubjects.forEach((mockSubject: Subject<object>, index: number): void => {
        mockSubject.next({});
        expect(spies[index]).toHaveBeenCalled();
        mockSubject.complete();
      });
    });

  });

  describe('State Management', (): void => {

    beforeEach((): void => {
      service.registerEvents = jest.fn();
      service.idService.hasId = jest.fn()
        .mockImplementation((obj: any, id: string): boolean => obj._id === id || obj.cid === id);
    });

    test('should add an item to the list', (done: jest.DoneCallback): void => {
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.setInventory = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setInventory');
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      service.addItemToList(_mockInventoryItem)
        .subscribe(
          (): void => {
            expect(setSpy).toHaveBeenCalledWith([_mockInventoryItem]);
            done();
          },
          (error: any): void => {
            console.log('Error in: should add an item to the list', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should clear inventory', (): void => {
      service.registerEvents = jest.fn();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
        _mockInventoryItem
      ]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.storageService.removeInventory = jest.fn();
      const removeSpy: jest.SpyInstance = jest.spyOn(service.storageService, 'removeInventory');

      service.clearInventory();

      expect(list$.value.length).toEqual(0);
      expect(removeSpy).toHaveBeenCalled();
    });

    test('should create a base item', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const itemValues: object = {
        supplierName: _mockInventoryItem.supplierName,
        stockType: _mockInventoryItem.stockType,
        initialQuantity: _mockInventoryItem.initialQuantity,
        description: _mockInventoryItem.description,
        itemName: _mockInventoryItem.itemName,
        itemStyleId: _mockInventoryItem.itemStyleId,
        itemStyleName: _mockInventoryItem.itemStyleName,
        itemABV: _mockInventoryItem.itemABV,
        sourceType: _mockInventoryItem.sourceType
      };
      const id: string = `${_mockInventoryItem.cid}1`;
      service.idService.getNewId = jest.fn().mockReturnValue(id);
      const mockDate: Date = new Date();
      const originalDate: any = global.Date;
      global.Date = <any>jest.fn()
        .mockImplementation((): any => mockDate);
      const baseItem: InventoryItem = service.createBaseItem(itemValues);
      expect(baseItem.cid).toMatch(id);
      expect(baseItem.createdAt).toMatch(mockDate.toISOString());
      global.Date = originalDate;
    });

    test('should create a new item', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const _mockOptionalItemData: OptionalItemData = mockOptionalItemData();
      const itemValues: object = {
        supplierName: _mockInventoryItem.supplierName,
        stockType: _mockInventoryItem.stockType,
        initialQuantity: _mockInventoryItem.initialQuantity,
        description: _mockInventoryItem.description,
        itemName: _mockInventoryItem.itemName,
        itemStyleId: _mockInventoryItem.itemStyleId,
        itemStyleName: _mockInventoryItem.itemStyleName,
        itemABV: _mockInventoryItem.itemABV,
        sourceType: _mockInventoryItem.sourceType
      };
      service.createBaseItem = jest.fn().mockReturnValue(itemValues);
      service.mapOptionalData = jest.fn()
        .mockImplementation((target: InventoryItem, _source: object): void => {
          target.optionalItemData = _mockOptionalItemData;
        });
      service.inventoryImageService.composeImageStoreRequests = jest.fn().mockReturnValue(of([]));
      service.addItemToList = jest.fn().mockReturnValue(of(null));
      service.sendBackgroundRequest = jest.fn();
      const requestSpy: jest.SpyInstance = jest.spyOn(service, 'sendBackgroundRequest');

      service.createItem(itemValues)
        .subscribe(
          (): void => {
            setTimeout(() => {
              expect(requestSpy).toHaveBeenCalled();
              done();
            }, 10);
          },
          (error: any): void => {
            console.log(`Error in (request) 'should create a new item'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should create an item based on a batch', (done: jest.DoneCallback): void => {
      service.registerEvents = jest.fn();
      const _mockAuthor: Author = mockAuthor();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockStyle: Style = mockStyles()[0];
      service.recipeService.getPublicAuthorByRecipeId = jest.fn().mockReturnValue(of(_mockAuthor));
      service.recipeService.getRecipeMasterById = jest.fn().mockReturnValue(of(_mockRecipeMasterActive));
      service.libraryService.getStyleById = jest.fn().mockReturnValue(of(_mockStyle));
      service.createItem = jest.fn().mockReturnValue(of(true));
      const createSpy: jest.SpyInstance = jest.spyOn(service, 'createItem');
      const _mockBatch: Batch = mockBatch();
      _mockBatch.owner = `${_mockRecipeMasterActive.owner}1`;
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const itemValues: object = {
        stockType: _mockInventoryItem.stockType,
        initialQuantity: _mockInventoryItem.initialQuantity,
        currentQuantity: _mockInventoryItem.initialQuantity,
        description: _mockInventoryItem.description,
      };
      service.idService.getId = jest.fn()
        .mockReturnValueOnce(_mockBatch._id)
        .mockReturnValueOnce(_mockRecipeMasterActive._id);

      service.createItemFromBatch(_mockBatch, itemValues)
      .subscribe(
        (): void => {
          expect(createSpy).toHaveBeenCalledWith({
            supplierName: _mockAuthor.username,
            supplierLabelImage: _mockAuthor.breweryLabelImage,
            stockType: _mockInventoryItem.stockType,
            initialQuantity: _mockInventoryItem.initialQuantity,
            currentQuantity: _mockInventoryItem.initialQuantity,
            description: _mockInventoryItem.description,
            itemName: _mockBatch.contextInfo.recipeMasterName,
            itemSubname: _mockBatch.contextInfo.recipeVariantName,
            itemStyleId: _mockBatch.annotations.styleId,
            itemStyleName: _mockStyle.name,
            itemABV: _mockBatch.annotations.measuredValues.ABV,
            itemIBU: _mockBatch.annotations.measuredValues.IBU,
            itemSRM: _mockBatch.annotations.measuredValues.SRM,
            itemLabelImage: _mockBatch.contextInfo.recipeImage,
            batchId: _mockBatch._id,
            originalRecipeId: _mockRecipeMasterActive._id,
            sourceType: 'other',
            packagingDate: 'package-date'
          });
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should create an item based on a batch'`, error);
          expect(true).toBe(false);
        }
      );
    });

    test('should get inventory list', (): void => {
      service.registerEvents = jest.fn();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      service.inventory$ = new BehaviorSubject<InventoryItem[]>([
        _mockInventoryItem,
        _mockInventoryItem
      ]);
      const list$: BehaviorSubject<InventoryItem[]> = service.getInventoryList();

      expect(list$.value.length).toEqual(2);
    });

    test('should get an item index from list by id', (): void => {
      service.registerEvents = jest.fn();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
        _mockInventoryItem,
        _mockInventoryItem
      ]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);

      expect(service.getItemIndexById(_mockInventoryItem.cid)).toEqual(0);
      expect(service.getItemIndexById(`${_mockInventoryItem.cid}1`)).toEqual(-1);
    });

    test('should remove an item from list by id', (done: jest.DoneCallback): void => {
      const _mockInventoryItem1: InventoryItem = mockInventoryItem();
      const _mockInventoryItem2: InventoryItem = mockInventoryItem();
      _mockInventoryItem2._id = 'other-id';
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
        _mockInventoryItem1,
        _mockInventoryItem2
      ]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.getItemIndexById = jest.fn().mockReturnValue(0);
      service.inventoryImageService.deleteImage = jest.fn();
      const imageSpy: jest.SpyInstance = jest.spyOn(service.inventoryImageService, 'deleteImage');
      service.sendBackgroundRequest = jest.fn();
      service.setInventory = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setInventory');

      service.removeItem(_mockInventoryItem1._id)
      .subscribe(
        (): void => {
          expect(list$.value.length).toEqual(1);
          expect(list$.value[0]).toStrictEqual(_mockInventoryItem2);
          expect(imageSpy).toHaveBeenNthCalledWith(1, _mockInventoryItem1.optionalItemData.itemLabelImage);
          expect(imageSpy).toHaveBeenNthCalledWith(2, _mockInventoryItem1.optionalItemData.supplierLabelImage);
          expect(setSpy).toHaveBeenCalledWith([_mockInventoryItem2]);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should remove an item from list by id'`, error);
          expect(true).toBe(false);
        }
      );
    });

    test('should do nothing removing an item that does not exist', (done: jest.DoneCallback): void => {
      service.getInventoryList = jest.fn().mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));
      service.getItemIndexById = jest.fn().mockReturnValue(-1);
      service.setInventory = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setInventory');

      service.removeItem('')
        .subscribe(
          (results: any): void => {
            expect(results).toBeNull();
            expect(setSpy).not.toHaveBeenCalled();
            done();
          },
          (error: any): void => {
            console.log('Error in: should do nothing removing an item that does not exist', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should update an item', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([_mockInventoryItem]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.getItemIndexById = jest.fn().mockReturnValue(0);
      service.mapOptionalData = jest.fn();
      service.sendBackgroundRequest = jest.fn();
      const sendSpy: jest.SpyInstance = jest.spyOn(service, 'sendBackgroundRequest');
      service.setInventory = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setInventory');
      const _mockImage1: Image = mockImage();
      const _mockImage2: Image = mockImage();
      _mockImage2.cid += '1';
      service.inventoryImageService.composeImageStoreRequests = jest.fn()
        .mockReturnValue(of([ _mockImage1, _mockImage2 ]));
      const update: object = { supplierName: 'updated name' };

      service.updateItem(_mockInventoryItem.cid, update)
        .subscribe(
          (updated: InventoryItem): void => {
            expect(updated.supplierName).toMatch(update['supplierName']);
            expect(sendSpy).toHaveBeenCalledWith('patch', _mockInventoryItem);
            expect(setSpy).toHaveBeenCalledWith(list$.value);
            done();
          },
          (error: any): void => {
            console.log('Error in: should update an item', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should call remove item when updating an item current quantity to 0', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      service.removeItem = jest.fn().mockReturnValue(of(_mockInventoryItem));
      const removeSpy: jest.SpyInstance = jest.spyOn(service, 'removeItem');

      service.updateItem(_mockInventoryItem.cid, { currentQuantity: 0 })
      .subscribe(
        (): void => {
          expect(removeSpy).toHaveBeenCalledWith(_mockInventoryItem.cid);
          done();
        },
        (error: any): void => {
          console.log('Error in: should call remove item when updating an item current quantity to 0', error);
          expect(true).toBe(false);
        }
      );
    });

    test('should get an error updating a missing item', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const _mockError: Error = new Error('test-error');
      service.getInventoryList = jest.fn().mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));
      service.getItemIndexById = jest.fn().mockReturnValue(-1);
      service.getMissingError = jest.fn().mockReturnValue(_mockError);

      service.updateItem(_mockInventoryItem.cid, {})
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: Error): void => {
          expect(error.message).toMatch('test-error');
          done();
        }
      );
    });

    test('should set the inventory list status and storage', (): void => {
      const _mockInventoryItem1: InventoryItem = mockInventoryItem();
      const _mockInventoryItem2: InventoryItem = mockInventoryItem();
      const mockInventoryList: InventoryItem[] = [ _mockInventoryItem1, _mockInventoryItem2 ];
      const checkSpy: jest.SpyInstance = jest.spyOn(service.inventoryTypeGuardService, 'checkTypeSafety');
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.storageService.setInventory = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service.storageService, 'setInventory');

      service.setInventory(mockInventoryList);
      expect(checkSpy).toHaveBeenCalledTimes(2);
      expect(setSpy).toHaveBeenCalledWith(mockInventoryList);
      expect(list$.value).toStrictEqual(mockInventoryList);
    });

  });


  describe('Sync Calls', (): void => {

    test('should call sync on signup', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const mockInventoryList: InventoryItem[] = [_mockInventoryItem];
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>(mockInventoryList);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.inventorySyncService.syncOnSignup = jest.fn()
        .mockReturnValue(of(mockInventoryList));
      service.setInventory = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setInventory');

      service.syncOnSignup();

      setTimeout((): void => {
        expect(setSpy).toHaveBeenCalledWith(mockInventoryList);
        done();
      }, 10);
    });

    test('should catch error on sync on signup call', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const mockInventoryList: InventoryItem[] = [_mockInventoryItem];
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>(mockInventoryList);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      const _mockError: Error = new Error('test-error');
      service.inventorySyncService.syncOnSignup = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');
      service.setInventory = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setInventory');

      service.syncOnSignup();

      setTimeout((): void => {
        expect(setSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should call sync on connection', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const list: InventoryItem[] = [_mockInventoryItem, _mockInventoryItem];
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>(list);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.inventorySyncService.syncOnConnection = jest.fn()
        .mockReturnValue(of(list));
      service.setInventory = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setInventory');

      service.syncOnConnection(true)
        .subscribe(
          (results: any): void => {
            expect(results).toBeNull();
            expect(setSpy).toHaveBeenCalledWith(list);
            done();
          },
          (error: any): void => {
            console.log('Error in: should call sync on connection', error);
            expect(true).toBe(false);
          }
        );
    });

  });


  describe('Http Calls', (): void => {

    beforeEach((): void => {
      service.idService.getId = jest.fn().mockImplementation((obj: any): void => obj.cid);
    });

    test('should handle background update response', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const _mockInventoryItemUpdate: InventoryItem = mockInventoryItem();
      _mockInventoryItemUpdate.cid += '1';
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([_mockInventoryItem]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.getItemIndexById = jest.fn().mockReturnValue(0);
      service.setInventory = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setInventory');

      service.handleBackgroundUpdateResponse(_mockInventoryItemUpdate, false);
      expect(setSpy).toHaveBeenCalledWith([_mockInventoryItemUpdate]);
    });

    test('should throw an error on background update response if item not found', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      service.getInventoryList = jest.fn().mockReturnValue(new BehaviorSubject<InventoryItem[]>([_mockInventoryItem]));
      service.getItemIndexById = jest.fn().mockReturnValue(-1);
      const _mockError: Error = new Error('test-error');
      service.getMissingError = jest.fn().mockReturnValue(_mockError);
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      expect((): void => {
        service.handleBackgroundUpdateResponse(_mockInventoryItem, false);
      }).toThrowError(_mockError);
      expect(getSpy).toHaveBeenCalledWith('update', _mockInventoryItem.cid);
    });

    test('should send a post background request', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const getSpy: jest.SpyInstance = jest.spyOn(service.idService, 'getId');
      service.canSendRequest = jest.fn().mockReturnValue(true);
      service.inventoryHttpService.requestInBackground = jest.fn()
        .mockReturnValue(of(_mockInventoryItem));
      service.handleBackgroundUpdateResponse = jest.fn();
      const handleSpy: jest.SpyInstance = jest.spyOn(service, 'handleBackgroundUpdateResponse');

      service.sendBackgroundRequest('post', _mockInventoryItem);

      setTimeout((): void => {
        expect(getSpy).not.toHaveBeenCalled();
        expect(handleSpy).toHaveBeenCalledWith(_mockInventoryItem, false);
        done();
      }, 10);
    });

    test('should send a patch background request', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      service.canSendRequest = jest.fn().mockReturnValue(true);
      const canSpy: jest.SpyInstance = jest.spyOn(service, 'canSendRequest');
      service.inventoryHttpService.requestInBackground = jest.fn()
        .mockReturnValue(of(_mockInventoryItem));
      service.handleBackgroundUpdateResponse = jest.fn();
      const handleSpy: jest.SpyInstance = jest.spyOn(service, 'handleBackgroundUpdateResponse');

      service.sendBackgroundRequest('patch', _mockInventoryItem);

      setTimeout((): void => {
        expect(canSpy).toHaveBeenCalledWith([_mockInventoryItem.cid]);
        expect(handleSpy).toHaveBeenCalledWith(_mockInventoryItem, false);
        done();
      }, 10);
    });

    test('should send a patch background request', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      service.canSendRequest = jest.fn().mockReturnValue(true);
      const canSpy: jest.SpyInstance = jest.spyOn(service, 'canSendRequest');
      service.inventoryHttpService.requestInBackground = jest.fn()
        .mockReturnValue(of(_mockInventoryItem));
      service.handleBackgroundUpdateResponse = jest.fn();
      const handleSpy: jest.SpyInstance = jest.spyOn(service, 'handleBackgroundUpdateResponse');

      service.sendBackgroundRequest('delete', _mockInventoryItem);

      setTimeout((): void => {
        expect(canSpy).toHaveBeenCalledWith([_mockInventoryItem.cid]);
        expect(handleSpy).toHaveBeenCalledWith(_mockInventoryItem, true);
        done();
      }, 10);
    });

    test('should handle error on background request error', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const getSpy: jest.SpyInstance = jest.spyOn(service.idService, 'getId');
      service.canSendRequest = jest.fn().mockReturnValue(true);
      const _mockError: Error = new Error('test-error');
      service.inventoryHttpService.requestInBackground = jest.fn()
        .mockReturnValue(throwError(_mockError));
      service.handleBackgroundUpdateResponse = jest.fn();
      const handleSpy: jest.SpyInstance = jest.spyOn(service, 'handleBackgroundUpdateResponse');
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.sendBackgroundRequest('post', _mockInventoryItem);

      setTimeout((): void => {
        expect(getSpy).not.toHaveBeenCalled();
        expect(handleSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should set a sync flag when a background request cannot be sent', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      service.canSendRequest = jest.fn().mockReturnValue(false);
      service.inventorySyncService.addSyncFlag = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(service.inventorySyncService, 'addSyncFlag');
      service.inventorySyncService.convertRequestMethodToSyncMethod = jest.fn().mockReturnValue('create');

      service.sendBackgroundRequest('post', _mockInventoryItem);
      expect(addSpy).toHaveBeenCalledWith('create', _mockInventoryItem.cid);
    });

  });


  describe('Helper Methods', (): void => {

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

    test('should get a missing item custom error', (): void => {
      const errorWithAdditional: CustomError = <CustomError>service.getMissingError('update', 'test-id');

      expect(errorWithAdditional.name).toMatch('InventoryError');
      expect(errorWithAdditional.message).toMatch('An error occurred trying to update an item in inventory Item with id test-id not found');
      expect(errorWithAdditional.severity).toEqual(2);
      expect(errorWithAdditional.userMessage).toMatch('An error occurred trying to update an item in inventory');
    });

    test('should get the text color for quantity remaining', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.initialQuantity = 10;
      _mockInventoryItem.currentQuantity = 8;

      expect(service.getRemainingColor(_mockInventoryItem)).toMatch('#f4f4f4');

      _mockInventoryItem.currentQuantity = 4;

      expect(service.getRemainingColor(_mockInventoryItem)).toMatch('#ff9649');

      _mockInventoryItem.currentQuantity = 2;

      expect(service.getRemainingColor(_mockInventoryItem)).toMatch('fd4855');
    });

    test('should get color based on SRM value', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const opt: OptionalItemData = _mockInventoryItem.optionalItemData;
      opt.itemSRM = undefined;

      expect(service.getSRMColor(_mockInventoryItem)).toMatch('#f4f4f4');

      opt.itemSRM = 20;

      expect(service.getSRMColor(_mockInventoryItem)).toMatch('#963500');

      opt.itemSRM = 100;

      expect(service.getSRMColor(_mockInventoryItem)).toMatch('#140303');
    });

    test('should check if optional data object has a key that should be mapped', (): void => {
      const _mockOptionalItemData: OptionalItemData = mockOptionalItemData();

      expect(service.hasMappableKey('itemIBU', _mockOptionalItemData)).toBe(true);
      expect(service.hasMappableKey('none', _mockOptionalItemData)).toBe(false);
    });

    test('should map optional data to item', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.optionalItemData = {};
      const _mockOptionalItemData1: OptionalItemData = mockOptionalItemData();

      service.mapOptionalData(_mockInventoryItem, _mockOptionalItemData1);

      expect(_mockInventoryItem.optionalItemData).toStrictEqual(_mockOptionalItemData1);
      const _mockOptionalItemData2: OptionalItemData = mockOptionalItemData();
      _mockOptionalItemData2.itemLabelImage.url = 'new-url';

      service.mapOptionalData(_mockInventoryItem, _mockOptionalItemData2);

      expect(_mockInventoryItem.optionalItemData).toStrictEqual(_mockOptionalItemData2);
      _mockInventoryItem.optionalItemData.itemLabelImage = null;
      _mockInventoryItem.optionalItemData.supplierLabelImage = null;
      _mockOptionalItemData2.itemLabelImage = null;
      _mockOptionalItemData2.supplierLabelImage = null;
      const _defaultImage: Image = defaultImage();

      service.mapOptionalData(_mockInventoryItem, _mockOptionalItemData2);

      expect(_mockInventoryItem.optionalItemData.itemLabelImage).toStrictEqual(_defaultImage);
      expect(_mockInventoryItem.optionalItemData.supplierLabelImage).toStrictEqual(_defaultImage);
    });

  });

});
