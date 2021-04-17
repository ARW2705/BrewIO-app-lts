/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockErrorResponse } from '../../../../test-config/mock-models/mock-response';
import { mockInventoryItem } from '../../../../test-config/mock-models/mock-inventory';
import { mockSyncMetadata, mockSyncResponse } from '../../../../test-config/mock-models/mock-sync';
import { StorageServiceMock } from '../../../../test-config/mocks-app';

/* Interface imports */
import { InventoryItem } from '../../shared/interfaces/inventory-item';
import { SyncError, SyncData, SyncMetadata, SyncResponse } from '../../shared/interfaces/sync';

/* Service imports */
import { SyncService } from './sync.service';
import { StorageService } from '../storage/storage.service';


describe('SyncService', (): void => {
  let injector: TestBed;
  let syncService: SyncService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        SyncService,
        { provide: StorageService, useClass: StorageServiceMock }
      ]
    });
    StorageServiceMock._body = of([]);
    injector = getTestBed();
    syncService = injector.get(SyncService);
  }));

  beforeEach((): void => {
    injector = getTestBed();
    syncService = injector.get(SyncService);
  });

  test('should create the service', (): void => {
    expect(syncService).toBeDefined();
  });

  test('should handle a create sync flag', (): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('create', 'docId', 'docType');
    syncService.syncFlags = [];

    syncService.updateStorage = jest
      .fn();

    syncService.addSyncFlag(_mockSyncMetadata);

    expect(syncService.syncFlags.length).toEqual(1);
    expect(syncService.syncFlags[0]).toStrictEqual(_mockSyncMetadata);

    syncService.addSyncFlag(_mockSyncMetadata);

    expect(syncService.syncFlags.length).toEqual(1);
  });

  test('should handle an update sync flag', (): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('update', '1a2b3c', 'docType');

    syncService.syncFlags = [];

    syncService.updateStorage = jest
      .fn();

    expect(syncService.syncFlags.length).toEqual(0);

    syncService.addSyncFlag(_mockSyncMetadata);

    expect(syncService.syncFlags.length).toEqual(1);
    expect(syncService.syncFlags[0]).toStrictEqual(_mockSyncMetadata);

    syncService.addSyncFlag(_mockSyncMetadata);
    expect(syncService.syncFlags.length).toEqual(1);
  });

  test('should handle a delete sync flag', (): void => {
    const _mockSyncDelete: SyncMetadata = mockSyncMetadata('delete', '1a2b3c', 'docType');
    const _mockSyncCreate: SyncMetadata = mockSyncMetadata('create', '1a2b3c', 'docType');
    const _mockSyncUpdate: SyncMetadata = mockSyncMetadata('update', '1a2b3c', 'docType');

    syncService.syncFlags = [];

    syncService.updateStorage = jest
      .fn();

    syncService.addSyncFlag(_mockSyncDelete);

    expect(syncService.syncFlags.length).toEqual(1);
    expect(syncService.syncFlags[0]).toStrictEqual(_mockSyncDelete);

    syncService.syncFlags = [_mockSyncCreate];

    syncService.addSyncFlag(_mockSyncDelete);

    expect(syncService.syncFlags.length).toEqual(0);

    syncService.syncFlags = [_mockSyncUpdate];

    syncService.addSyncFlag(_mockSyncDelete);

    expect(syncService.syncFlags.length).toEqual(1);
    expect(syncService.syncFlags[0]).toStrictEqual(_mockSyncDelete);
  });

  test('should get an error adding an unknown sync flag', (): void => {
    expect((): void => {
      syncService.addSyncFlag(mockSyncMetadata('invalid', 'docId', 'docType'));
    })
    .toThrowError('Unknown sync flag method: invalid');
  });

  test('should clear sync data', (): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('create', 'docId', 'docType');

    syncService.syncFlags = [_mockSyncMetadata];

    syncService.storageService.removeSyncFlags = jest
      .fn();

    syncService.clearSyncData();

    expect(syncService.syncFlags.length).toEqual(0);
  });

  test('should clear sync flags by type', (): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('create', 'docId', 'docType');
    const _mockToClear: SyncMetadata = mockSyncMetadata('create', 'docId', 'clearType');

    syncService.syncFlags = [ _mockSyncMetadata, _mockToClear, _mockSyncMetadata, _mockSyncMetadata ];

    syncService.updateStorage = jest
      .fn();

    syncService.clearSyncFlagByType('clearType');

    expect(syncService.syncFlags.length).toEqual(3);
    expect(syncService.syncFlags.find((flag: SyncMetadata): boolean => flag.docType === 'clearType')).toBeUndefined();
  });

  test('should construct sync error', (): void => {
    expect(syncService.constructSyncError('test-message', 2)).toStrictEqual({errCode: 2, message: 'test-message'});
    expect(syncService.constructSyncError('test-message-no-code')).toStrictEqual({errCode: -1, message: 'test-message-no-code'});
  });

  test('should get all sync flags', (): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('create', 'docId', 'docType');
    const _mockToClear: SyncMetadata = mockSyncMetadata('create', 'docId', 'clearType');

    const flagList: SyncMetadata[] = [ _mockSyncMetadata, _mockToClear, _mockSyncMetadata, _mockSyncMetadata ];

    syncService.syncFlags = flagList;

    expect(syncService.getAllSyncFlags()).toStrictEqual(flagList);
  });

  test('should get sync flags by type', (): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('create', 'docId', 'docType');
    const _mockToGet: SyncMetadata = mockSyncMetadata('create', 'docId', 'getType');

    syncService.syncFlags = [ _mockSyncMetadata, _mockToGet, _mockSyncMetadata, _mockSyncMetadata ];

    syncService.updateStorage = jest
      .fn();

    expect(syncService.getSyncFlagsByType('getType')).toStrictEqual([_mockToGet]);
  });

  test('should load sync flags', (done: jest.DoneCallback): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('method', 'docId', 'docType');

    syncService.storageService.getSyncFlags = jest
      .fn()
      .mockReturnValue(of([_mockSyncMetadata]));

    syncService.init();

    setTimeout((): void => {
      console.log(syncService.syncFlags);
      expect(syncService.syncFlags).toStrictEqual([_mockSyncMetadata]);
      done();
    }, 10);
  });

  test('should get a generic error loading sync flags', (done: jest.DoneCallback): void => {
    const notFoundError: Error = new Error();
    notFoundError.name = 'NotFoundError';
    notFoundError.message = 'test-error-message';

    syncService.storageService.getSyncFlags = jest
      .fn()
      .mockReturnValue(throwError('test-error'));

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    syncService.init();

    setTimeout((): void => {
      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('Sync error');
      expect(consoleCalls[1]).toMatch('test-error');
      done();
    }, 10);
  });

  test('should get a NotFoundError loading sync flags', (done: jest.DoneCallback): void => {
    const notFoundError: Error = new Error();
    notFoundError.name = 'NotFoundError';
    notFoundError.message = 'test-error-message';

    syncService.storageService.getSyncFlags = jest
      .fn()
      .mockReturnValue(throwError(notFoundError));

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    syncService.init();

    setTimeout((): void => {
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('test-error-message');
      done();
    }, 10);
  });

  test('should process errors as sync errors', (): void => {
    const error: Error = new Error('error-msg');
    const httpError: HttpErrorResponse = mockErrorResponse(500, 'server error');

    const errors: (HttpErrorResponse | Error)[] = [ error, httpError ];

    expect(syncService.processSyncErrors(errors)).toStrictEqual([
      { errCode: -1, message: 'error-msg' },
      { errCode: 1, message: '<500> server error' }
    ]);
  });

  test('should perform sync requests', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const httpError: HttpErrorResponse = mockErrorResponse(500, 'server error');
    const requests = [ of(_mockInventoryItem), of(httpError) ];
    const syncError: SyncError = { errCode: 1, message: '<500> server error' };

    syncService.clearSyncFlagByType = jest
      .fn();

    syncService.processSyncErrors = jest
      .fn()
      .mockReturnValue([syncError]);

    syncService.sync<InventoryItem>('inventory', requests)
      .subscribe(
        (response: SyncResponse<InventoryItem>): void => {
          expect(response).toStrictEqual({
            successes: [_mockInventoryItem],
            errors: [syncError]
          });
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should perform sync requests'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should update storage', (done: jest.DoneCallback): void => {
    syncService.storageService.setSyncFlags = jest
      .fn()
      .mockReturnValue(of({}));

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    syncService.updateStorage();

    setTimeout((): void => {
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Stored sync flags');
      done();
    }, 10);
  });

  test('should get an error updating storage', (done: jest.DoneCallback): void => {
    syncService.storageService.setSyncFlags = jest
      .fn()
      .mockReturnValue(throwError('test-error'));

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    syncService.updateStorage();

    setTimeout((): void => {
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Sync flag store error: test-error');
      done();
    }, 10);
  });

});
