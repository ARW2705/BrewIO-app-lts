/* Module imports */
import { HttpErrorResponse } from '@angular/common/http';
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { BehaviorSubject, forkJoin, Observable, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockRecipeMasterActive, mockSyncError, mockSyncMetadata, mockSyncResponse, mockUser } from '@test/mock-models';
import { ErrorReportingServiceStub, IdServiceStub, RecipeHttpServiceStub, RecipeTypeGuardServiceStub, SyncServiceStub, UserServiceStub } from '@test/service-stubs';

/* Interface imports */
import { RecipeMaster, SyncData, SyncError, SyncRequests, SyncResponse, User } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ErrorReportingService, IdService, SyncService, UserService } from '@services/public';
import { RecipeHttpService } from '@services/recipe/http/recipe-http.service';
import { RecipeTypeGuardService } from '@services/recipe/type-guard/recipe-type-guard.service';
import { RecipeSyncService } from './recipe-sync.service';


describe('RecipeSyncService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: RecipeSyncService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        RecipeSyncService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: RecipeHttpService, useClass: RecipeHttpServiceStub },
        { provide: RecipeTypeGuardService, useClass: RecipeTypeGuardServiceStub },
        { provide: SyncService, useClass: SyncServiceStub },
        { provide: UserService, useClass: UserServiceStub }
      ]
    });
    injector = getTestBed();
    service = injector.get(RecipeSyncService);
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(RecipeSyncService);
    service.recipeTypeGuardService.checkTypeSafety = jest.fn();
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should add a sync flag', (): void => {
    service.syncService.addSyncFlag = jest.fn();
    const syncSpy: jest.SpyInstance = jest.spyOn(service.syncService, 'addSyncFlag');

    service.addSyncFlag('method', 'docId');

    expect(syncSpy).toHaveBeenCalledWith({
      method: 'method',
      docId: 'docId',
      docType: 'recipe'
    });
  });

  test('should convert a request method to a sync method', (): void => {
    service.syncService.convertRequestMethodToSyncMethod = jest.fn().mockReturnValue('create');
    const convertSpy: jest.SpyInstance = jest.spyOn(service.syncService, 'convertRequestMethodToSyncMethod');

    expect(service.convertRequestMethodToSyncMethod('post')).toMatch('create');
    expect(convertSpy).toHaveBeenCalledWith('post');
  });

  test('should dismiss sync errors', (): void => {
    const _mockSyncError: SyncError = mockSyncError();
    service.syncErrors = [ _mockSyncError ];

    service.dismissAllSyncErrors();

    expect(service.syncErrors.length).toEqual(0);
  });

  test('should dismiss sync errors', (): void => {
    const _mockSyncError1: SyncError = mockSyncError();
    const _mockSyncError2: SyncError = mockSyncError();
    _mockSyncError2.message = 'error 2';
    const _mockSyncError3: SyncError = mockSyncError();
    _mockSyncError3.message = 'error 3';
    service.syncErrors = [ _mockSyncError1, _mockSyncError2, _mockSyncError3 ];

    service.dismissSyncError(1);

    expect(service.syncErrors.length).toEqual(2);
    expect(service.syncErrors[1]).toStrictEqual(_mockSyncError3);
  });

  test('should generate sync requests (successes)', (done: jest.DoneCallback): void => {
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
    const list: BehaviorSubject<RecipeMaster>[] = [ _mockRecipeMasterActive$ ];
    service.syncService.getSyncFlagsByType = jest.fn()
      .mockReturnValue([
        mockSyncMetadata('delete', _mockRecipeMasterActive.cid, 'recipe'),
        mockSyncMetadata('create', _mockRecipeMasterActive.cid, 'recipe'),
        mockSyncMetadata('update', _mockRecipeMasterActive.cid, 'recipe'),
      ]);
    service.idService.hasId = jest.fn().mockReturnValue(true);
    service.idService.hasDefaultIdType = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValue(false);
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    service.userService.getUser = jest.fn().mockReturnValue(_mockUser$);
    service.recipeHttpService.configureBackgroundRequest = jest.fn()
      .mockReturnValue(of(_mockRecipeMasterActive));
    const reqSpy: jest.SpyInstance = jest.spyOn(service.recipeHttpService, 'configureBackgroundRequest');
    service.idService.isMissingServerId = jest.fn().mockReturnValue(false);

    const syncRequests: SyncRequests<RecipeMaster> = service.generateSyncRequests(list);
    const requests: Observable<HttpErrorResponse | RecipeMaster | SyncData<RecipeMaster>>[] = syncRequests.syncRequests;
    const errors: SyncError[] = syncRequests.syncErrors;

    expect(requests.length).toEqual(3);
    expect(errors.length).toEqual(0);

    forkJoin(requests)
      .subscribe(
        (): void => {
          expect(reqSpy).toHaveBeenNthCalledWith(1, 'delete', true, null, _mockRecipeMasterActive.cid);
          expect(reqSpy).toHaveBeenNthCalledWith(2, 'post', true, _mockRecipeMasterActive);
          expect(reqSpy).toHaveBeenNthCalledWith(3, 'patch', true, _mockRecipeMasterActive);
          done();
        },
        (error: Error): void => {
          console.log('Error in: should generate sync requests (successes)', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should generate sync requests (errors)', (): void => {
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
    const list: BehaviorSubject<RecipeMaster>[] = [ _mockRecipeMasterActive$ ];
    service.syncService.getSyncFlagsByType = jest.fn()
      .mockReturnValue([
        mockSyncMetadata('create', `${_mockRecipeMasterActive.cid}test`, 'recipe'),
        mockSyncMetadata('create', _mockRecipeMasterActive.cid, 'recipe'),
        mockSyncMetadata('update', _mockRecipeMasterActive.cid, 'recipe'),
        mockSyncMetadata('invalid', 'test-id', 'recipe')
      ]);
    service.idService.hasId = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValue(true);
    service.syncService.constructSyncError = jest.fn()
      .mockImplementation((message: string): SyncError => {
        return { message, errCode: 1 };
      });
    service.idService.hasDefaultIdType = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.userService.getUser = jest.fn().mockReturnValue(undefined);
    service.idService.isMissingServerId = jest.fn().mockReturnValue(true);

    const syncRequests: SyncRequests<RecipeMaster> = service.generateSyncRequests(list);
    const requests: Observable<HttpErrorResponse | RecipeMaster | SyncData<RecipeMaster>>[] = syncRequests.syncRequests;
    const errors: SyncError[] = syncRequests.syncErrors;

    expect(requests.length).toEqual(0);
    expect(errors.length).toEqual(4);

    expect(errors[0].message).toMatch(`Sync error: Recipe with id ${_mockRecipeMasterActive.cid}test not found`);
    expect(errors[1].message).toMatch('Sync error: Cannot get recipe owner\'s id');
    expect(errors[2].message).toMatch(`Sync error: Recipe with id ${_mockRecipeMasterActive.cid} is missing a server id`);
    expect(errors[3].message).toMatch(`Sync error: Unknown sync flag method \'invalid\'`);
  });

  test('should process sync successes', (): void => {
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
    const recipeList: BehaviorSubject<RecipeMaster>[] = [
      _mockRecipeMasterActive$
    ];
    const _mockRecipeUpdate: RecipeMaster = mockRecipeMasterActive();
    _mockRecipeUpdate.name = 'update name';
    const _mockRecipeMissing: RecipeMaster = mockRecipeMasterActive();
    const syncList: (RecipeMaster | SyncData<RecipeMaster>)[] = [
      _mockRecipeUpdate,
      { isDeleted: true, data: null },
      _mockRecipeMissing
    ];
    service.idService.hasId = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const updatedList: BehaviorSubject<RecipeMaster>[] = service.processSyncSuccess(syncList, recipeList);
    expect(updatedList[0].value.name).toMatch('update name');
    expect(service.syncErrors[0].message).toMatch(`Sync error: recipe with id ${_mockRecipeMissing.cid} not found`);
  });

  test('should sync on connection (not login)', (done: jest.DoneCallback): void => {
    const _mockSyncResponse: SyncResponse<RecipeMaster> = mockSyncResponse<RecipeMaster>();
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
    service.errorReporter.handleGenericCatchError = jest.fn();
    const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');

    service.syncOnConnection(false, [])
      .subscribe(
        (): void => {
          expect(processSpy).toHaveBeenCalled();
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
    const _mockSyncResponse: SyncResponse<RecipeMaster> = mockSyncResponse<RecipeMaster>();
    service.userService.isLoggedIn = jest.fn().mockReturnValue(true);
    service.generateSyncRequests = jest.fn()
      .mockReturnValue({ syncRequests: [], syncErrors: [] });
    service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
    service.processSyncSuccess = jest.fn();
    service.errorReporter.handleGenericCatchError = jest.fn();
    const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');

    service.syncOnConnection(true, [])
      .subscribe(
        (): void => {
          expect(processSpy).not.toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should perform sync on connection (on login)'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should not sync on connection if not logged in', (done: jest.DoneCallback): void => {
    service.userService.isLoggedIn = jest.fn().mockReturnValue(false);
    const genSpy: jest.SpyInstance = jest.spyOn(service, 'generateSyncRequests');

    service.syncOnConnection(false, [])
      .subscribe(
        (): void => {
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
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
    const _mockSyncResponse: SyncResponse<RecipeMaster> = mockSyncResponse<RecipeMaster>();
    const _mockRecipeMasterResponse: RecipeMaster = mockRecipeMasterActive();
    _mockRecipeMasterResponse.cid += '1';
    _mockSyncResponse.successes = [_mockRecipeMasterActive];
    _mockSyncResponse.errors = [{ message: 'test-error', errCode: 1 }];
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    service.userService.getUser = jest.fn().mockReturnValue(_mockUser$);
    service.recipeHttpService.configureBackgroundRequest = jest.fn().mockReturnValue(of(null));
    service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
    service.processSyncSuccess = jest.fn().mockReturnValue([_mockRecipeMasterActive$]);
    service.errorReporter.handleGenericCatchError = jest.fn();
    const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');

    service.syncOnSignup([_mockRecipeMasterActive$])
      .subscribe(
        (recipeList: BehaviorSubject<RecipeMaster>[]): void => {
          expect(recipeList.length).toEqual(1);
          expect(recipeList[0].value).toStrictEqual(_mockRecipeMasterActive);
          expect(processSpy).toHaveBeenCalledWith(
            [_mockRecipeMasterActive],
            [_mockRecipeMasterActive$]
          );
          done();
        },
        (error: Error): void => {
          console.log('Error in: should sync on signup', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get error syncing on signup', (done: jest.DoneCallback): void => {
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
    service.userService.getUser = jest.fn().mockReturnValue(undefined);
    const _mockSyncResponse: SyncResponse<RecipeMaster> = mockSyncResponse<RecipeMaster>();
    service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
    const syncSpy: jest.SpyInstance = jest.spyOn(service.syncService, 'sync');
    service.errorReporter.handleGenericCatchError = jest.fn();

    service.syncOnSignup([_mockRecipeMasterActive$])
      .subscribe(
        (): void => {
          syncSpy.mock.calls[0][1][0]
            .subscribe(
              (results: any): void => {
                console.log('should not get results', results);
                expect(true).toBe(false);
              },
              (error: CustomError): void => {
                expect(error.name).toMatch('SyncError');
                expect(error.message).toMatch('Sync error: Cannot find recipe owner\'s id');
                expect(error.severity).toEqual(2);
                done();
              }
            );
        },
        (error: Error): void => {
          console.log('Error in: should sync on signup', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should catch an error response during sync on signup', (done: jest.DoneCallback): void => {
    service.userService.getUser = jest.fn().mockReturnValue(undefined);
    const _mockError: Error = new Error('test-error');
    service.syncService.sync = jest.fn().mockReturnValue(throwError(_mockError));
    service.errorReporter.handleGenericCatchError = jest.fn().mockReturnValue(
      (error: Error): Observable<never> => {
        expect(error).toStrictEqual(_mockError);
        return throwError(null);
      }
    );
    const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleGenericCatchError');

    service.syncOnSignup([])
      .subscribe(
        (results: any): void => {
          console.log('should not get results', results);
          expect(true).toBe(false);
        },
        (error: Error): void => {
          expect(error).toBeNull();
          expect(errorSpy).toHaveBeenCalled();
          done();
        }
      );
  });

});
