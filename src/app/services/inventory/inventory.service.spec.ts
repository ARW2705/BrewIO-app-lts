/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { BehaviorSubject, Observable, Subject, concat, forkJoin, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAuthor, mockBatch, mockImage, mockImageRequestMetadata, mockInventoryItem, mockOptionalItemData, mockRecipeMasterActive, mockErrorResponse, mockStyles, mockSyncMetadata, mockSyncError, mockSyncResponse } from '../../../../test-config/mock-models';
import { IdServiceStub, ConnectionServiceStub, ErrorReportingServiceStub, EventServiceStub, ImageServiceStub, LibraryServiceStub, HttpErrorServiceStub, ProcessServiceStub, RecipeServiceStub, StorageServiceStub, SyncServiceStub, ToastServiceStub, TypeGuardServiceStub, UserServiceStub, UtilityServiceStub } from '../../../../test-config/service-stubs';
import { SplashScreenStub } from '../../../../test-config/ionic-stubs';

/* Constants imports */
import { API_VERSION, BASE_URL } from '../../shared/constants';

/* Default imports */
import { defaultImage } from '../../shared/defaults';

/* Interface imports*/
import { Author, Batch, Image, ImageRequestFormData, ImageRequestMetadata, InventoryItem, OptionalItemData, RecipeMaster, Style, SyncData, SyncRequests, SyncMetadata, SyncError, SyncResponse } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Service imports */
import { InventoryService } from './inventory.service';
import { ConnectionService, ErrorReportingService, EventService, HttpErrorService, IdService, ImageService, LibraryService, ProcessService, RecipeService, StorageService, SyncService, ToastService, TypeGuardService, UserService, UtilityService } from '../services';


describe('InventoryService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: InventoryService;
  let httpMock: HttpTestingController;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        InventoryService,
        { provide: IdService, useClass: IdServiceStub },
        { provide: ConnectionService, useClass: ConnectionServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: EventService, useClass: EventServiceStub },
        { provide: HttpErrorService, useClass: HttpErrorServiceStub },
        { provide: ImageService, useClass: ImageServiceStub },
        { provide: LibraryService, useClass: LibraryServiceStub },
        { provide: ProcessService, useClass: ProcessServiceStub },
        { provide: RecipeService, useClass: RecipeServiceStub },
        { provide: StorageService, useClass: StorageServiceStub },
        { provide: SyncService, useClass: SyncServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: TypeGuardService, useClass: TypeGuardServiceStub },
        { provide: UserService, useClass: UserServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub },
        { provide: SplashScreen, useClass: SplashScreenStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(InventoryService);
    httpMock = injector.get(HttpTestingController);
    service.errorReporter.handleUnhandledError = jest.fn();
    service.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: any) => Observable<never> => {
        return (error: any): Observable<never> => throwError(error);
      });
    service.utilService.clone = jest.fn().mockImplementation((item: any): any => item);
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    service.registerEvents = jest.fn();
    expect(service).toBeTruthy();
  });

  describe('Initializations', (): void => {

    test('should initialize inventory from server', (done: jest.DoneCallback): void => {
      service.registerEvents = jest.fn();
      service.syncOnConnection = jest.fn().mockReturnValue(of(true));
      service.getInventoryList = jest.fn().mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));
      service.updateInventoryStorage = jest.fn();
      service.checkTypeSafety = jest.fn();
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getInventoryList');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateInventoryStorage');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.initFromServer();
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
      const _mockHttpErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'user not found', `${BASE_URL}/${API_VERSION}/inventory`);
      service.registerEvents = jest.fn();
      service.syncOnConnection = jest.fn().mockReturnValue(of(true));
      service.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: HttpErrorResponse) => Observable<never> => {
        return (error: HttpErrorResponse): Observable<never> => {
          expect(error).toStrictEqual(_mockHttpErrorResponse);
          return throwError(null);
        };
      });
      service.errorReporter.handleUnhandledError = jest.fn();
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getInventoryList');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateInventoryStorage');
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.initFromServer();
      setTimeout((): void => {
        expect(getSpy).not.toHaveBeenCalled();
        expect(updateSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(null);
        done();
      }, 10);

      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/inventory`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, _mockHttpErrorResponse);
    });

    test('should get an error when init inventory and sync fails', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.registerEvents = jest.fn();
      service.syncOnConnection = jest.fn().mockReturnValue(throwError(_mockError));
      service.getInventoryList = jest.fn().mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));
      service.updateInventoryStorage = jest.fn();
      service.errorReporter.handleUnhandledError = jest.fn();
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getInventoryList');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateInventoryStorage');
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.initFromServer();
      setTimeout((): void => {
        expect(getSpy).not.toHaveBeenCalled();
        expect(updateSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should init inventory from storage', (done: jest.DoneCallback): void => {
      service.registerEvents = jest.fn();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);
      service.storageService.getInventory = jest.fn()
      .mockReturnValue(of([_mockInventoryItem, _mockInventoryItem]));
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.checkTypeSafety = jest.fn();
      const hideSpy: jest.SpyInstance = jest.spyOn(service.splashScreen, 'hide');

      service.initFromStorage();
      setTimeout((): void => {
        expect(list$.value.length).toEqual(2);
        expect(hideSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should get an error when init inventory from storage', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.registerEvents = jest.fn();
      service.storageService.getInventory = jest.fn().mockReturnValue(throwError(_mockError));
      service.errorReporter.handleUnhandledError = jest.fn();
      const hideSpy: jest.SpyInstance = jest.spyOn(service.splashScreen, 'hide');
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.initFromStorage();
      setTimeout((): void => {
        expect(hideSpy).toHaveBeenCalledWith();
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should initialize inventory', (): void => {
      service.registerEvents = jest.fn();
      service.initFromStorage = jest.fn();
      service.initFromServer = jest.fn();
      service.canSendRequest = jest.fn().mockReturnValue(true);
      const storageSpy: jest.SpyInstance = jest.spyOn(service, 'initFromStorage');
      const serverSpy: jest.SpyInstance = jest.spyOn(service, 'initFromServer');

      service.initializeInventory();

      expect(storageSpy).toHaveBeenCalled();
      expect(serverSpy).toHaveBeenCalled();
    });

    test('should register events', (): void => {
      const mockSubjects: Subject<object>[] = Array.from(Array(4), () => new Subject<object>());
      let counter: number = 0;
      service.event.register = jest.fn().mockImplementation(() => mockSubjects[counter++]);
      service.initializeInventory = jest.fn();
      service.clearInventory = jest.fn();
      service.syncOnSignup = jest.fn();
      service.syncOnReconnect = jest.fn();
      const spies: jest.SpyInstance[] = [
        jest.spyOn(service, 'initializeInventory'),
        jest.spyOn(service, 'clearInventory'),
        jest.spyOn(service, 'syncOnSignup'),
        jest.spyOn(service, 'syncOnReconnect')
      ];
      const eventSpy: jest.SpyInstance = jest.spyOn(service.event, 'register');

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


  describe('Inventory Actions', (): void => {

    test('should add an item to the list', (done: jest.DoneCallback): void => {
      service.registerEvents = jest.fn();
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.updateInventoryStorage = jest.fn();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      service.addItemToList(_mockInventoryItem)
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
      service.registerEvents = jest.fn();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
        _mockInventoryItem
      ]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.storageService.removeInventory = jest.fn();

      service.clearInventory();

      expect(list$.value.length).toEqual(0);
    });

    test('should create a new item', (done: jest.DoneCallback): void => {
      service.registerEvents = jest.fn();
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
      service.idService.getNewId = jest.fn().mockReturnValue('12345');
      service.idService.getId = jest.fn().mockReturnValue('');
      service.mapOptionalData = jest.fn()
      .mockImplementation((target: InventoryItem, _source: object): void => {
        target.optionalItemData = _mockOptionalItemData;
      });
      service.composeImageStoreRequests = jest.fn().mockReturnValue(of([]));
      service.addItemToList = jest.fn().mockReturnValue(of(null));
      service.canSendRequest = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
      service.requestInBackground = jest.fn();
      service.addSyncFlag = jest.fn();
      const requestSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');

      concat(
        service.createItem(itemValues),
        service.createItem(itemValues)
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
      service.registerEvents = jest.fn();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      service.inventory$ = new BehaviorSubject<InventoryItem[]>([
        _mockInventoryItem,
        _mockInventoryItem
      ]);

      const list$: BehaviorSubject<InventoryItem[]> = service.getInventoryList();

      expect(list$.value.length).toEqual(2);
    });

    test('should get an item from list by id', (): void => {
      service.registerEvents = jest.fn();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
        _mockInventoryItem,
        _mockInventoryItem
      ]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.idService.hasId = jest.fn().mockReturnValue(true);

      expect(service.getItemById(_mockInventoryItem.cid)).toBeDefined();
    });

    test('should remove an item from list by id', (done: jest.DoneCallback): void => {
      service.registerEvents = jest.fn();
      const _mockInventoryItem1: InventoryItem = mockInventoryItem();
      const _mockInventoryItem2: InventoryItem = mockInventoryItem();
      _mockInventoryItem2._id = 'other-id';
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
        _mockInventoryItem1,
        _mockInventoryItem2
      ]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.imageService.hasDefaultImage = jest.fn().mockReturnValue(false);
      service.imageService.deleteLocalImage = jest.fn().mockReturnValue(of(null));
      service.canSendRequest = jest.fn().mockReturnValue(true);
      service.requestInBackground = jest.fn();
      service.addSyncFlag = jest.fn();
      service.updateInventoryStorage = jest.fn();
      service.idService.hasId = jest.fn().mockReturnValue(true);
      service.idService.getId = jest.fn().mockReturnValue('');
      const reqSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');
      const addSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');

      service.removeItem(_mockInventoryItem1._id)
      .subscribe(
        (): void => {
          expect(list$.value.length).toEqual(1);
          expect(list$.value[0]).toStrictEqual(_mockInventoryItem2);
          expect(reqSpy).toHaveBeenCalled();
          expect(addSpy).not.toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should remove an item from list by id'`, error);
          expect(true).toBe(false);
        }
      );
    });

    test('should remove an item from list by id and store sync flag', (done: jest.DoneCallback): void => {
      service.registerEvents = jest.fn();
      const _mockInventoryItem1: InventoryItem = mockInventoryItem();
      const _mockInventoryItem2: InventoryItem = mockInventoryItem();
      _mockInventoryItem2._id = 'other-id';
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([
        _mockInventoryItem1,
        _mockInventoryItem2
      ]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.imageService.hasDefaultImage = jest.fn().mockReturnValue(true);
      service.imageService.deleteLocalImage = jest.fn().mockReturnValue(of(null));
      service.canSendRequest = jest.fn().mockReturnValue(false);
      service.addSyncFlag = jest.fn();
      service.updateInventoryStorage = jest.fn();
      service.idService.hasId = jest.fn().mockReturnValue(true);
      service.idService.getId = jest.fn().mockReturnValue('');
      const reqSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');
      const addSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');

      service.removeItem(_mockInventoryItem1._id)
      .subscribe(
        (): void => {
          expect(list$.value.length).toEqual(1);
          expect(list$.value[0]).toStrictEqual(_mockInventoryItem2);
          expect(reqSpy).not.toHaveBeenCalled();
          expect(addSpy).toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should remove an item from list by id'`, error);
          expect(true).toBe(false);
        }
      );
    });

    test('should get an error trying to delete an item that doesn\'t exist', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.getInventoryList = jest.fn().mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));
      service.getMissingError = jest.fn().mockReturnValue(_mockError);

      service.removeItem('wrong-id')
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: any): void => {
          expect(error.message).toMatch('test-error');
          done();
        }
      );
    });

    test('should update an item', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([_mockInventoryItem]);
      const update: object = { supplierName: 'updated name' };
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.mapOptionalData = jest.fn();
      service.composeImageStoreRequests = jest.fn().mockReturnValue([]);
      service.canSendRequest = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
      service.requestInBackground = jest.fn();
      service.addSyncFlag = jest.fn();
      service.updateInventoryStorage = jest.fn();
      service.checkTypeSafety = jest.fn();
      service.idService.hasId = jest.fn().mockReturnValue(true);
      service.idService.getId = jest.fn().mockReturnValue('');
      const requestSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');

      concat(
        service.updateItem(_mockInventoryItem.cid, update),
        service.updateItem(_mockInventoryItem.cid, update)
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
      service.removeItem = jest.fn().mockReturnValue(of(_mockInventoryItem));
      const removeSpy: jest.SpyInstance = jest.spyOn(service, 'removeItem');

      service.updateItem(_mockInventoryItem.cid, { currentQuantity: 0 })
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
      const _mockError: Error = new Error('test-error');
      service.getInventoryList = jest.fn().mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));
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

  });


  describe('Server Background Update', (): void => {

    test('should compose image upload request data', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.optionalItemData.itemLabelImage.hasPending = true;
      _mockInventoryItem.optionalItemData.supplierLabelImage.hasPending = true;

      const imageData: ImageRequestFormData[] = service.composeImageUploadRequests(_mockInventoryItem);

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
      service.imageService.storeImageToLocalDir = jest.fn().mockReturnValue(of(_mockImage));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.imageService, 'storeImageToLocalDir');

      forkJoin(service.composeImageStoreRequests(_mockInventoryItem))
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
      service.getBackgroundRequest = jest.fn().mockReturnValue(of(_mockInventoryItem));
      service.errorReporter.handleResolvableCatchError = jest.fn()
      .mockReturnValue(throwError(null));
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBackgroundRequest');

      service.configureBackgroundRequest('post', true, _mockInventoryItem)
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
      service.getBackgroundRequest = jest.fn()
      .mockReturnValue(throwError(_mockErrorResponse));
      service.errorReporter.handleResolvableCatchError = jest.fn()
      .mockImplementation((): (error: any) => Observable<any> => {
        return (error: any): Observable<any> => {
          expect(error).toStrictEqual(_mockErrorResponse);
          return of(error);
        };
      });
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBackgroundRequest');
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleResolvableCatchError');

      service.configureBackgroundRequest('post', true, _mockInventoryItem)
      .subscribe(
        (resolvedError: HttpErrorResponse): void => {
          expect(resolvedError.status).toEqual(404);
          expect(resolvedError.statusText).toMatch('not found');
          expect(getSpy).toHaveBeenCalled();
          expect(errorSpy).toHaveBeenCalledWith(true);
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
      service.getBackgroundRequest = jest.fn()
      .mockReturnValue(throwError(_mockErrorResponse));
      service.errorReporter.handleResolvableCatchError = jest.fn()
      .mockImplementation((): (error: any) => Observable<never> => {
        return (error: any): Observable<never> => {
          expect(error).toStrictEqual(_mockErrorResponse);
          return throwError(null);
        };
      });
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleResolvableCatchError');

      service.configureBackgroundRequest('post', false, _mockInventoryItem)
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: any): void => {
          expect(errorSpy).toHaveBeenCalledWith(false);
          expect(error).toBeNull();
          done();
        }
      );
    });

    test('should get a background post request', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      service.composeImageUploadRequests = jest.fn().mockReturnValue([]);
      service.imageService.blobbifyImages = jest.fn().mockReturnValue(of([]));

      service.getBackgroundRequest('post', _mockInventoryItem)
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
      service.composeImageUploadRequests = jest.fn().mockReturnValue([]);
      service.imageService.blobbifyImages = jest.fn().mockReturnValue(of([_mockImageRequestMetadata]));
      const patchSpy: jest.SpyInstance = jest.spyOn(service.http, 'patch');
      const mockFormData: FormData = new FormData();
      mockFormData.append('inventoryItem', JSON.stringify(_mockInventoryItem));
      mockFormData.append(
        _mockImageRequestMetadata.name,
        _mockImageRequestMetadata.blob,
        _mockImageRequestMetadata.filename
      );
      const route: string = `${BASE_URL}/${API_VERSION}/inventory/${_mockInventoryItem._id}`;

      service.getBackgroundRequest('patch', _mockInventoryItem)
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
        service.getBackgroundRequest('delete', null, 'delete-id'),
        service.getBackgroundRequest('delete', _mockInventoryItem)
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
      service.composeImageUploadRequests = jest.fn().mockReturnValue([]);
      service.imageService.blobbifyImages = jest.fn().mockReturnValue(of([]));
      service.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: Error) => Observable<never> => {
        return (error: Error): Observable<never> => {
          expect(error.message).toMatch('Invalid http method: invalid');
          return throwError(null);
        };
      });

      service.getBackgroundRequest('invalid', _mockInventoryItem)
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: any): void => {
          expect(error).toBeNull();
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
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.checkTypeSafety = jest.fn();
      service.idService.hasId = jest.fn().mockReturnValue(true);

      service.handleBackgroundUpdateResponse(_mockUpdateResponse, false)
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
      service.getInventoryList = jest.fn().mockReturnValue(list$);

      service.handleBackgroundUpdateResponse(_mockInventoryItem, true)
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
      const _mockError: Error = new Error('test-error');
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.getMissingError = jest.fn().mockReturnValue(_mockError);

      service.handleBackgroundUpdateResponse(_mockInventoryItem, false)
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: any): void => {
          expect(error.message).toMatch('test-error');
          done();
        }
      );
    });

    test('should make a background request', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      service.getBackgroundRequest = jest.fn().mockReturnValue(of(_mockInventoryItem));
      service.handleBackgroundUpdateResponse = jest.fn().mockReturnValue(of(true));
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.requestInBackground('post', _mockInventoryItem);

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Inventory: background post request successful');
        done();
      }, 10);
    });

    test('should get an error response from a background request', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');
      service.getBackgroundRequest = jest.fn().mockReturnValue(throwError(_mockErrorResponse));
      service.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: HttpErrorResponse) => Observable<never> => {
        return (error: HttpErrorResponse): Observable<never> => {
          expect(error).toStrictEqual(_mockErrorResponse);
          return throwError(null);
        };
      });
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.requestInBackground('post', _mockInventoryItem);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(null);
        done();
      }, 10);
    });

    test('should get an unknown sync type error when requesting in background with invalid method', (done: jest.DoneCallback): void => {
      service.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: Error) => Observable<never> => {
        return (error: Error): Observable<never> => {
          expect(error.message).toMatch('Unknown sync type: invalid');
          return throwError(null);
        };
      });
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.requestInBackground('invalid', null);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(null);
        done();
      }, 10);
    });

  });


  describe('Sync Operations', (): void => {

    test('should add a sync flag', (): void => {
      service.syncService.addSyncFlag = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(service.syncService, 'addSyncFlag');

      service.addSyncFlag('create', 'id');

      expect(addSpy).toHaveBeenCalledWith({
        method: 'create',
        docId: 'id',
        docType: 'inventory'
      });
    });

    test('should dismiss all sync errors', (): void => {
      const _mockSyncError: SyncError = mockSyncError();
      service.syncErrors = [ _mockSyncError, _mockSyncError ];

      expect(service.syncErrors.length).toEqual(2);

      service.dismissAllSyncErrors();

      expect(service.syncErrors.length).toEqual(0);
    });

    test('should dismiss sync error at an index', (): void => {
      const _mockSyncError: SyncError = mockSyncError();
      service.syncErrors = [ _mockSyncError, _mockSyncError ];

      expect(service.syncErrors.length).toEqual(2);

      service.dismissSyncError(0);

      expect(service.syncErrors.length).toEqual(1);
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
      service.syncService.getSyncFlagsByType = jest.fn().mockReturnValue(syncFlags);
      service.getItemById = jest.fn()
      .mockReturnValueOnce(_mockInventoryItem)
      .mockReturnValueOnce(_mockInventoryItemDefaultId)
      .mockReturnValueOnce(_mockInventoryItemServerId);
      service.configureBackgroundRequest = jest.fn()
      .mockReturnValueOnce(of(_mockInventoryItem))
      .mockReturnValueOnce(of(_mockInventoryItemDefaultId))
      .mockReturnValueOnce(of(_mockInventoryItemServerId));
      service.processService.getBatchById = jest.fn().mockReturnValue(_mockBatch$);
      service.idService.hasDefaultIdType = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
      service.idService.isMissingServerId = jest.fn().mockReturnValue(false);
      const requests: SyncRequests<InventoryItem> = service.generateSyncRequests();
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
      service.syncService.getSyncFlagsByType = jest.fn().mockReturnValue(syncFlags);
      service.getItemById = jest.fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(_mockInventoryItemMissingId)
      .mockReturnValueOnce(_mockInventoryItem);
      service.syncService.constructSyncError = jest.fn()
      .mockReturnValueOnce(_mockSyncErrorNotFound)
      .mockReturnValueOnce(_mockSyncErrorMissingId)
      .mockReturnValueOnce(_mockSyncErrorInvalidFlag);
      service.processService.getBatchById = jest.fn().mockReturnValue(_mockBatch$);
      service.idService.hasDefaultIdType = jest.fn().mockReturnValue(false);
      service.idService.isMissingServerId = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

      const requests: SyncRequests<InventoryItem> = service.generateSyncRequests();

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
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.checkTypeSafety = jest.fn();
      service.idService.hasId = jest.fn().mockReturnValue(true);
      const syncData: (InventoryItem | SyncData<InventoryItem>)[] = [
        _mockInventoryItem,
        { isDeleted: true, data: null }
      ];

      service.processSyncSuccess(syncData);

      expect(list$.value[0].cid).toMatch('123');
    });

    test('should encounter and store error during processing of sync requests', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const list$: BehaviorSubject<InventoryItem[]> = new BehaviorSubject<InventoryItem[]>([]);
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      const syncData: (InventoryItem | SyncData<InventoryItem>)[] = [
        _mockInventoryItem
      ];

      service.processSyncSuccess(syncData);

      expect(service.syncErrors[0]).toStrictEqual({
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
      service.userService.isLoggedIn = jest.fn().mockReturnValue(true);
      service.generateSyncRequests = jest.fn()
      .mockReturnValue({ syncRequests: [], syncErrors: [ preError ] });
      service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
      service.processSyncSuccess = jest.fn();
      service.updateInventoryStorage = jest.fn();
      const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateInventoryStorage');

      service.syncOnConnection(false)
      .subscribe(
        (): void => {
          expect(processSpy).toHaveBeenCalled();
          expect(updateSpy).toHaveBeenCalled();
          expect(service.syncErrors.length).toEqual(2);
          expect(service.syncErrors[0]).toStrictEqual(responseError);
          expect(service.syncErrors[1]).toStrictEqual(preError);
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
      service.userService.isLoggedIn = jest.fn().mockReturnValue(true);
      service.generateSyncRequests = jest.fn()
      .mockReturnValue({ syncRequests: [], syncErrors: [] });
      service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
      service.processSyncSuccess = jest.fn();
      service.updateInventoryStorage = jest.fn();
      const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateInventoryStorage');

      service.syncOnConnection(true)
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
      service.userService.isLoggedIn = jest.fn().mockReturnValue(false);
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getInventoryList');

      service.syncOnConnection(false)
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
      const _mockError: Error = new Error('test-error');
      service.syncOnConnection = jest.fn()
      .mockReturnValueOnce(of({}))
      .mockReturnValueOnce(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.syncOnReconnect();

      setTimeout((): void => {
        expect(errorSpy).not.toHaveBeenCalled();

        service.syncOnReconnect();

        setTimeout((): void => {
          expect(errorSpy).toHaveBeenCalledWith(_mockError);
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
      service.getInventoryList = jest.fn().mockReturnValue(list$);
      service.processService.getBatchById = jest.fn().mockReturnValue(_mockBatch$);
      service.configureBackgroundRequest = jest.fn().mockReturnValue(_mockInventoryItem);
      service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
      service.processSyncSuccess = jest.fn();
      service.updateInventoryStorage = jest.fn();
      service.idService.getId = jest.fn().mockReturnValue(_mockInventoryItem._id);
      const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateInventoryStorage');

      service.syncOnSignup();

      setTimeout((): void => {
        expect(processSpy).toHaveBeenCalled();
        expect(updateSpy).toHaveBeenCalled();
        done();
      }, 10);
    });
  });


  describe('Other Methods', (): void => {

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
      const message: string = 'test-message';
      const additional: string = 'test-additional';
      const errorWithAdditional: CustomError = <CustomError>service.getMissingError(message, additional);

      expect(errorWithAdditional.name).toMatch('InventoryError');
      expect(errorWithAdditional.message).toMatch(`${message} ${additional}`);
      expect(errorWithAdditional.severity).toEqual(2);
      expect(errorWithAdditional.userMessage).toMatch(message);

      const errorWithOutAdditional: CustomError = <CustomError>service.getMissingError(message);

      expect(errorWithOutAdditional.message).toMatch(`${message} `);
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

    test('should check if item stock type is capacity based', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      expect(service.isCapacityBased(_mockInventoryItem)).toBe(false);

      _mockInventoryItem.stockType = 'Keg';

      expect(service.isCapacityBased(_mockInventoryItem)).toBe(true);

      _mockInventoryItem.stockType = 'Growler';

      expect(service.isCapacityBased(_mockInventoryItem)).toBe(true);
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

    test('should update inventory storage', (done: jest.DoneCallback): void => {
      service.getInventoryList = jest.fn().mockReturnValue(new BehaviorSubject<InventoryItem[]>([]));
      service.storageService.setInventory = jest.fn().mockReturnValue(of(null));
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.updateInventoryStorage();

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('stored inventory');
        done();
      }, 10);
    });

    test('should handle error thrown from inventory storage', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.storageService.setInventory = jest.fn().mockReturnValue(throwError(_mockError));
      service.errorReporter.handleUnhandledError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.updateInventoryStorage();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      });
    });
  });


  describe('Type Guards', (): void => {

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

});
