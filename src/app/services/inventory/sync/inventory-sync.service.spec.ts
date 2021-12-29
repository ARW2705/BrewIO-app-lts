/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { BehaviorSubject, forkJoin, of } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockBatch, mockInventoryItem, mockSyncError, mockSyncMetadata, mockSyncResponse } from '@test/mock-models';
import { IdServiceStub, InventoryHttpServiceStub, InventoryTypeGuardServiceStub, ProcessServiceStub, SyncServiceStub, UserServiceStub, UtilityServiceStub } from '@test/service-stubs';

/* Interface imports*/
import { Batch, InventoryItem, SyncData, SyncError, SyncMetadata, SyncRequests, SyncResponse } from '@shared/interfaces';

/* Service imports */
import { InventoryHttpService } from '@services/inventory/http/inventory-http.service';
import { InventoryTypeGuardService } from '@services/inventory/type-guard/inventory-type-guard.service';
import { IdService, ProcessService, SyncService, UserService, UtilityService } from '@services/public';
import { InventorySyncService } from './inventory-sync.service';


describe('InventorySyncService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: InventorySyncService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        InventorySyncService,
        { provide: IdService, useClass: IdServiceStub },
        { provide: InventoryHttpService, useClass: InventoryHttpServiceStub },
        { provide: InventoryTypeGuardService, useClass: InventoryTypeGuardServiceStub },
        { provide: ProcessService, useClass: ProcessServiceStub },
        { provide: SyncService, useClass: SyncServiceStub },
        { provide: UserService, useClass: UserServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(InventorySyncService);
    service.idService.hasId = jest.fn()
      .mockImplementation((source: any, target: string): boolean => {
        return source._id === target || source.cid === target;
      });
    service.utilService.clone = jest.fn().mockImplementation((item: any): any => item);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

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

  test('should convert request method name to sync method name', (): void => {
    service.syncService.convertRequestMethodToSyncMethod = jest.fn().mockReturnValue('test');
    const convertSpy: jest.SpyInstance = jest.spyOn(service.syncService, 'convertRequestMethodToSyncMethod');
    expect(service.convertRequestMethodToSyncMethod('input')).toMatch('test');
    expect(convertSpy).toHaveBeenCalledWith('input');
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
    const mockInventoryList: InventoryItem[] = [
      _mockInventoryItem,
      _mockInventoryItemDefaultId,
      _mockInventoryItemServerId
    ];
    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(mockBatch());
    const syncFlags: SyncMetadata[] = [
      mockSyncMetadata('delete', _mockInventoryItem.cid, 'inventory'),
      mockSyncMetadata('update', _mockInventoryItemDefaultId.cid, 'inventory'),
      mockSyncMetadata('create', _mockInventoryItemServerId.cid, 'inventory')
    ];
    service.syncService.getSyncFlagsByType = jest.fn().mockReturnValue(syncFlags);
    service.inventoryHttpService.configureSyncBackgroundRequest = jest.fn()
      .mockReturnValueOnce(of(_mockInventoryItem))
      .mockReturnValueOnce(of(_mockInventoryItemDefaultId))
      .mockReturnValueOnce(of(_mockInventoryItemServerId));
    service.processService.getBatchById = jest.fn().mockReturnValue(_mockBatch$);
    service.idService.hasDefaultIdType = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    service.idService.isMissingServerId = jest.fn().mockReturnValue(false);
    const requests: SyncRequests<InventoryItem> = service.generateSyncRequests(mockInventoryList);
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
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockInventoryItemMissingId: InventoryItem = mockInventoryItem();
    delete _mockInventoryItemMissingId._id;
    const _mockInventoryList: InventoryItem[] = [
      _mockInventoryItem,
      _mockInventoryItemMissingId
    ];
    const syncFlags: SyncMetadata[] = [
      mockSyncMetadata('create', 'id1', 'inventory'),
      mockSyncMetadata('update', _mockInventoryItem.cid, 'invenotry'),
      mockSyncMetadata('invalid', _mockInventoryItemMissingId.cid, 'inventory')
    ];
    const _mockSyncErrorNotFound: SyncError = mockSyncError();
    const errMsg1: string = `Sync error: Item with id 'id1' not found`;
    _mockSyncErrorNotFound.message = errMsg1;
    const _mockSyncErrorMissingId: SyncError = mockSyncError();
    const errMsg2: string = `Item with id: '${_mockInventoryItemMissingId.cid}' is missing its server id`;
    _mockSyncErrorMissingId.message = errMsg2;
    const _mockSyncErrorInvalidFlag: SyncError = mockSyncError();
    const errMsg3: string = `Sync error: Unknown sync flag method 'invalid'`;
    _mockSyncErrorInvalidFlag.message = errMsg3;
    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(mockBatch());
    service.syncService.getSyncFlagsByType = jest.fn().mockReturnValue(syncFlags);
    service.syncService.constructSyncError = jest.fn()
      .mockReturnValueOnce(_mockSyncErrorNotFound)
      .mockReturnValueOnce(_mockSyncErrorMissingId)
      .mockReturnValueOnce(_mockSyncErrorInvalidFlag);
    service.processService.getBatchById = jest.fn().mockReturnValue(_mockBatch$);
    service.idService.hasDefaultIdType = jest.fn().mockReturnValue(false);
    service.idService.isMissingServerId = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const requests: SyncRequests<InventoryItem> = service.generateSyncRequests(_mockInventoryList);

    expect(requests.syncErrors.length).toEqual(3);
    expect(requests.syncRequests.length).toEqual(0);
    expect(requests.syncErrors[0].message).toMatch(errMsg1);
    expect(requests.syncErrors[1].message).toMatch(errMsg2);
    expect(requests.syncErrors[2].message).toMatch(errMsg3);
  });

  test('should process sync requests', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockInventoryItemNew: InventoryItem = mockInventoryItem();
    _mockInventoryItemNew.cid = '123';
    service.inventoryTypeGuardService.checkTypeSafety = jest.fn();
    service.idService.hasId = jest.fn().mockReturnValue(true);
    const syncData: (InventoryItem | SyncData<InventoryItem>)[] = [
      _mockInventoryItem,
      { isDeleted: true, data: null }
    ];

    service.processSyncSuccess(syncData, [_mockInventoryItem]);

    expect(_mockInventoryItem.cid).toMatch('123');
  });

  test('should encounter and store error during processing of sync requests', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const syncData: (InventoryItem | SyncData<InventoryItem>)[] = [ _mockInventoryItem ];

    service.processSyncSuccess(syncData, []);

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
    service.processSyncSuccess = jest.fn().mockReturnValue([]);
    const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');

    service.syncOnConnection(false, [])
      .subscribe(
        (results: InventoryItem[]): void => {
          expect(processSpy).toHaveBeenCalledWith(_mockSyncResponse.successes, []);
          expect(service.syncErrors.length).toEqual(2);
          expect(service.syncErrors[0]).toStrictEqual(responseError);
          expect(service.syncErrors[1]).toStrictEqual(preError);
          expect(results).toStrictEqual([]);
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
    const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');

    service.syncOnConnection(true, [])
      .subscribe(
        (results: InventoryItem[]): void => {
          expect(processSpy).not.toHaveBeenCalled();
          expect(results).toBeNull();
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
    const genSpy: jest.SpyInstance = jest.spyOn(service, 'generateSyncRequests');

    service.syncOnConnection(false, [])
      .subscribe(
        (results: InventoryItem[]): void => {
          expect(genSpy).not.toHaveBeenCalled();
          expect(results).toBeNull();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should not sync on reconnect if not logged in'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should sync on signup', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockBatch: Batch = mockBatch();
    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
    const _mockSyncResponse: SyncResponse<InventoryItem> = mockSyncResponse<InventoryItem>();
    service.processService.getBatchById = jest.fn().mockReturnValue(_mockBatch$);
    service.inventoryHttpService.configureSyncBackgroundRequest = jest.fn()
      .mockReturnValue(of(_mockInventoryItem));
    service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
    service.processSyncSuccess = jest.fn().mockReturnValue([_mockInventoryItem]);
    service.idService.getId = jest.fn().mockReturnValue(_mockInventoryItem._id);
    const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');

    service.syncOnSignup([_mockInventoryItem])
      .subscribe(
        (results: InventoryItem[]): void => {
          expect(processSpy).toHaveBeenCalledWith(
            _mockSyncResponse.successes,
            [_mockInventoryItem]
          );
          expect(results).toStrictEqual([_mockInventoryItem]);
          done();
        },
        (error: any): void => {
          console.log('Error in: should sync on signup', error);
          expect(true).toBe(false);
        }
      );
  });

});
