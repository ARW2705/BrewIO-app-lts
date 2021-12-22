/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockErrorResponse, mockInventoryItem, mockSyncMetadata } from '../../../../test-config/mock-models';
import { ErrorReportingServiceStub, HttpErrorServiceStub, IdServiceStub, StorageServiceStub, TypeGuardServiceStub } from '../../../../test-config/service-stubs';

/* Interface imports */
import { InventoryItem, SyncError, SyncMetadata, SyncResponse } from '../../shared/interfaces';

/* Service imports */
import { SyncService } from './sync.service';
import { ErrorReportingService, HttpErrorService, IdService, StorageService, TypeGuardService } from '../services';


describe('SyncService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: SyncService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        SyncService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: HttpErrorService, useClass: HttpErrorServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: StorageService, useClass: StorageServiceStub },
        { provide: TypeGuardService, useClass: TypeGuardServiceStub }
      ]
    });
    StorageServiceStub._body = of([]);
    injector = getTestBed();
    service = injector.get(SyncService);
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(SyncService);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should handle a create sync flag', (): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('create', 'docId', 'docType');
    service.syncFlags = [];
    service.updateStorage = jest.fn();

    service.addCreateSyncFlag(_mockSyncMetadata);

    expect(service.syncFlags.length).toEqual(1);
    expect(service.syncFlags[0]).toStrictEqual(_mockSyncMetadata);

    service.addCreateSyncFlag(_mockSyncMetadata);

    expect(service.syncFlags.length).toEqual(1);
  });

  test('should handle an update sync flag', (): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('update', '1a2b3c', 'docType');
    service.syncFlags = [];
    service.updateStorage = jest.fn();
    service.idService.hasDefaultIdType = jest.fn().mockReturnValue(false);

    expect(service.syncFlags.length).toEqual(0);

    service.addUpdateSyncFlag(_mockSyncMetadata);

    expect(service.syncFlags.length).toEqual(1);
    expect(service.syncFlags[0]).toStrictEqual(_mockSyncMetadata);

    service.addUpdateSyncFlag(_mockSyncMetadata);
    expect(service.syncFlags.length).toEqual(1);
  });

  test('should handle a delete sync flag', (): void => {
    const _mockSyncDelete: SyncMetadata = mockSyncMetadata('delete', '1a2b3c', 'docType');
    service.syncFlags = [];
    service.updateStorage = jest.fn();

    service.addDeleteSyncFlag(_mockSyncDelete);

    expect(service.syncFlags.length).toEqual(1);
    expect(service.syncFlags[0]).toStrictEqual(_mockSyncDelete);

    const _mockSyncCreate: SyncMetadata = mockSyncMetadata('create', '1a2b3c', 'docType');
    service.syncFlags = [_mockSyncCreate];

    service.addDeleteSyncFlag(_mockSyncDelete);

    expect(service.syncFlags.length).toEqual(0);

    const _mockSyncUpdate: SyncMetadata = mockSyncMetadata('update', '1a2b3c', 'docType');
    service.syncFlags = [_mockSyncUpdate];

    service.addDeleteSyncFlag(_mockSyncDelete);

    expect(service.syncFlags.length).toEqual(1);
    expect(service.syncFlags[0]).toStrictEqual(_mockSyncDelete);
  });

  test('should add a sync flag', (): void => {
    service.addCreateSyncFlag = jest.fn();
    const addSpy: jest.SpyInstance = jest.spyOn(service, 'addCreateSyncFlag');
    service.addUpdateSyncFlag = jest.fn();
    const updateSpy: jest.SpyInstance = jest.spyOn(service, 'addUpdateSyncFlag');
    service.addDeleteSyncFlag = jest.fn();
    const deleteSpy: jest.SpyInstance = jest.spyOn(service, 'addDeleteSyncFlag');
    service.updateStorage = jest.fn();
    const storageSpy: jest.SpyInstance = jest.spyOn(service, 'updateStorage');
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('create', '1', 'docType');

    service.addSyncFlag(_mockSyncMetadata);
    expect(addSpy).toHaveBeenCalledWith(_mockSyncMetadata);

    _mockSyncMetadata.method = 'update';
    service.addSyncFlag(_mockSyncMetadata);
    expect(updateSpy).toHaveBeenCalledWith(_mockSyncMetadata);

    _mockSyncMetadata.method = 'delete';
    service.addSyncFlag(_mockSyncMetadata);
    expect(deleteSpy).toHaveBeenCalledWith(_mockSyncMetadata);
    expect(storageSpy).toHaveBeenCalledTimes(3);
  });

  test('should get an error adding an unknown sync flag', (): void => {
    expect((): void => {
      service.addSyncFlag(mockSyncMetadata('invalid', 'docId', 'docType'));
    })
    .toThrowError('Unknown sync flag method: invalid');
  });

  test('should clear sync data', (): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('create', 'docId', 'docType');
    service.syncFlags = [_mockSyncMetadata];
    service.storageService.removeSyncFlags = jest.fn();

    service.clearSyncData();

    expect(service.syncFlags.length).toEqual(0);
  });

  test('should clear sync flags by type', (): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('create', 'docId', 'docType');
    const _mockToClear: SyncMetadata = mockSyncMetadata('create', 'docId', 'clearType');
    service.syncFlags = [ _mockSyncMetadata, _mockToClear, _mockSyncMetadata, _mockSyncMetadata ];
    service.updateStorage = jest.fn();

    service.clearSyncFlagByType('clearType');

    expect(service.syncFlags.length).toEqual(3);
    expect(service.syncFlags.find((flag: SyncMetadata): boolean => flag.docType === 'clearType')).toBeUndefined();
  });

  test('should construct sync error', (): void => {
    expect(service.constructSyncError('test-message', 2)).toStrictEqual({errCode: 2, message: 'test-message'});
    expect(service.constructSyncError('test-message-no-code')).toStrictEqual({errCode: -1, message: 'test-message-no-code'});
  });

  test('should get all sync flags', (): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('create', 'docId', 'docType');
    const _mockToClear: SyncMetadata = mockSyncMetadata('create', 'docId', 'clearType');
    const flagList: SyncMetadata[] = [ _mockSyncMetadata, _mockToClear, _mockSyncMetadata, _mockSyncMetadata ];
    service.syncFlags = flagList;

    expect(service.getAllSyncFlags()).toStrictEqual(flagList);
  });

  test('should get requests with error resolving handlers', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const httpError: HttpErrorResponse = mockErrorResponse(500, 'server error');
    const requests: Observable<InventoryItem>[] = [ of(_mockInventoryItem), throwError(httpError) ];

    forkJoin(service.getRequestsWithErrorResolvingHandlers<InventoryItem>(requests))
      .subscribe(
        (results: (InventoryItem | HttpErrorResponse)[]): void => {
          expect(results[0]).toStrictEqual(_mockInventoryItem);
          expect(results[1]).toStrictEqual(httpError);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should get requests with error resolving handlers'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get sync flags by type', (): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('create', 'docId', 'docType');
    const _mockToGet: SyncMetadata = mockSyncMetadata('create', 'docId', 'getType');
    service.syncFlags = [ _mockSyncMetadata, _mockToGet, _mockSyncMetadata, _mockSyncMetadata ];
    service.updateStorage = jest.fn();

    expect(service.getSyncFlagsByType('getType')).toStrictEqual([_mockToGet]);
  });

  test('should load sync flags', (done: jest.DoneCallback): void => {
    const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('method', 'docId', 'docType');
    service.storageService.getSyncFlags = jest.fn().mockReturnValue(of([_mockSyncMetadata]));

    service.init();

    setTimeout((): void => {
      console.log(service.syncFlags);
      expect(service.syncFlags).toStrictEqual([_mockSyncMetadata]);
      done();
    }, 10);
  });

  test('should get an error loading sync flags', (done: jest.DoneCallback): void => {
    const notFoundError: Error = new Error();
    notFoundError.name = 'NotFoundError';
    notFoundError.message = 'test-error-message';
    service.storageService.getSyncFlags = jest.fn().mockReturnValue(throwError(notFoundError));
    service.errorReporter.handleUnhandledError = jest.fn();
    const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

    service.init();

    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(notFoundError);
      done();
    }, 10);
  });

  test('should process errors as sync errors', (): void => {
    const error: Error = new Error('error-msg');
    const httpError: HttpErrorResponse = mockErrorResponse(503, 'server error');
    const errors: (HttpErrorResponse | Error)[] = [ error, httpError ];
    service.httpError.composeErrorMessage = jest.fn()
      .mockReturnValue('<503> Service Unavailable');
    service.constructSyncError = jest.fn()
      .mockImplementation((message: string): SyncError => {
        return { errCode: 1, message: message };
      });

    expect(service.processSyncErrors(errors)).toStrictEqual([
      { errCode: 1, message: 'error-msg' },
      { errCode: 1, message: '<503> Service Unavailable' }
    ]);
  });

  test('should process errors as sync errors with default values', (): void => {
    const httpError: HttpErrorResponse = mockErrorResponse(null, null);
    const errors: (HttpErrorResponse | Error)[] = [ httpError ];
    service.httpError.composeErrorMessage = jest.fn()
      .mockReturnValue('<500> Internal Service Error');
    service.constructSyncError = jest.fn()
      .mockImplementation((message: string): SyncError => {
        return { errCode: 1, message: message };
      });

    expect(service.processSyncErrors(errors)).toStrictEqual([
      { errCode: 1, message: '<500> Internal Service Error' }
    ]);
  });

  test('should process errors as sync errors with validation error', (): void => {
    const _mockError: Error = new Error();
    _mockError.name = 'ValidationError';
    _mockError.message = 'test validation error';
    const httpError: HttpErrorResponse = mockErrorResponse(400, 'bad request', 'url', _mockError);
    const errors: (HttpErrorResponse | Error)[] = [ httpError ];
    service.httpError.composeErrorMessage = jest.fn()
      .mockReturnValue('<400> Bad Request: Test Validation Error');
    service.constructSyncError = jest.fn()
      .mockImplementation((message: string): SyncError => {
        return { errCode: 1, message: message };
      });

    expect(service.processSyncErrors(errors)).toStrictEqual([
      { errCode: 1, message: '<400> Bad Request: Test Validation Error' }
    ]);
  });

  test('should perform sync requests', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const httpError: HttpErrorResponse = mockErrorResponse(500, 'server error');
    const requests: Observable<any>[] = [ of(_mockInventoryItem), of(httpError) ];
    const syncError: SyncError = { errCode: 1, message: '<500> server error' };
    service.clearSyncFlagByType = jest.fn();
    service.processSyncErrors = jest.fn().mockReturnValue([syncError]);
    service.getRequestsWithErrorResolvingHandlers = jest.fn()
      .mockImplementation((_requests: Observable<any>[]): Observable<any>[] => _requests);

    service.sync<InventoryItem>('inventory', requests)
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
    service.storageService.setSyncFlags = jest.fn().mockReturnValue(of({}));
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    service.updateStorage();

    setTimeout((): void => {
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Stored sync flags');
      done();
    }, 10);
  });

  test('should get an error updating storage', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    service.storageService.setSyncFlags = jest.fn()
      .mockReturnValue(throwError(_mockError));
    service.errorReporter.handleUnhandledError = jest.fn();
    const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

    service.updateStorage();

    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

});
