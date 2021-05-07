/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { BehaviorSubject, Subject, concat, forkJoin, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAuthor, mockBatch, mockImage, mockImageRequestMetadata, mockInventoryItem, mockOptionalItemData, mockRecipeMasterActive, mockErrorResponse, mockStyles, mockSyncMetadata, mockSyncError, mockSyncResponse } from '../../../../test-config/mock-models';
import { ClientIdServiceStub, ConnectionServiceStub, EventServiceStub, ImageServiceStub, LibraryServiceStub, HttpErrorServiceStub, ProcessServiceStub, RecipeServiceStub, StorageServiceStub, SyncServiceStub, ToastServiceStub, UserServiceStub } from '../../../../test-config/service-stubs';
import { SplashScreenStub } from '../../../../test-config/ionic-stubs';

/* Constants imports */
import { API_VERSION } from '../../shared/constants/api-version';
import { BASE_URL } from '../../shared/constants/base-url';

/* Default imports */
import { defaultImage } from '../../shared/defaults/default-image';

/* Interface imports*/
import { Author } from '../../shared/interfaces/author';
import { Batch } from '../../shared/interfaces/batch';
import { Image, ImageRequestFormData, ImageRequestMetadata } from '../../shared/interfaces/image';
import { InventoryItem, OptionalItemData } from '../../shared/interfaces/inventory-item';
import { RecipeMaster } from '../../shared/interfaces/recipe-master';
import { Style } from '../../shared/interfaces/library';
import { SyncData, SyncRequests, SyncMetadata, SyncError, SyncResponse } from '../../shared/interfaces/sync';

/* Service imports */
import { InventoryService } from './inventory.service';
import { ClientIdService } from '../client-id/client-id.service';
import { ConnectionService } from '../connection/connection.service';
import { EventService } from '../event/event.service';
import { ImageService } from '../image/image.service';
import { LibraryService } from '../library/library.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { ProcessService } from '../process/process.service';
import { RecipeService } from '../recipe/recipe.service';
import { StorageService } from '../storage/storage.service';
import { SyncService } from '../sync/sync.service';
import { ToastService } from '../toast/toast.service';
import { UserService } from '../user/user.service';


describe('InventoryService', (): void => {
  let injector: TestBed;
  let inventoryService: InventoryService;
  let httpMock: HttpTestingController;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        InventoryService,
        { provide: ClientIdService, useClass: ClientIdServiceStub },
        { provide: ConnectionService, useClass: ConnectionServiceStub },
        { provide: EventService, useClass: EventServiceStub },
        { provide: HttpErrorService, useClass: HttpErrorServiceStub },
        { provide: ImageService, useClass: ImageServiceStub },
        { provide: LibraryService, useClass: LibraryServiceStub },
        { provide: ProcessService, useClass: ProcessServiceStub },
        { provide: RecipeService, useClass: RecipeServiceStub },
        { provide: StorageService, useClass: StorageServiceStub },
        { provide: SyncService, useClass: SyncServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UserService, useClass: UserServiceStub },
        { provide: SplashScreen, useClass: SplashScreenStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    inventoryService = injector.get(InventoryService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    inventoryService.registerEvents = jest
      .fn();

    expect(inventoryService).toBeDefined();
  });

  test('should initialize inventory from server', (done: jest.DoneCallback): void => {
    inventoryService.registerEvents = jest
      .fn();

    inventoryService.syncOnConnection = jest
      .fn()
      .mockReturnValue(of(true));

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));

    inventoryService.updateInventoryStorage = jest
      .fn();

    const getSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'getInventoryList');
    const updateSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'updateInventoryStorage');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    inventoryService.initFromServer();

    setTimeout((): void => {
      expect(getSpy).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('inventory from server');
      done();
    }, 10);

    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/inventory`);
    expect(getReq.request.method).toMatch('GET');
    getReq.flush([_mockInventoryItem, _mockInventoryItem]);
  });

  test('should get an error when failing to init inventory from server', (done: jest.DoneCallback): void => {
    inventoryService.registerEvents = jest
      .fn();

    inventoryService.syncOnConnection = jest
      .fn()
      .mockReturnValue(of(true));

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));

    inventoryService.updateInventoryStorage = jest
      .fn();

    inventoryService.httpError.handleError = jest
      .fn()
      .mockReturnValue(throwError('user not found'));

    const getSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'getInventoryList');
    const updateSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'updateInventoryStorage');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    inventoryService.initFromServer();

    setTimeout((): void => {
      expect(getSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Initialization error: user not found');
      done();
    }, 10);

    const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/inventory`);
    expect(getReq.request.method).toMatch('GET');
    getReq.flush(null, mockErrorResponse(404, 'user not found'));
  });

  test('should get an error when init inventory and sync fails', (done: jest.DoneCallback): void => {
    inventoryService.registerEvents = jest
      .fn();

    inventoryService.syncOnConnection = jest
      .fn()
      .mockReturnValue(throwError('user not found'));

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));

    inventoryService.updateInventoryStorage = jest
      .fn();

    const getSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'getInventoryList');
    const updateSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'updateInventoryStorage');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    inventoryService.initFromServer();

    setTimeout((): void => {
      expect(getSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Initialization error: user not found');
      done();
    }, 10);
  });

  test('should init inventory from storage', (done: jest.DoneCallback): void => {
    inventoryService.registerEvents = jest
      .fn();

    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);

    inventoryService.storageService.getInventory = jest
      .fn()
      .mockReturnValue(of([_mockInventoryItem, _mockInventoryItem]));

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(list$);

    const hideSpy: jest.SpyInstance = jest.spyOn(inventoryService.splashScreen, 'hide');

    inventoryService.initFromStorage();

    setTimeout((): void => {
      expect(list$.value.length).toEqual(2);
      expect(hideSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should get an error when init inventory from storage', (done: jest.DoneCallback): void => {
    inventoryService.registerEvents = jest
      .fn();

    inventoryService.storageService.getInventory = jest
      .fn()
      .mockReturnValue(throwError('Inventory not found'));

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const hideSpy: jest.SpyInstance = jest.spyOn(inventoryService.splashScreen, 'hide');

    inventoryService.initFromStorage();

    setTimeout((): void => {
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Inventory not found: awaiting data from server');
      expect(hideSpy).toHaveBeenCalledWith();
      done();
    }, 10);
  });

  test('should initialize inventory', (): void => {
    inventoryService.registerEvents = jest
      .fn();

    inventoryService.initFromStorage = jest
      .fn();

    inventoryService.initFromServer = jest
      .fn();

    inventoryService.canSendRequest = jest
      .fn()
      .mockReturnValue(true);

    const storageSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'initFromStorage');
    const serverSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'initFromServer');

    inventoryService.initializeInventory();

    expect(storageSpy).toHaveBeenCalled();
    expect(serverSpy).toHaveBeenCalled();
  });

  test('should register events', (): void => {
    const mockSubjects: Subject<object>[] = Array.from(Array(4), () => new Subject<object>());

    let counter = 0;
    inventoryService.event.register = jest
      .fn()
      .mockImplementation(() => mockSubjects[counter++]);

    inventoryService.initializeInventory = jest
      .fn();

    inventoryService.clearInventory = jest
      .fn();

    inventoryService.syncOnSignup = jest
      .fn();

    inventoryService.syncOnReconnect = jest
      .fn();

    const spies: jest.SpyInstance[] = [
      jest.spyOn(inventoryService, 'initializeInventory'),
      jest.spyOn(inventoryService, 'clearInventory'),
      jest.spyOn(inventoryService, 'syncOnSignup'),
      jest.spyOn(inventoryService, 'syncOnReconnect')
    ];

    const eventSpy: jest.SpyInstance = jest.spyOn(inventoryService.event, 'register');

    inventoryService.registerEvents();

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

  test('should add an item to the list', (done: jest.DoneCallback): void => {
    inventoryService.registerEvents = jest
      .fn();

    const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(list$);

    inventoryService.updateInventoryStorage = jest
      .fn();

    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    inventoryService.addItemToList(_mockInventoryItem)
      .subscribe(
        (): void => {
          expect(list$.value.length).toEqual(1);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should add an item to the list'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should clear inventory', (): void => {
    inventoryService.registerEvents = jest
      .fn();

    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
      _mockInventoryItem
    ]);

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(list$);

    inventoryService.storageService.removeInventory = jest
      .fn();

    inventoryService.clearInventory();

    expect(list$.value.length).toEqual(0);
  });

  test('should create a new item', (done: jest.DoneCallback): void => {
    inventoryService.registerEvents = jest
      .fn();

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

    inventoryService.clientIdService.getNewId = jest
      .fn()
      .mockReturnValue('12345');

    inventoryService.mapOptionalData = jest
      .fn()
      .mockImplementation((target: InventoryItem, _source: object): void => {
        target.optionalItemData = _mockOptionalItemData;
      });

    inventoryService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue(of([]));

    inventoryService.addItemToList = jest
      .fn()
      .mockReturnValue(of(null));

    inventoryService.canSendRequest = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    inventoryService.requestInBackground = jest
      .fn();

    inventoryService.addSyncFlag = jest
      .fn();

    const requestSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'requestInBackground');
    const syncSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'addSyncFlag');

    concat(
      inventoryService.createItem(itemValues),
      inventoryService.createItem(itemValues)
    )
    .subscribe(
      (): void => {
        setTimeout(() => {
          expect(requestSpy).toHaveBeenCalled();
          expect(syncSpy).toHaveBeenCalled();
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
    inventoryService.registerEvents = jest
      .fn();

    const _mockAuthor: Author = mockAuthor();
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    const _mockStyle: Style = mockStyles()[0];

    inventoryService.recipeService.getPublicAuthorByRecipeId = jest
      .fn()
      .mockReturnValue(of(_mockAuthor));

    inventoryService.recipeService.getRecipeMasterById = jest
      .fn()
      .mockReturnValue(of(_mockRecipeMasterActive));

    inventoryService.libraryService.getStyleById = jest
      .fn()
      .mockReturnValue(of(_mockStyle));

    inventoryService.createItem = jest
      .fn()
      .mockReturnValue(of(true));

    const createSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'createItem');

    const _mockBatch: Batch = mockBatch();
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const itemValues: object = {
      stockType: _mockInventoryItem.stockType,
      initialQuantity: _mockInventoryItem.initialQuantity,
      currentQuantity: _mockInventoryItem.initialQuantity,
      description: _mockInventoryItem.description,
    };

    inventoryService.createItemFromBatch(_mockBatch, itemValues)
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
            sourceType: 'self',
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
    inventoryService.registerEvents = jest
      .fn();

    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    inventoryService.inventory$ = new BehaviorSubject<InventoryItem[]>([
      _mockInventoryItem,
      _mockInventoryItem
    ]);

    const list$: BehaviorSubject<InventoryItem[]> = inventoryService.getInventoryList();

    expect(list$.value.length).toEqual(2);
  });

  test('should get an item from list by id', (): void => {
    inventoryService.registerEvents = jest
      .fn();

    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
      _mockInventoryItem,
      _mockInventoryItem
    ]);

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(list$);

    expect(inventoryService.getItemById(_mockInventoryItem.cid)).toBeDefined();
  });

  test('should remove an item from list by id', (done: jest.DoneCallback): void => {
    inventoryService.registerEvents = jest
      .fn();

    const _mockInventoryItem1: InventoryItem = mockInventoryItem();
    const _mockInventoryItem2: InventoryItem = mockInventoryItem();
    _mockInventoryItem2._id = 'other-id';

    const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
      _mockInventoryItem1,
      _mockInventoryItem2
    ]);

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(list$);

    inventoryService.imageService.hasDefaultImage = jest
      .fn()
      .mockReturnValue(false);

    inventoryService.imageService.deleteLocalImage = jest
      .fn()
      .mockReturnValue(of(null));

    inventoryService.canSendRequest = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    inventoryService.requestInBackground = jest
      .fn();

    inventoryService.addSyncFlag = jest
      .fn();

    inventoryService.updateInventoryStorage = jest
      .fn();

    const requestSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'requestInBackground');
    const syncSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'addSyncFlag');

    inventoryService.removeItem(_mockInventoryItem1._id)
      .subscribe(
        (): void => {
          expect(list$.value.length).toEqual(1);
          expect(list$.value[0]).toStrictEqual(_mockInventoryItem2);
        },
        (error: any): void => {
          console.log(`Error in 'should remove an item from list by id'`, error);
          expect(true).toBe(false);
        }
      );

    list$.next([ _mockInventoryItem1, _mockInventoryItem2 ]);

    inventoryService.removeItem(_mockInventoryItem2._id)
      .subscribe(
        (): void => {
          expect(list$.value.length).toEqual(1);
          expect(list$.value[0]).toStrictEqual(_mockInventoryItem1);
        },
        (error: any): void => {
          console.log(`Error in 'should remove an item from list by id'`, error);
          expect(true).toBe(false);
        }
      );

    setTimeout((): void => {
      expect(requestSpy).toHaveBeenCalled();
      expect(syncSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should get an error trying to delete an item that doesn\'t exist', (done: jest.DoneCallback): void => {
    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));

    inventoryService.removeItem('wrong-id')
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('Item with id: \'wrong-id\' not found');
          done();
        }
      );
  });

  test('should update an item', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([_mockInventoryItem]);
    const update: object = { supplierName: 'updated name' };

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(list$);

    inventoryService.mapOptionalData = jest
      .fn();

    inventoryService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue([]);

    inventoryService.canSendRequest = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    inventoryService.requestInBackground = jest
      .fn();

    inventoryService.addSyncFlag = jest
      .fn();

    inventoryService.updateInventoryStorage = jest
      .fn();

    const requestSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'requestInBackground');
    const syncSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'addSyncFlag');

    concat(
      inventoryService.updateItem(_mockInventoryItem.cid, update),
      inventoryService.updateItem(_mockInventoryItem.cid, update)
    )
    .subscribe(
      (updated): void => {
        setTimeout((): void => {
          expect(updated.supplierName).toMatch(update['supplierName']);
          expect(requestSpy).toHaveBeenCalled();
          expect(syncSpy).toHaveBeenCalled();
          done();
        });
      },
      (error: any): void => {
        console.log(`Error in 'should update an item'`, error);
        expect(true).toBe(false);
      }
    );
  });

  test('should call remove item when updating an item current quantity to 0', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    inventoryService.removeItem = jest
      .fn()
      .mockReturnValue(of(_mockInventoryItem));

    const removeSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'removeItem');

    inventoryService.updateItem(_mockInventoryItem.cid, { currentQuantity: 0 })
      .subscribe(
        (): void => {
          expect(removeSpy).toHaveBeenCalledWith(_mockInventoryItem.cid);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should call remove item when updating an item current quantity to 0'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get an error updating a missing item', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));

    inventoryService.updateItem(_mockInventoryItem.cid, {})
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('Item not found in list');
          done();
        }
      );
  });

  test('should compose image upload request data', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    _mockInventoryItem.optionalItemData.itemLabelImage.hasPending = true;
    _mockInventoryItem.optionalItemData.supplierLabelImage.hasPending = true;

    const imageData: ImageRequestFormData[] = inventoryService.composeImageUploadRequests(_mockInventoryItem);

    expect(imageData[0]).toStrictEqual({
      image: _mockInventoryItem.optionalItemData.itemLabelImage,
      name: 'itemLabelImage'
    });

    expect(imageData[1]).toStrictEqual({
      image: _mockInventoryItem.optionalItemData.supplierLabelImage,
      name: 'supplierLabelImage'
    });
  });

  test('should compose image store request data', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    _mockInventoryItem.optionalItemData.itemLabelImage.hasPending = true;
    _mockInventoryItem.optionalItemData.supplierLabelImage.hasPending = true;
    const _mockImage: Image = mockImage();

    inventoryService.imageService.storeImageToLocalDir = jest
      .fn()
      .mockReturnValue(of(_mockImage));

    const storeSpy: jest.SpyInstance = jest.spyOn(inventoryService.imageService, 'storeImageToLocalDir');

    forkJoin(inventoryService.composeImageStoreRequests(_mockInventoryItem))
      .subscribe(
        (images: Image[]): void => {
          expect(images.length).toEqual(2);
          expect(storeSpy).toHaveBeenCalledTimes(2);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should compose image store request data'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should configure a background request', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    inventoryService.getBackgroundRequest = jest
      .fn()
      .mockReturnValue(of(_mockInventoryItem));

    const getSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'getBackgroundRequest');

    inventoryService.configureBackgroundRequest('post', true, _mockInventoryItem)
      .subscribe(
        (item: InventoryItem): void => {
          expect(item).toStrictEqual(_mockInventoryItem);
          expect(getSpy).toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should configure a background request'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should configure a background request that resolves an error without throwing it', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');

    inventoryService.getBackgroundRequest = jest
      .fn()
      .mockReturnValue(throwError(_mockErrorResponse));

    const getSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'getBackgroundRequest');

    inventoryService.configureBackgroundRequest('post', true, _mockInventoryItem)
      .subscribe(
        (resolvedError: HttpErrorResponse): void => {
          expect(resolvedError.status).toEqual(404);
          expect(resolvedError.statusText).toMatch('not found');
          expect(getSpy).toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should configure a background request that resolves an error without throwing it'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should configure a background request that throws an error', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');

    inventoryService.getBackgroundRequest = jest
      .fn()
      .mockReturnValue(throwError(_mockErrorResponse));

    inventoryService.httpError.handleError = jest
      .fn()
      .mockReturnValue(throwError('<404> not found'));

    const getSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'getBackgroundRequest');

    inventoryService.configureBackgroundRequest('post', false, _mockInventoryItem)
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('<404> not found');
          expect(getSpy).toHaveBeenCalled();
          done();
        }
      );
  });

  test('should get a background post request', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    inventoryService.composeImageUploadRequests = jest
      .fn()
      .mockReturnValue([]);

    inventoryService.imageService.blobbifyImages = jest
      .fn()
      .mockReturnValue(of([]));

    inventoryService.getBackgroundRequest('post', _mockInventoryItem)
      .subscribe(
        (): void => {
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should get a background post request'`, error);
          expect(true).toBe(false);
        }
      );

    const postReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/inventory`);
    expect(postReq.request.method).toMatch('POST');
    postReq.flush(_mockInventoryItem);
  });

  test('should get a background patch request', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockImageRequestMetadata: ImageRequestMetadata = mockImageRequestMetadata();

    inventoryService.composeImageUploadRequests = jest
      .fn()
      .mockReturnValue([]);

    inventoryService.imageService.blobbifyImages = jest
      .fn()
      .mockReturnValue(of([_mockImageRequestMetadata]));

    const patchSpy: jest.SpyInstance = jest.spyOn(inventoryService.http, 'patch');
    const mockFormData: FormData = new FormData();
    mockFormData.append('inventoryItem', JSON.stringify(_mockInventoryItem));
    mockFormData.append(_mockImageRequestMetadata.name, _mockImageRequestMetadata.blob, _mockImageRequestMetadata.filename);
    const route: string = `${BASE_URL}/${API_VERSION}/inventory/${_mockInventoryItem._id}`;

    inventoryService.getBackgroundRequest('patch', _mockInventoryItem)
      .subscribe(
        (): void => {
          expect(patchSpy.mock.calls[0][0]).toMatch(route);
          expect(patchSpy.mock.calls[0][1]).toStrictEqual(mockFormData);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should get a background patch request'`, error);
          expect(true).toBe(false);
        }
      );

    const patchReq: TestRequest = httpMock.expectOne(route);
    expect(patchReq.request.method).toMatch('PATCH');
    patchReq.flush(_mockInventoryItem);
  });

  test('should get a background post request', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    forkJoin(
      inventoryService.getBackgroundRequest('delete', null, 'delete-id'),
      inventoryService.getBackgroundRequest('delete', _mockInventoryItem)
    )
    .subscribe(
      (): void => {
        done();
      },
      (error: any): void => {
        console.log(`Error in 'should get a background delete request'`, error);
        expect(true).toBe(false);
      }
    );

    const delReq1: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/inventory/${_mockInventoryItem._id}`);
    expect(delReq1.request.method).toMatch('DELETE');
    delReq1.flush(_mockInventoryItem);

    const delReq2: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/inventory/delete-id`);
    expect(delReq2.request.method).toMatch('DELETE');
    delReq2.flush(_mockInventoryItem);
  });

  test('should get an error with invalid http method', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    inventoryService.composeImageUploadRequests = jest
      .fn()
      .mockReturnValue([]);

    inventoryService.imageService.blobbifyImages = jest
      .fn()
      .mockReturnValue(of([]));

    inventoryService.getBackgroundRequest('invalid', _mockInventoryItem)
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('Invalid http method');
          done();
        }
      );
  });

  test('should handle a background update response', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
      _mockInventoryItem
    ]);
    const _mockUpdateResponse: InventoryItem = mockInventoryItem();
    _mockUpdateResponse.itemName = 'updated-name';

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(list$);

    inventoryService.handleBackgroundUpdateResponse(_mockUpdateResponse, false)
      .subscribe(
        (): void => {
          expect(list$.value[0].itemName).toMatch('updated-name');
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should handle a background update response'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should handle a background deletion response', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(list$);

    inventoryService.handleBackgroundUpdateResponse(_mockInventoryItem, true)
      .subscribe(
        (): void => {
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should handle a background deletion response'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get an error handling a background update response', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(list$);

    inventoryService.handleBackgroundUpdateResponse(_mockInventoryItem, false)
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('Inventory item is missing and cannot be updated');
          done();
        }
      );
  });

  test('should make a background request', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    inventoryService.getBackgroundRequest = jest
      .fn()
      .mockReturnValue(of(_mockInventoryItem));

    inventoryService.handleBackgroundUpdateResponse = jest
      .fn()
      .mockReturnValue(of(true));

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    inventoryService.requestInBackground('post', _mockInventoryItem);

    setTimeout((): void => {
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Inventory: background post request successful');
      done();
    }, 10);
  });

  test('should get an error response from a background request', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');

    inventoryService.getBackgroundRequest = jest
      .fn()
      .mockReturnValue(throwError(_mockErrorResponse));

    inventoryService.httpError.handleError = jest
      .fn()
      .mockReturnValue(throwError('<404> not found'));

    inventoryService.toastService.presentErrorToast = jest
      .fn();

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const toastSpy: jest.SpyInstance = jest.spyOn(inventoryService.toastService, 'presentErrorToast');

    inventoryService.requestInBackground('post', _mockInventoryItem);

    setTimeout((): void => {
      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('Inventory: background post request error');
      expect(consoleCalls[1]).toMatch('<404> not found');
      expect(toastSpy).toHaveBeenCalledWith('Inventory item failed to save to server');
      done();
    }, 10);
  });

  test('should get an unknown sync type error when requesting in background with invalid method', (done: jest.DoneCallback): void => {
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const toastSpy: jest.SpyInstance = jest.spyOn(inventoryService.toastService, 'presentErrorToast');

    inventoryService.requestInBackground('invalid', null);

    setTimeout((): void => {
      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('Inventory: background invalid request error');
      expect(consoleCalls[1]).toMatch('Unknown sync type');
      expect(toastSpy).toHaveBeenCalledWith('Inventory item failed to save to server');
      done();
    }, 10);
  });

  test('should add a sync flag', (): void => {
    inventoryService.syncService.addSyncFlag = jest
      .fn();

    const addSpy: jest.SpyInstance = jest.spyOn(inventoryService.syncService, 'addSyncFlag');

    inventoryService.addSyncFlag('create', 'id');

    expect(addSpy).toHaveBeenCalledWith({
      method: 'create',
      docId: 'id',
      docType: 'inventory'
    });
  });

  test('should dismiss all sync errors', (): void => {
    const _mockSyncError: SyncError = mockSyncError();
    inventoryService.syncErrors = [ _mockSyncError, _mockSyncError ];

    expect(inventoryService.syncErrors.length).toEqual(2);

    inventoryService.dismissAllSyncErrors();

    expect(inventoryService.syncErrors.length).toEqual(0);
  });

  test('should dismiss sync error at an index', (): void => {
    const _mockSyncError: SyncError = mockSyncError();
    inventoryService.syncErrors = [ _mockSyncError, _mockSyncError ];

    expect(inventoryService.syncErrors.length).toEqual(2);

    inventoryService.dismissSyncError(0);

    expect(inventoryService.syncErrors.length).toEqual(1);
  });

  test('should throw an error if dismissing an error at an invalid index', (): void => {
    inventoryService.syncErrors = [];

    expect(() => {
      inventoryService.dismissSyncError(0);
    })
    .toThrow('Invalid sync error index');
  });

  test('should generate sync requests', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    _mockInventoryItem.cid = '0';

    const _mockInventoryItemDefaultId: InventoryItem = mockInventoryItem();
    _mockInventoryItemDefaultId.cid = '1';
    const defaultId: string = '0123456789012';
    _mockInventoryItemDefaultId.optionalItemData.batchId = defaultId;

    const _mockInventoryItemServerId: InventoryItem = mockInventoryItem();
    const serverId: string = '1a2b3c4d5e';
    _mockInventoryItemServerId.cid = '2';
    _mockInventoryItemServerId.optionalItemData.batchId = serverId;

    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(mockBatch());

    const syncFlags: SyncMetadata[] = [
      mockSyncMetadata('delete', 'id1', 'inventory'),
      mockSyncMetadata('update', 'id2', 'inventory'),
      mockSyncMetadata('create', 'id3', 'inventory')
    ];

    inventoryService.syncService.getSyncFlagsByType = jest
      .fn()
      .mockReturnValue(syncFlags);

    inventoryService.getItemById = jest
      .fn()
      .mockReturnValueOnce(_mockInventoryItem)
      .mockReturnValueOnce(_mockInventoryItemDefaultId)
      .mockReturnValueOnce(_mockInventoryItemServerId);

    inventoryService.configureBackgroundRequest = jest
      .fn()
      .mockReturnValueOnce(of(_mockInventoryItem))
      .mockReturnValueOnce(of(_mockInventoryItemDefaultId))
      .mockReturnValueOnce(of(_mockInventoryItemServerId));

    inventoryService.processService.getBatchById = jest
      .fn()
      .mockReturnValue(_mockBatch$);

    const requests: SyncRequests<InventoryItem> = inventoryService.generateSyncRequests();
    expect(requests.syncRequests.length).toEqual(3);
    expect(requests.syncErrors.length).toEqual(0);

    forkJoin(requests.syncRequests)
      .subscribe(
        ([item1, item2, item3]: InventoryItem[]): void => {
          expect(item1.cid).toMatch(_mockInventoryItem.cid);
          expect(item2.cid).toMatch(_mockInventoryItemDefaultId.cid);
          expect(item2.optionalItemData.batchId).not.toMatch(defaultId);
          expect(item3.cid).toMatch(_mockInventoryItemServerId.cid);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should generate sync requests'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get errors generating sync requests', (): void => {
    const syncFlags: SyncMetadata[] = [
      mockSyncMetadata('create', 'id1', 'inventory'),
      mockSyncMetadata('update', 'id2', 'invenotry'),
      mockSyncMetadata('invalid', 'id3', 'inventory')
    ];

    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    const _mockSyncErrorNotFound: SyncError = mockSyncError();
    const errMsg1: string = `Sync error: Item with id 'id1' not found`;
    _mockSyncErrorNotFound.message = errMsg1;

    const _mockInventoryItemMissingId: InventoryItem = mockInventoryItem();
    delete _mockInventoryItemMissingId._id;

    const _mockSyncErrorMissingId: SyncError = mockSyncError();
    const errMsg2: string = `Item with id: '${_mockInventoryItemMissingId.cid}' is missing its server id`;
    _mockSyncErrorMissingId.message = errMsg2;

    const _mockSyncErrorInvalidFlag: SyncError = mockSyncError();
    const errMsg3: string = `Sync error: Unknown sync flag method 'invalid'`;
    _mockSyncErrorInvalidFlag.message = errMsg3;

    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(mockBatch());

    inventoryService.syncService.getSyncFlagsByType = jest
      .fn()
      .mockReturnValue(syncFlags);

    inventoryService.getItemById = jest
      .fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(_mockInventoryItemMissingId)
      .mockReturnValueOnce(_mockInventoryItem);

    inventoryService.syncService.constructSyncError = jest
      .fn()
      .mockReturnValueOnce(_mockSyncErrorNotFound)
      .mockReturnValueOnce(_mockSyncErrorMissingId)
      .mockReturnValueOnce(_mockSyncErrorInvalidFlag);

    inventoryService.processService.getBatchById = jest
      .fn()
      .mockReturnValue(_mockBatch$);

    const requests: SyncRequests<InventoryItem> = inventoryService.generateSyncRequests();
    expect(requests.syncErrors.length).toEqual(3);
    expect(requests.syncRequests.length).toEqual(0);

    expect(requests.syncErrors[0].message).toMatch(errMsg1);
    expect(requests.syncErrors[1].message).toMatch(errMsg2);
    expect(requests.syncErrors[2].message).toMatch(errMsg3);
  });

  test('should process sync requests', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
      _mockInventoryItem
    ]);
    _mockInventoryItem.cid = '123';

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(list$);

    const syncData: (InventoryItem | SyncData<InventoryItem>)[] = [
      _mockInventoryItem,
      { isDeleted: true, data: null }
    ];

    inventoryService.processSyncSuccess(syncData);

    expect(list$.value[0].cid).toMatch('123');
  });

  test('should encounter and store error during processing of sync requests', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(list$);

    const syncData: (InventoryItem | SyncData<InventoryItem>)[] = [
      _mockInventoryItem
    ];

    inventoryService.processSyncSuccess(syncData);

    expect(inventoryService.syncErrors[0]).toStrictEqual({
      errCode: -1,
      message: `Inventory item with id: ${_mockInventoryItem.cid} not found`
    });
  });

  test('should perform sync on connection (not login)', (done: jest.DoneCallback): void => {
    const _mockSyncResponse: SyncResponse<InventoryItem> = mockSyncResponse<InventoryItem>();
    const preError: SyncError = mockSyncError();
    preError.message = 'pre-error';
    const responseError: SyncError = mockSyncError();
    responseError.message = 'response-error';
    _mockSyncResponse.errors.push(responseError);

    inventoryService.userService.isLoggedIn = jest
      .fn()
      .mockReturnValue(true);

    inventoryService.generateSyncRequests = jest
      .fn()
      .mockReturnValue({ syncRequests: [], syncErrors: [ preError ] });

    inventoryService.syncService.sync = jest
      .fn()
      .mockReturnValue(of(_mockSyncResponse));

    inventoryService.processSyncSuccess = jest
      .fn();

    inventoryService.updateInventoryStorage = jest
      .fn();

    const processSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'processSyncSuccess');
    const updateSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'updateInventoryStorage');

    inventoryService.syncOnConnection(false)
      .subscribe(
        (): void => {
          expect(processSpy).toHaveBeenCalled();
          expect(updateSpy).toHaveBeenCalled();
          expect(inventoryService.syncErrors.length).toEqual(2);
          expect(inventoryService.syncErrors[0]).toStrictEqual(responseError);
          expect(inventoryService.syncErrors[1]).toStrictEqual(preError);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should perform sync on connection (not login)'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should perform sync on connection (on login)', (done: jest.DoneCallback): void => {
    const _mockSyncResponse: SyncResponse<InventoryItem> = mockSyncResponse<InventoryItem>();

    inventoryService.userService.isLoggedIn = jest
      .fn()
      .mockReturnValue(true);

    inventoryService.generateSyncRequests = jest
      .fn()
      .mockReturnValue({ syncRequests: [], syncErrors: [] });

    inventoryService.syncService.sync = jest
      .fn()
      .mockReturnValue(of(_mockSyncResponse));

    inventoryService.processSyncSuccess = jest
      .fn();

    inventoryService.updateInventoryStorage = jest
      .fn();

    const processSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'processSyncSuccess');
    const updateSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'updateInventoryStorage');

    inventoryService.syncOnConnection(true)
      .subscribe(
        (): void => {
          expect(processSpy).not.toHaveBeenCalled();
          expect(updateSpy).not.toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should perform sync on connection (on login)'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should not sync on reconnect if not logged in', (done: jest.DoneCallback): void => {
    inventoryService.userService.isLoggedIn = jest
      .fn()
      .mockReturnValue(false);

    const getSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'getInventoryList');

    inventoryService.syncOnConnection(false)
      .subscribe(
        (): void => {
          expect(getSpy).not.toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should not sync on reconnect if not logged in'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should sync on reconnect', (done: jest.DoneCallback): void => {
    inventoryService.syncOnConnection = jest
      .fn()
      .mockReturnValueOnce(of({}))
      .mockReturnValueOnce(throwError('test-error'));

    const toastSpy: jest.SpyInstance = jest.spyOn(inventoryService.toastService, 'presentErrorToast');

    inventoryService.syncOnReconnect();

    setTimeout((): void => {
      expect(toastSpy).not.toHaveBeenCalled();

      inventoryService.syncOnReconnect();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Sync error: some inventory items did not update');
        done();
      }, 10);
    }, 10);
  });

  test('should sync on signup', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([_mockInventoryItem]);
    const _mockBatch: Batch = mockBatch();
    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
    const _mockSyncResponse: SyncResponse<InventoryItem> = mockSyncResponse<InventoryItem>();

    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(list$);

    inventoryService.processService.getBatchById = jest
      .fn()
      .mockReturnValue(_mockBatch$);

    inventoryService.configureBackgroundRequest = jest
      .fn()
      .mockReturnValue(_mockInventoryItem);

    inventoryService.syncService.sync = jest
      .fn()
      .mockReturnValue(of(_mockSyncResponse));

    inventoryService.processSyncSuccess = jest
      .fn();

    inventoryService.updateInventoryStorage = jest
      .fn();

    const processSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'processSyncSuccess');
    const updateSpy: jest.SpyInstance = jest.spyOn(inventoryService, 'updateInventoryStorage');

    inventoryService.syncOnSignup();

    setTimeout((): void => {
      expect(processSpy).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should check if a request can be sent', (): void => {
    inventoryService.connectionService.isConnected = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    inventoryService.userService.isLoggedIn = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    expect(inventoryService.canSendRequest(['1a2b3c4d5e', '6f7g8h9i10j'])).toBe(true);
    expect(inventoryService.canSendRequest()).toBe(false);
  });

  test('should get the text color for quantity remaining', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    _mockInventoryItem.initialQuantity = 10;
    _mockInventoryItem.currentQuantity = 8;
    expect(inventoryService.getRemainingColor(_mockInventoryItem)).toMatch('#f4f4f4');

    _mockInventoryItem.currentQuantity = 4;
    expect(inventoryService.getRemainingColor(_mockInventoryItem)).toMatch('#ff9649');

    _mockInventoryItem.currentQuantity = 2;
    expect(inventoryService.getRemainingColor(_mockInventoryItem)).toMatch('fd4855');
  });

  test('should get color based on SRM value', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const opt: OptionalItemData = _mockInventoryItem.optionalItemData;

    opt.itemSRM = undefined;
    expect(inventoryService.getSRMColor(_mockInventoryItem)).toMatch('#f4f4f4');

    opt.itemSRM = 20;
    expect(inventoryService.getSRMColor(_mockInventoryItem)).toMatch('#963500');

    opt.itemSRM = 100;
    expect(inventoryService.getSRMColor(_mockInventoryItem)).toMatch('#140303');
  });

  test('should check if optional data object has a key that should be mapped', (): void => {
    const _mockOptionalItemData: OptionalItemData = mockOptionalItemData();

    expect(inventoryService.hasMappableKey('itemIBU', _mockOptionalItemData)).toBe(true);
    expect(inventoryService.hasMappableKey('none', _mockOptionalItemData)).toBe(false);
  });

  test('should check if item stock type is capacity based', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    expect(inventoryService.isCapacityBased(_mockInventoryItem)).toBe(false);

    _mockInventoryItem.stockType = 'Keg';

    expect(inventoryService.isCapacityBased(_mockInventoryItem)).toBe(true);

    _mockInventoryItem.stockType = 'Growler';

    expect(inventoryService.isCapacityBased(_mockInventoryItem)).toBe(true);
  });

  test('should map optional data to item', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    _mockInventoryItem.optionalItemData = {};

    const _mockOptionalItemData1: OptionalItemData = mockOptionalItemData();

    inventoryService.mapOptionalData(_mockInventoryItem, _mockOptionalItemData1);

    expect(_mockInventoryItem.optionalItemData).toStrictEqual(_mockOptionalItemData1);

    const _mockOptionalItemData2: OptionalItemData = mockOptionalItemData();
    _mockOptionalItemData2.itemLabelImage.url = 'new-url';

    inventoryService.mapOptionalData(_mockInventoryItem, _mockOptionalItemData2);

    expect(_mockInventoryItem.optionalItemData).toStrictEqual(_mockOptionalItemData2);

    _mockInventoryItem.optionalItemData.itemLabelImage = null;
    _mockInventoryItem.optionalItemData.supplierLabelImage = null;
    _mockOptionalItemData2.itemLabelImage = null;
    _mockOptionalItemData2.supplierLabelImage = null;

    const _defaultImage: Image = defaultImage();

    inventoryService.mapOptionalData(_mockInventoryItem, _mockOptionalItemData2);

    expect(_mockInventoryItem.optionalItemData.itemLabelImage).toStrictEqual(_defaultImage);
    expect(_mockInventoryItem.optionalItemData.supplierLabelImage).toStrictEqual(_defaultImage);
  });

  test('should update inventory storage', (done: jest.DoneCallback): void => {
    inventoryService.getInventoryList = jest
      .fn()
      .mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));

    inventoryService.storageService.setInventory = jest
      .fn()
      .mockReturnValueOnce(of({}))
      .mockReturnValueOnce(throwError('test-error'));

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    inventoryService.updateInventoryStorage();

    setTimeout((): void => {
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('stored inventory');

      inventoryService.updateInventoryStorage();

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('inventory store error: test-error');
        done();
      }, 10);
    }, 10);
  });

});
