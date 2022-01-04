/* Module imports */
import { HttpErrorResponse } from '@angular/common/http';
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/* TestBed configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockBatch, mockRecipeMasterActive, mockSyncError, mockSyncMetadata, mockSyncResponse, mockUser } from '@test/mock-models';
import { ErrorReportingServiceStub, IdServiceStub, ProcessHttpServiceStub, ProcessTypeGuardServiceStub, RecipeServiceStub, SyncServiceStub, UserServiceStub } from '@test/service-stubs';

/* Interface imports */
import { Batch, RecipeMaster, SyncData, SyncError, SyncRequests, SyncResponse, User } from '@shared/interfaces';

/* Service imports */
import { ProcessHttpService } from '@services/process/http/process-http.service';
import { ProcessTypeGuardService } from '@services/process/type-guard/process-type-guard.service';
import { ErrorReportingService, IdService, RecipeService, SyncService, UserService } from '@services/public';
import { ProcessSyncService } from './process-sync.service';


describe('ProcessSyncService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: ProcessSyncService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        ProcessSyncService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ProcessHttpService, useClass: ProcessHttpServiceStub },
        { provide: ProcessTypeGuardService, useClass: ProcessTypeGuardServiceStub },
        { provide: RecipeService, useClass: RecipeServiceStub },
        { provide: SyncService, useClass: SyncServiceStub },
        { provide: UserService, useClass: UserServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(ProcessSyncService);
    service.errorReporter.handleUnhandledError = jest.fn();
    service.processTypeGuardService.checkTypeSafety = jest.fn();
    service.idService.hasId = jest.fn()
      .mockImplementation((obj: any, id: string): boolean => obj['_id'] === id || obj['cid'] === id);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should add a sync flag', (): void => {
    service.syncService.addSyncFlag = jest.fn();
    const syncSpy: jest.SpyInstance = jest.spyOn(service.syncService, 'addSyncFlag');

    service.addSyncFlag('create', '012345');

    expect(syncSpy).toHaveBeenCalledWith({
      method: 'create',
      docId: '012345',
      docType: 'batch'
    });
  });

  test('should convert request method to sync method', (): void => {
    service.syncService.convertRequestMethodToSyncMethod = jest.fn().mockReturnValue('create');
    const convertSpy: jest.SpyInstance = jest.spyOn(service.syncService, 'convertRequestMethodToSyncMethod');

    expect(service.convertRequestMethodToSyncMethod('post')).toMatch('create');
    expect(convertSpy).toHaveBeenCalledWith('post');
  });

  test('should dismiss all sync errors', (): void => {
    service.syncErrors = [ mockSyncError() ];

    service.dismissAllSyncErrors();

    expect(service.syncErrors.length).toEqual(0);
  });

  test('should dismiss a sync error by index', (): void => {
    const _mockSyncError1: SyncError = mockSyncError();
    _mockSyncError1.errCode++;
    const _mockSyncError2: SyncError = mockSyncError();

    service.syncErrors = [ _mockSyncError1, _mockSyncError2 ];

    service.dismissSyncError(0);

    expect(service.syncErrors[0]).toStrictEqual(_mockSyncError2);
  });

  test('should generate sync requests (successes)', (done: jest.DoneCallback): void => {
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    const _mockBatchOffline: Batch = mockBatch();
    _mockBatchOffline.owner = 'offline';
    _mockBatchOffline.recipeMasterId = _mockRecipeMasterActive.cid;
    const _mockBatchOffline$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatchOffline);
    const _mockBatch: Batch = mockBatch();
    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
    const _mockUser: User = mockUser();
    service.syncService.getSyncFlagsByType = jest.fn()
      .mockReturnValue([
        mockSyncMetadata('create', _mockBatchOffline.cid, 'batch'),
        mockSyncMetadata('update', _mockBatch.cid, 'batch')
      ]);
    service.userService.getUser = jest.fn()
      .mockReturnValue(new BehaviorSubject<User>(_mockUser));
    service.recipeService.getRecipeMasterById = jest.fn()
      .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));
    service.processHttpService.configureBackgroundRequest = jest.fn()
      .mockReturnValueOnce(of(_mockBatchOffline))
      .mockReturnValueOnce(of(_mockBatch));
    service.idService.hasDefaultIdType = jest.fn()
      .mockReturnValue(false);
    service.idService.isMissingServerId = jest.fn()
      .mockReturnValue(false);

    const syncRequests: SyncRequests<Batch> = service.generateSyncRequests([_mockBatchOffline$, _mockBatch$]);
    const requests: Observable<HttpErrorResponse | Batch | SyncData<Batch>>[] = syncRequests.syncRequests;
    const errors: SyncError[] = syncRequests.syncErrors;

    expect(requests.length).toEqual(2);
    expect(errors.length).toEqual(0);

    forkJoin(requests)
      .subscribe(
        ([createSync, updateSync]: Batch[]): void => {
          expect(createSync.owner).toMatch(_mockUser._id);
          expect(updateSync).toStrictEqual(_mockBatch);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should generate sync requests (successes)'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should generate sync requests (errors)', (): void => {
    const _mockBatch: Batch = mockBatch();
    _mockBatch._id = null;
    _mockBatch.owner = 'offline';
    _mockBatch.recipeMasterId = Date.now().toString();
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
    const _mockUserNoId: User = mockUser();
    _mockUserNoId._id = null;
    const _mockUserNoId$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUserNoId);
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    const missingId: string = `!${_mockBatch.cid}`;
    service.syncService.getSyncFlagsByType = jest.fn()
      .mockReturnValue([
        mockSyncMetadata('create', missingId, 'batch'),
        mockSyncMetadata('update', _mockBatch.cid, 'batch'),
        mockSyncMetadata('update', _mockBatch.cid, 'batch'),
        mockSyncMetadata('update', _mockBatch.cid, 'batch'),
        mockSyncMetadata('invalid', _mockBatch.cid, 'batch'),
      ]);
    service.recipeService.getRecipeMasterById = jest.fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(_mockRecipeMasterActive$)
      .mockReturnValueOnce(_mockRecipeMasterActive$);
    service.syncService.constructSyncError = jest.fn()
      .mockImplementation((errMsg: string): SyncError => {
        return mockSyncError(errMsg);
      });
    service.userService.getUser = jest.fn()
      .mockReturnValueOnce(_mockUserNoId$)
      .mockReturnValueOnce(_mockUser$)
      .mockReturnValueOnce(_mockUser$)
      .mockReturnValueOnce(_mockUser$);
    service.idService.hasDefaultIdType = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValue(false);
    service.idService.isMissingServerId = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValue(false);

    const syncRequests: SyncRequests<Batch> = service.generateSyncRequests([_mockBatch$]);
    const requests: Observable<HttpErrorResponse | Batch | SyncData<Batch>>[] = syncRequests.syncRequests;
    const errors: SyncError[] = syncRequests.syncErrors;

    expect(requests.length).toEqual(0);
    expect(errors.length).toEqual(5);

    expect(errors[0]['message']).toMatch(`Sync error: Batch with id '${missingId}' not found`);
    expect(errors[1]['message']).toMatch('Error getting user id');
    expect(errors[2]['message']).toMatch('Sync error: Cannot get batch owner\'s id');
    expect(errors[3]['message']).toMatch(`Sync error: batch with id: ${_mockBatch.cid} is missing its server id`);
    expect(errors[4]['message']).toMatch('Sync error: Unknown sync flag method \'invalid\'');
  });

  test('should process sync successes', (): void => {
    const _mockBatch: Batch = mockBatch();
    const _mockBatchUpdate: Batch = mockBatch();
    _mockBatchUpdate.isArchived = !_mockBatch.isArchived;
    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
    const typeSpy: jest.SpyInstance = jest.spyOn(service.processTypeGuardService, 'checkTypeSafety');

    const updatedList: BehaviorSubject<Batch>[] = service.processSyncSuccess(
      [_mockBatchUpdate],
      [_mockBatch$]
    );
    expect(typeSpy).toHaveBeenCalledWith(_mockBatchUpdate);
    expect(updatedList[0].value).toStrictEqual(_mockBatchUpdate);
  });

  test('should get error handling sync success', (): void => {
    const _mockBatch: Batch = mockBatch();

    service.processSyncSuccess([_mockBatch], []);

    expect(service.syncErrors[0]['message']).toMatch(`Sync error: batch with id: '${_mockBatch.cid}' not found`);
  });

  test('should sync on connection (not login)', (done: jest.DoneCallback): void => {
    const _mockSyncResponse: SyncResponse<Batch> = mockSyncResponse<Batch>();
    const preError: SyncError = mockSyncError();
    preError.message = 'pre-error';
    const responseError: SyncError = mockSyncError();
    responseError.message = 'response-error';
    _mockSyncResponse.errors.push(responseError);
    service.userService.isLoggedIn = jest.fn().mockReturnValue(true);
    service.generateSyncRequests = jest.fn()
      .mockReturnValue({ syncRequests: [], syncErrors: [ preError ] });
    service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
    service.processSyncSuccess = jest.fn()
      .mockImplementation((res: any, list: any): any => list);
    service.errorReporter.handleGenericCatchError = jest.fn();
    const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');
    const _mockBatch: Batch = mockBatch();
    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);

    service.syncOnConnection(false, [_mockBatch$])
      .subscribe(
        (batches: BehaviorSubject<Batch>[]): void => {
          expect(batches[0].value).toStrictEqual(_mockBatch);
          expect(processSpy).toHaveBeenCalledWith(_mockSyncResponse.successes, [_mockBatch$]);
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
    const _mockSyncResponse: SyncResponse<Batch> = mockSyncResponse<Batch>();
    service.userService.isLoggedIn = jest.fn().mockReturnValue(true);
    service.generateSyncRequests = jest.fn().mockReturnValue({ syncRequests: [], syncErrors: [] });
    service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
    service.processSyncSuccess = jest.fn();
    service.errorReporter.handleGenericCatchError = jest.fn();
    const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');

    service.syncOnConnection(true, [])
      .subscribe(
        (results: null): void => {
          expect(results).toBeNull();
          expect(processSpy).not.toHaveBeenCalled();
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
        (results: null): void => {
          expect(results).toBeNull();
          expect(genSpy).not.toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should not sync on reconnect if not logged in'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should sync on signup', (done: jest.DoneCallback): void => {
    const _mockBatch: Batch = mockBatch();
    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
    const _mockBatchList: BehaviorSubject<Batch>[] = [_mockBatch$];
    const _mockSyncResponse: SyncResponse<Batch> = mockSyncResponse<Batch>();
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    service.recipeService.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
    service.userService.getUser = jest.fn().mockReturnValue(_mockUser$);
    service.processHttpService.configureBackgroundRequest = jest.fn().mockReturnValue(of(_mockBatch));
    service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
    service.processSyncSuccess = jest.fn().mockReturnValue(_mockBatchList);
    service.idService.isMissingServerId = jest.fn().mockReturnValue(false);
    const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');

    service.syncOnSignup(_mockBatchList)
      .subscribe(
        (batchList: BehaviorSubject<Batch>[]): void => {
          expect(batchList).toStrictEqual(_mockBatchList);
          expect(processSpy).toHaveBeenCalledWith(_mockSyncResponse.successes, batchList);
          done();
        },
        (error: any): void => {
          console.log('Error in: should sync on signup', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should handle sync error on syncing on signup', (done: jest.DoneCallback): void => {
    const _mockBatch: Batch = mockBatch();
    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
    const _mockBatchList: BehaviorSubject<Batch>[] = [_mockBatch$, _mockBatch$];
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
    const _mockSyncResponse: SyncResponse<Batch> = mockSyncResponse<Batch>();

    service.recipeService.getRecipeMasterById = jest.fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(_mockRecipeMasterActive$);
    service.userService.getUser = jest.fn().mockReturnValue(undefined);
    service.syncService.sync = jest.fn()
      .mockImplementation(
        (type: string, requests: Observable<HttpErrorResponse | Batch>[]): Observable<SyncResponse<HttpErrorResponse | Batch>> => {
          const testableRequests: Observable<any>[] = requests
            .map((obs: Observable<any>): Observable<any> => {
              return obs.pipe(catchError((error: any): any => of(error)));
            });
          return forkJoin(testableRequests)
            .pipe(map((expected: any[]): SyncResponse<HttpErrorResponse | Batch> => {
              expect(expected[0].message).toMatch(`Recipe with id ${_mockBatch.recipeMasterId} not found`);
              expect(expected[1].message).toMatch('User server id not found');
              return _mockSyncResponse;
            }));
        }
      );
    service.idService.isMissingServerId = jest.fn().mockReturnValue(false);

    service.syncOnSignup(_mockBatchList)
      .subscribe(
        (): void => {
          done();
        },
        (error: any): void => {
          console.log('Error in: should handle sync error on syncing on signup', error);
          expect(true).toBe(false);
        }
      );
  });

});
