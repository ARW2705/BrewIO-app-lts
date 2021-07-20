/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, forkJoin, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/* TestBed configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import {
  mockAlert,
  mockBatch,
  mockGeneratedBatch,
  mockSyncError,
  mockSyncMetadata,
  mockSyncResponse,
  mockRecipeMasterActive,
  mockPrimaryValues,
  mockProcessSchedule,
  mockErrorResponse,
  mockUser
} from '../../../../test-config/mock-models';
import {
  CalculationsServiceStub,
  ClientIdServiceStub,
  ConnectionServiceStub,
  ErrorReportingServiceStub,
  EventServiceStub,
  HttpErrorServiceStub,
  LibraryServiceStub,
  RecipeServiceStub,
  StorageServiceStub,
  SyncServiceStub,
  ToastServiceStub,
  UserServiceStub,
  TypeGuardServiceStub
} from '../../../../test-config/service-stubs';

/* Constants imports */
import { API_VERSION, BASE_URL } from '../../shared/constants';

/* Interface imports */
import {
  Alert,
  Batch,
  BatchAnnotations,
  BatchContext,
  BatchProcess,
  CalendarProcess,
  PrimaryValues,
  Process,
  RecipeMaster,
  SyncData,
  SyncError,
  SyncRequests,
  SyncResponse,
  TimerProcess,
  User
} from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Type guard imports */
import {
  AlertGuardMetadata,
  BatchGuardMetadata,
  BatchContextGuardMetadata,
  BatchAnnotationsGuardMetadata,
  BatchProcessGuardMetadata,
  PrimaryValuesGuardMetadata
} from '../../shared/type-guard-metadata';

/* Service imports */
import { ProcessService } from './process.service';
import { CalculationsService } from '../calculations/calculations.service';
import { ClientIdService } from '../client-id/client-id.service';
import { ConnectionService } from '../connection/connection.service';
import { ErrorReportingService } from '../error-reporting/error-reporting.service';
import { EventService } from '../event/event.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { LibraryService } from '../library/library.service';
import { RecipeService } from '../recipe/recipe.service';
import { StorageService } from '../storage/storage.service';
import { SyncService } from '../sync/sync.service';
import { ToastService } from '../toast/toast.service';
import { UserService } from '../user/user.service';
import { TypeGuardService } from '../type-guard/type-guard.service';


describe('ProcessService', (): void => {
  let injector: TestBed;
  let processService: ProcessService;
  let httpMock: HttpTestingController;
  let originalRegister: any;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        ProcessService,
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: ClientIdService, useClass: ClientIdServiceStub },
        { provide: ConnectionService, useClass: ConnectionServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: EventService, useClass: EventServiceStub },
        { provide: HttpErrorService, useClass: HttpErrorServiceStub },
        { provide: LibraryService, useClass: LibraryServiceStub },
        { provide: RecipeService, useClass: RecipeServiceStub },
        { provide: StorageService, useClass: StorageServiceStub },
        { provide: SyncService, useClass: SyncServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UserService, useClass: UserServiceStub },
        { provide: TypeGuardService, useClass: TypeGuardServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    processService = injector.get(ProcessService);
    originalRegister = processService.registerEvents;
    processService.registerEvents = jest
      .fn();
    httpMock = injector.get(HttpTestingController);
    processService.errorReporter.handleUnhandledError = jest
      .fn();
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    expect(processService).toBeDefined();
  });

  describe('Initializations', (): void => {

    test('should init batches from storage', (done: jest.DoneCallback): void => {
      processService.syncOnConnection = jest
        .fn()
        .mockReturnValue(of(true));

      processService.mapBatchArrayToSubjectArray = jest
        .fn();

      processService.updateBatchStorage = jest
        .fn();

      processService.event.emit = jest
        .fn();

      processService.errorReporter.handleGenericCatchError = jest
        .fn();

      const emitSpy: jest.SpyInstance = jest.spyOn(processService.event, 'emit');
      const updateSpy: jest.SpyInstance = jest.spyOn(processService, 'updateBatchStorage');

      processService.initFromServer();

      setTimeout((): void => {
        expect(emitSpy).toHaveBeenCalledWith('init-inventory');
        expect(updateSpy).toHaveBeenCalledTimes(2);
        done();
      }, 10);

      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/process/batch`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush({ activeBatches: [], archiveBatches: [] });
    });

    test('should get an error trying to init from server', (done: jest.DoneCallback): void => {
      const _mockHttpErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found', `${BASE_URL}/${API_VERSION}/process/batch`);

      processService.syncOnConnection = jest
        .fn()
        .mockReturnValue(of(true));

      processService.errorReporter.handleGenericCatchError = jest
        .fn()
        .mockImplementation((): (error: HttpErrorResponse) => Observable<never> => {
          return (error: HttpErrorResponse): Observable<never> => {
            expect(error).toStrictEqual(_mockHttpErrorResponse);
            return throwError(null);
          };
        });

      processService.errorReporter.handleUnhandledError = jest
        .fn();

      const emitSpy: jest.SpyInstance = jest.spyOn(processService.event, 'emit');
      const errorSpy: jest.SpyInstance = jest.spyOn(processService.errorReporter, 'handleUnhandledError');

      processService.initFromServer();

      setTimeout((): void => {
        expect(emitSpy).toHaveBeenCalledWith('init-inventory');
        expect(errorSpy).toHaveBeenCalledWith(null);
        done();
      }, 10);

      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/process/batch`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, _mockHttpErrorResponse);
    });

    test('should init batches from storage', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processService.storageService.getBatches = jest
        .fn()
        .mockReturnValueOnce(of([_mockBatch, _mockBatch]))
        .mockReturnValueOnce(of([_mockBatch]));

      processService.mapBatchArrayToSubjectArray = jest
        .fn();

      const mapSpy: jest.SpyInstance = jest.spyOn(processService, 'mapBatchArrayToSubjectArray');

      processService.initFromStorage();

      setTimeout((): void => {
        expect(mapSpy.mock.calls[0][0]).toBe(true);
        expect(mapSpy.mock.calls[1][0]).toBe(false);
        done();
      }, 10);
    });

    test('should get errors on init batches from storage', (done: jest.DoneCallback): void => {
      const _mockErrorActive: Error = new Error('test-error-active');
      const _mockErrorArchive: Error = new Error('test-error-archive');

      processService.storageService.getBatches = jest
        .fn()
        .mockReturnValueOnce(throwError(_mockErrorActive))
        .mockReturnValueOnce(throwError(_mockErrorArchive));

      processService.errorReporter.handleUnhandledError = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(processService.errorReporter, 'handleUnhandledError');

      processService.initFromStorage();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenNthCalledWith(1, _mockErrorActive);
        expect(errorSpy).toHaveBeenNthCalledWith(2, _mockErrorArchive);
        done();
      }, 10);
    });

    test('should initialize the batch lists', (): void => {
      processService.initFromStorage = jest
        .fn();

      processService.initFromServer = jest
        .fn();

      processService.canSendRequest = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.event.emit = jest
        .fn();

      const initSpy: jest.SpyInstance = jest.spyOn(processService, 'initFromServer');
      const emitSpy: jest.SpyInstance = jest.spyOn(processService.event, 'emit');

      processService.initializeBatchLists();

      expect(initSpy).toHaveBeenCalled();

      processService.initializeBatchLists();

      expect(emitSpy).toHaveBeenCalledWith('init-inventory');
    });

    test('should register events', (): void => {
      const mockSubjects: Subject<object>[] = Array.from(Array(4), () => new Subject<object>());

      let counter = 0;
      processService.event.register = jest
        .fn()
        .mockImplementation(() => mockSubjects[counter++]);

      processService.initializeBatchLists = jest
        .fn();

      processService.clearAllBatchLists = jest
        .fn();

      processService.syncOnSignup = jest
        .fn();

      processService.syncOnReconnect = jest
        .fn();

      const spies: jest.SpyInstance[] = [
        jest.spyOn(processService, 'initializeBatchLists'),
        jest.spyOn(processService, 'clearAllBatchLists'),
        jest.spyOn(processService, 'syncOnSignup'),
        jest.spyOn(processService, 'syncOnReconnect')
      ];

      const eventSpy: jest.SpyInstance = jest.spyOn(processService.event, 'register');

      processService.registerEvents = originalRegister;

      processService.registerEvents();

      const calls: any[] = eventSpy.mock.calls;
      expect(calls[0][0]).toMatch('init-batches');
      expect(calls[1][0]).toMatch('clear-data');
      expect(calls[2][0]).toMatch('sync-batches-on-signup');
      expect(calls[3][0]).toMatch('connected');

      mockSubjects.forEach((mockSubject: Subject<object>, index: number): void => {
        mockSubject.next({});
        expect(spies[index]).toHaveBeenCalled();
        mockSubject.complete();
      });
    });

  });


  describe('API Methods', (): void => {

    test('should end a batch by id', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<Batch>(_mockBatch));

      processService.updateBatch = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      processService.archiveActiveBatch = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      processService.errorReporter.handleGenericCatchError = jest
        .fn();

      const updateSpy: jest.SpyInstance = jest.spyOn(processService, 'updateBatch');
      const archiveSpy: jest.SpyInstance = jest.spyOn(processService, 'archiveActiveBatch');

      processService.endBatchById(_mockBatch.cid)
        .subscribe(
          (): void => {
            expect(updateSpy).toHaveBeenCalledWith(_mockBatch);
            expect(archiveSpy).toHaveBeenCalledWith(_mockBatch.cid);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should end a batch by id'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should throw an error ending a batch if batch is not found', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      processService.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      processService.endBatchById('test-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

    test('should start a new batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processService.generateBatchFromRecipe = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      processService.canSendRequest = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.requestInBackground = jest
        .fn();

      processService.addSyncFlag = jest
        .fn();

      processService.addBatchToActiveList = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      processService.errorReporter.handleGenericCatchError = jest
        .fn();

      const requestSpy: jest.SpyInstance = jest.spyOn(processService, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(processService, 'addSyncFlag');

      processService.startNewBatch('user-id', 'rm-id', 'rv-id')
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should start a new batch'`, error);
            expect(true).toBe(false);
          }
        );

      processService.startNewBatch('user-id', 'rm-id', 'rv-id')
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should start a new batch'`, error);
            expect(true).toBe(false);
          }
        );

      setTimeout((): void => {
        expect(requestSpy).toHaveBeenCalledWith('post', _mockBatch);
        expect(syncSpy).toHaveBeenCalledWith('create', _mockBatch.cid);
        done();
      }, 10);
    });

    test('should get an error starting a new batch if generated batch is undefined', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      processService.generateBatchFromRecipe = jest
        .fn()
        .mockReturnValue(of(undefined));

      processService.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      processService.errorReporter.handleGenericCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error).toStrictEqual(_mockError);
            return throwError(null);
          };
        });

      processService.startNewBatch('user-id', 'rm-id', 'rv-id')
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

    test('should update a batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<Batch>(_mockBatch));

      processService.emitBatchListUpdate = jest
        .fn();

      processService.updateBatchStorage = jest
        .fn();

      processService.canSendRequest = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.requestInBackground = jest
        .fn();

      processService.addSyncFlag = jest
        .fn();

      processService.checkTypeSafety = jest
        .fn();

      const requestSpy: jest.SpyInstance = jest.spyOn(processService, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(processService, 'addSyncFlag');

      processService.updateBatch(_mockBatch)
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should update a batch'`, error);
            expect(true).toBe(false);
          }
        );

      processService.updateBatch(_mockBatch)
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should update a batch'`, error);
            expect(true).toBe(false);
          }
        );

      setTimeout((): void => {
        expect(requestSpy).toHaveBeenCalledWith('patch', _mockBatch);
        expect(syncSpy).toHaveBeenCalledWith('update', _mockBatch._id);
        done();
      }, 10);
    });

    test('should throw an error updating batch', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      const _mockBatch: Batch = mockBatch();

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      processService.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      processService.updateBatch(_mockBatch)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

    test('should update measured values', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockPrimaryValues: PrimaryValues = mockPrimaryValues();

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<Batch>(_mockBatch));

      processService.calculationService.getABV = jest
        .fn()
        .mockReturnValue(6);

      processService.calculationService.calculateTotalIBU = jest
        .fn()
        .mockReturnValue(25);

      processService.calculationService.calculateTotalSRM = jest
        .fn()
        .mockReturnValue(15);

      processService.updateBatch = jest
        .fn()
        .mockImplementation((batch: Batch): Observable<Batch> => {
          return of(batch);
        });

      processService.updateMeasuredValues(_mockBatch.cid, _mockPrimaryValues, true)
        .subscribe(
          (batch: Batch): void => {
            const measured: PrimaryValues = batch.annotations.measuredValues;
            expect(measured.ABV).toEqual(6);
            expect(measured.IBU).toEqual(25);
            expect(measured.SRM).toEqual(15);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should update measured values'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error updating measured values', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      processService.getBatchById = jest
        .fn()
        .mockImplementation(() => {
          throw _mockError;
        });

      processService.errorReporter.handleGenericCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error).toStrictEqual(_mockError);
            return throwError(null);
          };
        });

      processService.updateMeasuredValues(null, null, false)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error).toBeNull();
            done();
          }
        );
    });

    test('should update a step by id', (done: jest.DoneCallback): void => {
      const _mockAlert: Alert = mockAlert();
      const _mockBatch: Batch = mockBatch();
      const now: string = (new Date()).toISOString();
      const _mockUpdate: object = {
        id: _mockBatch.process.schedule[1].cid,
        update: {
          alerts: [_mockAlert],
          startDatetime: now
        }
      };

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<Batch>(_mockBatch));

      processService.updateBatch = jest
        .fn()
        .mockImplementation((batch: Batch): Observable<Batch> => {
          return of(batch);
        });

      processService.updateStepById(_mockBatch.cid, _mockUpdate)
        .subscribe(
          (batch: Batch): void => {
            expect(batch.process.alerts[0]).toStrictEqual(_mockAlert);
            expect((<CalendarProcess>batch.process.schedule[1]).startDatetime).toMatch(now);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should update a step by id'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get error trying to update step with missing batch', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      processService.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      processService.updateStepById('error-id', {})
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

    test('should get error trying to update step with missing batch owner', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      const _mockBatch: Batch = mockBatch();
      _mockBatch.owner = null;

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<Batch>(_mockBatch));

      processService.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      processService.updateStepById('error-id', {})
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

    test('should get error trying to update step with missing batch', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      const _mockBatch: Batch = mockBatch();

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<Batch>(_mockBatch));

      processService.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      processService.updateStepById('error-id', {})
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

    test('should get error trying to update step with missing batch', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      const _mockBatch: Batch = mockBatch();

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<Batch>(_mockBatch));

      processService.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      processService.updateStepById('error-id', { id: 'error-id', })
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error).toStrictEqual(_mockError);
            // expect(error).toMatch('Active batch missing step with id error-id');
            done();
          }
        );
    });

  });


  describe('Background Server Updates', (): void => {

    test('should configure a background request', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processService.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      processService.errorReporter.handleResolvableCatchError = jest
        .fn();

      const getSpy: jest.SpyInstance = jest.spyOn(processService, 'getBackgroundRequest');

      processService.configureBackgroundRequest('post', false, _mockBatch)
        .subscribe(
          (): void => {
            expect(getSpy).toHaveBeenCalledWith('post', _mockBatch);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should configure a background request'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error response from background request', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      processService.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      processService.errorReporter.handleResolvableCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error).toStrictEqual(_mockError);
            return throwError(null);
          };
        });

      processService.configureBackgroundRequest('post', false, null)
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

    test('should resolve an error response from background request', (done: jest.DoneCallback): void => {
      const _mockHttpErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');

      processService.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(throwError(_mockHttpErrorResponse));

      processService.errorReporter.handleResolvableCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<any> => {
          return (error: Error): Observable<any> => {
            expect(error).toStrictEqual(_mockHttpErrorResponse);
            return of(error);
          };
        });

      const errorSpy: jest.SpyInstance = jest.spyOn(processService.errorReporter, 'handleResolvableCatchError');

      processService.configureBackgroundRequest('post', true, null)
        .subscribe(
          (resolvedError: HttpErrorResponse): void => {
            expect(errorSpy).toHaveBeenCalledWith(true);
            expect(resolvedError).toStrictEqual(_mockHttpErrorResponse);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should resolve an error response from background request'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get a background post request', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processService.getBackgroundRequest('post', _mockBatch)
        .subscribe(
          (): void => {
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get a background post request'`, error);
            expect(true).toBe(false);
          }
        );

      const postReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/process/user/${_mockBatch.owner}/master/${_mockBatch.recipeMasterId}/variant/${_mockBatch.recipeVariantId}`);
      expect(postReq.request.method).toMatch('POST');
      postReq.flush(_mockBatch);
    });

    test('should get a background patch request', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processService.getBackgroundRequest('patch', _mockBatch)
        .subscribe(
          (): void => {
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get a background patch request'`, error);
            expect(true).toBe(false);
          }
        );

      const patchReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/process/batch/${_mockBatch._id}`);
      expect(patchReq.request.method).toMatch('PATCH');
      patchReq.flush(_mockBatch);
    });

    test('should get an error getting a background request', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processService.getBackgroundRequest('invalid', _mockBatch)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch('Invalid http method');
            done();
          }
        );

      httpMock.expectNone(`${BASE_URL}/${API_VERSION}/process/user/${_mockBatch.owner}/master/${_mockBatch.recipeMasterId}/variant/${_mockBatch.recipeVariantId}`);
      httpMock.expectNone(`${BASE_URL}/${API_VERSION}/process/batch/${_mockBatch._id}`);
    });

    test('should perform a background request', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processService.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<Batch>(_mockBatch));

      processService.emitBatchListUpdate = jest
        .fn();

      processService.updateBatchStorage = jest
        .fn();

      processService.errorReporter.handleGenericCatchError = jest
        .fn();

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const emitSpy: jest.SpyInstance = jest.spyOn(processService, 'emitBatchListUpdate');
      const updateSpy: jest.SpyInstance = jest.spyOn(processService, 'updateBatchStorage');

      processService.requestInBackground('post', _mockBatch);

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Batch: background post request successful');
        expect(emitSpy).toHaveBeenCalledTimes(2);
        expect(updateSpy).toHaveBeenCalledTimes(2);
        done();
      }, 10);
    });

    test('should get an error for an invalid request method', (done: jest.DoneCallback): void => {
      processService.errorReporter.handleGenericCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error.message).toMatch('Unknown sync type: invalid');
            return throwError(null);
          };
        });

      processService.errorReporter.handleUnhandledError = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(processService.errorReporter, 'handleUnhandledError');

      processService.requestInBackground('invalid', null);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(null);
        done();
      }, 10);
    });

    test('should get an error updating client batch after successful response', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockError: Error = new Error('test-error');

      processService.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      processService.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      processService.errorReporter.handleGenericCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error).toStrictEqual(_mockError);
            return throwError(null);
          };
        });

      processService.errorReporter.handleUnhandledError = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(processService.errorReporter, 'handleUnhandledError');

      processService.requestInBackground('post', _mockBatch);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(null);
        done();
      }, 10);
    });

  });


  describe('Sync Methods', (): void => {

    test('should add a sync flag', (): void => {
      processService.syncService.addSyncFlag = jest
        .fn();

      const syncSpy: jest.SpyInstance = jest.spyOn(processService.syncService, 'addSyncFlag');

      processService.addSyncFlag('create', '012345');

      expect(syncSpy).toHaveBeenCalledWith({
        method: 'create',
        docId: '012345',
        docType: 'batch'
      });
    });

    test('should dismiss all sync errors', (): void => {
      processService.syncErrors = [ mockSyncError() ];

      processService.dismissAllSyncErrors();

      expect(processService.syncErrors.length).toEqual(0);
    });

    test('should dismiss a sync error by index', (): void => {
      const _mockSyncError1: SyncError = mockSyncError();
      _mockSyncError1.errCode++;
      const _mockSyncError2: SyncError = mockSyncError();

      processService.syncErrors = [ _mockSyncError1, _mockSyncError2 ];

      processService.dismissSyncError(0);

      expect(processService.syncErrors[0]).toStrictEqual(_mockSyncError2);
    });

    test('should generate sync requests (successes)', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockBatchOffline: Batch = mockBatch();
      _mockBatchOffline.owner = 'offline';
      _mockBatchOffline.recipeMasterId = _mockRecipeMasterActive.cid;
      const _mockBatch: Batch = mockBatch();
      const _mockUser: User = mockUser();

      processService.syncService.getSyncFlagsByType = jest
        .fn()
        .mockReturnValue([
          mockSyncMetadata('create', _mockBatchOffline.cid, 'batch'),
          mockSyncMetadata('update', _mockBatch.cid, 'batch')
        ]);

      processService.getBatchById = jest
        .fn()
        .mockReturnValueOnce(new BehaviorSubject<Batch>(_mockBatchOffline))
        .mockReturnValueOnce(new BehaviorSubject<Batch>(_mockBatch));

      processService.userService.getUser = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<User>(_mockUser));

      processService.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));

      processService.configureBackgroundRequest = jest
        .fn()
        .mockReturnValueOnce(of(_mockBatchOffline))
        .mockReturnValueOnce(of(_mockBatch));

      const syncRequests: SyncRequests<Batch> = processService.generateSyncRequests();
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

      processService.syncService.getSyncFlagsByType = jest
        .fn()
        .mockReturnValue([
          mockSyncMetadata('create', _mockBatch.cid, 'batch'),
          mockSyncMetadata('update', _mockBatch.cid, 'batch'),
          mockSyncMetadata('update', _mockBatch.cid, 'batch'),
          mockSyncMetadata('update', _mockBatch.cid, 'batch'),
          mockSyncMetadata('invalid', _mockBatch.cid, 'batch'),
        ]);

      processService.getBatchById = jest
        .fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(_mockBatch$)
        .mockReturnValueOnce(_mockBatch$)
        .mockReturnValueOnce(_mockBatch$)
        .mockReturnValueOnce(_mockBatch$);

      processService.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(_mockRecipeMasterActive$)
        .mockReturnValueOnce(_mockRecipeMasterActive$);

      processService.syncService.constructSyncError = jest
        .fn()
        .mockImplementation((errMsg: string): SyncError => {
          return mockSyncError(errMsg);
        });

      processService.userService.getUser = jest
        .fn()
        .mockReturnValueOnce(_mockUserNoId$)
        .mockReturnValueOnce(_mockUser$)
        .mockReturnValueOnce(_mockUser$)
        .mockReturnValueOnce(_mockUser$);

      const syncRequests: SyncRequests<Batch> = processService.generateSyncRequests();
      const requests: Observable<HttpErrorResponse | Batch | SyncData<Batch>>[] = syncRequests.syncRequests;
      const errors: SyncError[] = syncRequests.syncErrors;

      expect(requests.length).toEqual(0);
      expect(errors.length).toEqual(5);

      expect(errors[0]['message']).toMatch(`Sync error: Batch with id '${_mockBatch.cid}' not found`);
      expect(errors[1]['message']).toMatch('Error getting user id');
      expect(errors[2]['message']).toMatch('Sync error: Cannot get batch owner\'s id');
      expect(errors[3]['message']).toMatch(`Sync error: batch with id: ${_mockBatch.cid} is missing its server id`);
      expect(errors[4]['message']).toMatch('Sync error: Unknown sync flag method \'invalid\'');
    });

    test('should process sync successes', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatchUpdate: Batch = mockBatch();
      _mockBatchUpdate.cid = 'updated';

      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(_mockBatch$);

      processService.emitBatchListUpdate = jest
        .fn();

      processService.checkTypeSafety = jest
        .fn();

      const syncData: (Batch | SyncData<Batch>)[] = [
        _mockBatchUpdate,
        { isDeleted: true, data: null }
      ];

      processService.processSyncSuccess(syncData);

      expect(_mockBatch$.value.cid).toMatch('updated');
    });

    test('should get error handling sync success', (): void => {
      const _mockBatch: Batch = mockBatch();

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      processService.emitBatchListUpdate = jest
        .fn();

      processService.processSyncSuccess([_mockBatch]);

      expect(processService.syncErrors[0]['message']).toMatch(`Sync error: batch with id: '${_mockBatch.cid}' not found`);
    });

    test('should sync on connection (not login)', (done: jest.DoneCallback): void => {
      const _mockSyncResponse: SyncResponse<Batch> = mockSyncResponse<Batch>();
      const preError: SyncError = mockSyncError();
      preError.message = 'pre-error';
      const responseError: SyncError = mockSyncError();
      responseError.message = 'response-error';
      _mockSyncResponse.errors.push(responseError);

      processService.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(true);

      processService.generateSyncRequests = jest
        .fn()
        .mockReturnValue({ syncRequests: [], syncErrors: [ preError ] });

      processService.syncService.sync = jest
        .fn()
        .mockReturnValue(of(_mockSyncResponse));

      processService.processSyncSuccess = jest
        .fn();

      processService.updateBatchStorage = jest
        .fn();

      processService.errorReporter.handleGenericCatchError = jest
        .fn();

      const processSpy: jest.SpyInstance = jest.spyOn(processService, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(processService, 'updateBatchStorage');

      processService.syncOnConnection(false)
        .subscribe(
          (): void => {
            expect(processSpy).toHaveBeenCalled();
            expect(updateSpy).toHaveBeenCalled();
            expect(processService.syncErrors.length).toEqual(2);
            expect(processService.syncErrors[0]).toStrictEqual(responseError);
            expect(processService.syncErrors[1]).toStrictEqual(preError);
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

      processService.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(true);

      processService.generateSyncRequests = jest
        .fn()
        .mockReturnValue({ syncRequests: [], syncErrors: [] });

      processService.syncService.sync = jest
        .fn()
        .mockReturnValue(of(_mockSyncResponse));

      processService.processSyncSuccess = jest
        .fn();

      processService.updateBatchStorage = jest
        .fn();

      processService.errorReporter.handleGenericCatchError = jest
        .fn();

      const processSpy: jest.SpyInstance = jest.spyOn(processService, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(processService, 'updateBatchStorage');

      processService.syncOnConnection(true)
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
      processService.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(false);

      const genSpy: jest.SpyInstance = jest.spyOn(processService, 'generateSyncRequests');

      processService.syncOnConnection(false)
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

    test('should sync on reconnect', (done: jest.DoneCallback): void => {
      processService.syncOnConnection = jest
        .fn()
        .mockReturnValue(of({}));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      processService.syncOnReconnect();

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('batch sync on reconnect complete');
        done();
      }, 10);
    });

    test('should get error when syncing on reconnect', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      processService.syncOnConnection = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      processService.errorReporter.handleUnhandledError = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(processService.errorReporter, 'handleUnhandledError');

      processService.syncOnReconnect();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should sync on signup', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      const _mockBatchList$: BehaviorSubject<Batch>[] = [_mockBatch$];
      const _mockSyncResponse: SyncResponse<Batch> = mockSyncResponse<Batch>();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);

      processService.getAllBatchesList = jest
        .fn()
        .mockReturnValue(_mockBatchList$);

      processService.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      processService.userService.getUser = jest
        .fn()
        .mockReturnValue(_mockUser$);

      processService.configureBackgroundRequest = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      processService.syncService.sync = jest
        .fn()
        .mockReturnValue(of(_mockSyncResponse));

      processService.event.emit = jest
        .fn();

      processService.processSyncSuccess = jest
        .fn();

      processService.updateBatchStorage = jest
        .fn();

      const processSpy: jest.SpyInstance = jest.spyOn(processService, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(processService, 'updateBatchStorage');
      const emitSpy: jest.SpyInstance = jest.spyOn(processService.event, 'emit');

      processService.syncOnSignup();

      setTimeout((): void => {
        expect(processSpy).toHaveBeenCalled();
        expect(updateSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith('sync-inventory-on-signup');
        done();
      }, 10);
    });

    test('should handle sync error on syncing on signup', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      const _mockBatchList$: BehaviorSubject<Batch>[] = [_mockBatch$, _mockBatch$];
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockSyncResponse: SyncResponse<Batch> = mockSyncResponse<Batch>();
      // _mockSyncResponse.errors.push({ errCode: 1, message: `Recipe with id ${_mockBatch.recipeMasterId} not found`});

      processService.getAllBatchesList = jest
        .fn()
        .mockReturnValue(_mockBatchList$);

      processService.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(_mockRecipeMasterActive$);

      processService.userService.getUser = jest
        .fn()
        .mockReturnValue(undefined);

      processService.syncService.sync = jest
        .fn()
        .mockReturnValue(of(_mockSyncResponse));

      const syncSpy: jest.SpyInstance = jest.spyOn(processService.syncService, 'sync');
      const emitSpy: jest.SpyInstance = jest.spyOn(processService.event, 'emit');

      processService.syncOnSignup();

      setTimeout((): void => {
        expect(emitSpy).toHaveBeenCalledWith('sync-inventory-on-signup');
        const requests: Observable<any>[] = (<Observable<any>[]>syncSpy.mock.calls[0][1])
          .map((obs: Observable<any>): Observable<any> => {
            return obs.pipe(catchError((error: any): any => of(error)));
          });
        forkJoin(requests)
          .subscribe(
            (thrownErrors: any): void => {
              expect(thrownErrors[0].message).toMatch(`Recipe with id ${_mockBatch.recipeMasterId} not found`);
              expect(thrownErrors[1].message).toMatch('User server id not found');
              done();
            }
          );
      }, 10);
    });

  });


  describe('Utility Methods', (): void => {

    test('should add a batch to active list', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processService.updateBatchStorage = jest
        .fn();

      processService.addBatchToActiveList(_mockBatch)
        .subscribe(
          (): void => {
            expect(processService.activeBatchList$.value[0].value).toStrictEqual(_mockBatch);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should add a batch to active list'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should archive an active batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);

      const _mockArchiveList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(_mockBatch$);

      processService.getBatchList = jest
        .fn()
        .mockReturnValue(_mockArchiveList$);

      processService.updateBatchStorage = jest
        .fn();

      processService.removeBatchFromList = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      processService.archiveActiveBatch(_mockBatch.cid)
        .subscribe(
          (): void => {
            expect(_mockArchiveList$.value.length).toEqual(1);
            done();
          },
          (error: any): void => {
            console.log(`Error in`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error archiving missing active batch', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      processService.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      processService.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      const errorSpy: jest.SpyInstance = jest.spyOn(processService, 'getMissingError');

      processService.archiveActiveBatch('error-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(errorSpy).toHaveBeenCalledWith(
              'An error occurring trying to archive an active batch: missing batch',
              'Batch with id error-id not found'
            );
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

    test('should check if a request can be sent', (): void => {
      processService.connectionService.isConnected = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.userService.isLoggedIn = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      expect(processService.canSendRequest(['1a2b3c4d5e', '6f7g8h9i10j'])).toBe(true);
      expect(processService.canSendRequest()).toBe(false);
    });

    test('should clear a batch list', (): void => {
      const _mockBatch: Batch = mockBatch();

      processService.storageService.removeBatches = jest
        .fn();

      const activeList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      const archiveList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      processService.getBatchList = jest
        .fn()
        .mockReturnValueOnce(activeList$)
        .mockReturnValueOnce(archiveList$);

      expect(activeList$.value.length).toEqual(2);

      processService.clearBatchList(true);

      expect(activeList$.value.length).toEqual(0);
      expect(archiveList$.value.length).toEqual(3);

      processService.clearBatchList(false);

      expect(archiveList$.value.length).toEqual(0);
    });

    test('should clear all batches', (): void => {
      processService.clearBatchList = jest
        .fn();

      const clearSpy: jest.SpyInstance = jest.spyOn(processService, 'clearBatchList');

      processService.clearAllBatchLists();

      expect(clearSpy.mock.calls[0][0]).toBe(true);
      expect(clearSpy.mock.calls[1][0]).toBe(false);
    });

    test('should emit a batch list subject update', (): void => {
      const activeList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
      const archiveList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);

      processService.getBatchList = jest
        .fn()
        .mockReturnValueOnce(activeList$)
        .mockReturnValueOnce(archiveList$);

      const nextActiveSpy: jest.SpyInstance = jest.spyOn(activeList$, 'next');
      const nextArchiveSpy: jest.SpyInstance = jest.spyOn(archiveList$, 'next');

      processService.emitBatchListUpdate(true);
      expect(nextActiveSpy).toHaveBeenCalled();

      processService.emitBatchListUpdate(false);
      expect(nextArchiveSpy).toHaveBeenCalled();
    });

    test('should generate a new batch from a recipe', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockBatch: Batch = mockGeneratedBatch();

      global.Date.prototype.toISOString = jest
        .fn()
        .mockImplementation(() => '2020-01-01T00:00:00.000Z');

      expect((new Date()).toISOString()).toMatch('2020-01-01T00:00:00.000Z');

      processService.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      processService.clientIdService.getNewId = jest
        .fn()
        .mockReturnValue('0123456789012');

      processService.errorReporter.handleGenericCatchError = jest
        .fn();

      processService.generateBatchFromRecipe(_mockUser._id, _mockRecipeMasterActive.cid, _mockRecipeMasterActive.variants[0].cid)
        .subscribe(
          (batch: Batch): void => {
            expect(batch).toStrictEqual(_mockBatch);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should generate a new batch from a recipe'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get error generating new batch from missing recipe master', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      processService.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      processService.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      const errorSpy: jest.SpyInstance = jest.spyOn(processService, 'getMissingError');

      processService.generateBatchFromRecipe('user-id', 'rm-id', 'rv-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(errorSpy).toHaveBeenCalledWith(
              'An error occurring trying to generate batch from recipe: missing recipe',
              'Recipe master with id rm-id not found'
            );
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

    test('should get error generating new batch from missing chosen recipe variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.variants = [];
      const _mockError: Error = new Error('test-error');

      processService.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));

      processService.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      processService.errorReporter.handleGenericCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error).toStrictEqual(_mockError);
            return throwError(null);
          };
        });

      const errorSpy: jest.SpyInstance = jest.spyOn(processService, 'getMissingError');

      processService.generateBatchFromRecipe('user-id', 'rm-id', 'rv-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(errorSpy).toHaveBeenCalledWith(
              'An error occurring trying to generate batch from recipe: missing recipe',
              'Recipe master with id rm-id was found, but variant with id rv-id not found'
            );
            expect(error).toBeNull();
            done();
          }
        );
    });

    test('should get combined active and archive batches list', (): void => {
      const _mockBatch: Batch = mockBatch();

      processService.activeBatchList$ = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      processService.archiveBatchList$ = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      const batchList: BehaviorSubject<Batch>[] = processService.getAllBatchesList();

      expect(batchList.length).toEqual(3);
    });

    test('should get a batch by its id', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatchTarget: Batch = mockBatch();
      _mockBatchTarget.cid = '12345';

      processService.getBatchList = jest
        .fn()
        .mockReturnValueOnce(new BehaviorSubject<BehaviorSubject<Batch>[]>([
          new BehaviorSubject<Batch>(_mockBatch),
          new BehaviorSubject<Batch>(_mockBatchTarget)
        ]))
        .mockReturnValueOnce(new BehaviorSubject<BehaviorSubject<Batch>[]>([]))
        .mockReturnValueOnce(new BehaviorSubject<BehaviorSubject<Batch>[]>([
          new BehaviorSubject<Batch>(_mockBatch),
          new BehaviorSubject<Batch>(_mockBatchTarget)
        ]))
        .mockReturnValueOnce(new BehaviorSubject<BehaviorSubject<Batch>[]>([]))
        .mockReturnValueOnce(new BehaviorSubject<BehaviorSubject<Batch>[]>([]));

      const fromActive: BehaviorSubject<Batch> = processService.getBatchById('12345');
      expect(fromActive.value).toStrictEqual(_mockBatchTarget);

      const fromArchive: BehaviorSubject<Batch> = processService.getBatchById('12345');
      expect(fromArchive.value).toStrictEqual(_mockBatchTarget);

      const notFound: BehaviorSubject<Batch> = processService.getBatchById('12345');
      expect(notFound).toBeUndefined();
    });

    test('should get a batch list', (): void => {
      const _mockBatch: Batch = mockBatch();

      processService.activeBatchList$ = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      processService.archiveBatchList$ = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      const fromActive: BehaviorSubject<BehaviorSubject<Batch>[]> = processService.getBatchList(true);
      expect(fromActive.value.length).toEqual(2);

      const fromArchive: BehaviorSubject<BehaviorSubject<Batch>[]> = processService.getBatchList(false);
      expect(fromArchive.value.length).toEqual(1);
    });

    test('should get a custom missing batch error', (): void => {
      const message: string = 'test-message';
      const additional: string = 'test-additional';
      const customError: CustomError = <CustomError>processService.getMissingError(message, additional);
      expect(customError.name).toMatch('BatchError');
      expect(customError.message).toMatch(`${message} ${additional}`);
      expect(customError.severity).toEqual(2);
      expect(customError.userMessage).toMatch(message);
    });

    test('should convert array of batches to an array of behavior subjects of batches', (): void => {
      const _mockBatch: Batch = mockBatch();

      const batchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);

      processService.getBatchList = jest
        .fn()
        .mockReturnValue(batchList$);

      processService.mapBatchArrayToSubjectArray(true, [ _mockBatch, _mockBatch ]);

      expect(batchList$.value.length).toEqual(2);
    });

    test('should remove a batch from the list', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatchTarget: Batch = mockBatch();
      _mockBatchTarget.cid = '12345';

      const batchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatchTarget),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      processService.getBatchList = jest
        .fn()
        .mockReturnValue(batchList$);

      processService.updateBatchStorage = jest
        .fn();

      processService.removeBatchFromList(true, '12345')
        .subscribe(
          (results: any): void => {
            expect(results).toBeNull();
            expect(batchList$.value.length).toEqual(2);
            expect(batchList$.value.find((batch$: BehaviorSubject<Batch>) => batch$.value.cid === '12345')).toBeUndefined();
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should remove a batch from the list'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error if batch is missing', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      processService.getBatchList = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<BehaviorSubject<Batch>[]>([]));

      processService.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      const errorSpy: jest.SpyInstance = jest.spyOn(processService, 'getMissingError');

      processService.removeBatchFromList(true, '0')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(errorSpy).toHaveBeenCalledWith(
              'An error occurring trying to remove batch from list: missing batch',
              'Batch with id 0 not found'
            );
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

  });


  describe('Storage Methods', (): void => {

    test('should update batch storage', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processService.getBatchList = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<BehaviorSubject<Batch>[]>([
          new BehaviorSubject<Batch>(_mockBatch)
        ]));

      processService.storageService.setBatches = jest
        .fn()
        .mockReturnValue(of(null));

      const storeSpy: jest.SpyInstance = jest.spyOn(processService.storageService, 'setBatches');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      processService.updateBatchStorage(true);

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(true, [_mockBatch]);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('stored active batches');
        done();
      }, 10);
    });

    test('should get an error updating batch storage', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      processService.getBatchList = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<BehaviorSubject<Batch>[]>([]));

      processService.storageService.setBatches = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      processService.errorReporter.handleUnhandledError = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(processService.errorReporter, 'handleUnhandledError');
      const storeSpy: jest.SpyInstance = jest.spyOn(processService.storageService, 'setBatches');

      processService.updateBatchStorage(true);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        expect(storeSpy).toHaveBeenCalledWith(true, []);
        done();
      }, 10);
    });

  });


  describe('Type Guard', (): void => {

    test('should check type safety', (): void => {
      const _mockBatch: Batch = mockBatch();
      processService.isSafeBatch = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const _mockError: Error = new Error('test-error');
      processService.getUnsafeError = jest
        .fn()
        .mockReturnValue(_mockError);

      processService.checkTypeSafety(_mockBatch);
      expect((): void => {
        processService.checkTypeSafety(null);
      }).toThrow(_mockError);
    });

    test('should get a type unsafe error', (): void => {
      const _mockCheck: any = { mock: false };
      const customError: CustomError = <CustomError>processService.getUnsafeError(_mockCheck);
      expect(customError.name).toMatch('BatchError');
      expect(customError.message).toMatch(`Batch is invalid: got {\n  "mock": false\n}`);
      expect(customError.severity).toEqual(2);
      expect(customError.userMessage).toMatch('An internal error occurred: invalid batch');
    });

    test('should check if alerts are type safe', (): void => {
      const _mockAlert: Alert = mockAlert();

      processService.typeGuard.hasValidProperties = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const guardSpy: jest.SpyInstance = jest.spyOn(processService.typeGuard, 'hasValidProperties');

      expect(processService.isSafeAlerts([_mockAlert, _mockAlert])).toBe(true);
      expect(processService.isSafeAlerts([_mockAlert, _mockAlert])).toBe(false);
      expect(guardSpy).toHaveBeenCalledWith(_mockAlert, AlertGuardMetadata);
    });

    test('should check if batch is type safe', (): void => {
      const _mockBatch: Batch = mockBatch();
      processService.typeGuard.hasValidProperties = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.isSafeBatchAnnotations = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.isSafeBatchContext = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.isSafeBatchProcess = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const guardSpy: jest.SpyInstance = jest.spyOn(processService.typeGuard, 'hasValidProperties');

      expect(processService.isSafeBatch(_mockBatch)).toBe(true);
      expect(processService.isSafeBatch(_mockBatch)).toBe(false);
      expect(processService.isSafeBatch(_mockBatch)).toBe(false);
      expect(processService.isSafeBatch(_mockBatch)).toBe(false);
      expect(processService.isSafeBatch(_mockBatch)).toBe(false);
      expect(guardSpy).toHaveBeenCalledWith(_mockBatch, BatchGuardMetadata);
    });

    test('should check if batch annotations are type safe', (): void => {
      const _mockBatchAnnotations: BatchAnnotations = mockBatch().annotations;

      processService.typeGuard.hasValidProperties = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.isSafePrimaryValues = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      const guardSpy: jest.SpyInstance = jest.spyOn(processService.typeGuard, 'hasValidProperties');

      expect(processService.isSafeBatchAnnotations(_mockBatchAnnotations)).toBe(true);
      expect(processService.isSafeBatchAnnotations(_mockBatchAnnotations)).toBe(false);
      expect(processService.isSafeBatchAnnotations(_mockBatchAnnotations)).toBe(false);
      expect(processService.isSafeBatchAnnotations(_mockBatchAnnotations)).toBe(false);
      expect(guardSpy).toHaveBeenCalledWith(_mockBatchAnnotations, BatchAnnotationsGuardMetadata);
    });

    test('should check if batch context is type safe', (): void => {
      const _mockBatchContext: BatchContext = mockBatch().contextInfo;
      processService.typeGuard.hasValidProperties = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.recipeService.isSafeGrainBillCollection = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.recipeService.isSafeHopsScheduleCollection = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.recipeService.isSafeYeastBatchCollection = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.recipeService.isSafeOtherIngredientsCollection = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const guardSpy: jest.SpyInstance = jest.spyOn(processService.typeGuard, 'hasValidProperties');

      expect(processService.isSafeBatchContext(_mockBatchContext)).toBe(true);
      expect(processService.isSafeBatchContext(_mockBatchContext)).toBe(false);
      expect(processService.isSafeBatchContext(_mockBatchContext)).toBe(false);
      expect(processService.isSafeBatchContext(_mockBatchContext)).toBe(false);
      expect(processService.isSafeBatchContext(_mockBatchContext)).toBe(false);
      expect(processService.isSafeBatchContext(_mockBatchContext)).toBe(false);
      expect(guardSpy).toHaveBeenCalledWith(_mockBatchContext, BatchContextGuardMetadata);
    });

    test('should check if batch context is type safe', (): void => {
      const _mockBatchProcess: BatchProcess = mockBatch().process;
      processService.typeGuard.hasValidProperties = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.isSafeProcessSchedule = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      processService.isSafeAlerts = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const guardSpy: jest.SpyInstance = jest.spyOn(processService.typeGuard, 'hasValidProperties');

      expect(processService.isSafeBatchProcess(_mockBatchProcess)).toBe(true);
      expect(processService.isSafeBatchProcess(_mockBatchProcess)).toBe(false);
      expect(processService.isSafeBatchProcess(_mockBatchProcess)).toBe(false);
      expect(processService.isSafeBatchProcess(_mockBatchProcess)).toBe(false);
      expect(guardSpy).toHaveBeenCalledWith(_mockBatchProcess, BatchProcessGuardMetadata);
    });

    test('should check if primary values are type safe', (): void => {
      const _mockPrimaryValues: PrimaryValues = mockPrimaryValues();

      processService.typeGuard.hasValidProperties = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const guardSpy: jest.SpyInstance = jest.spyOn(processService.typeGuard, 'hasValidProperties');

      expect(processService.isSafePrimaryValues(_mockPrimaryValues)).toBe(true);
      expect(processService.isSafePrimaryValues(_mockPrimaryValues)).toBe(false);
      expect(guardSpy).toHaveBeenCalledWith(_mockPrimaryValues, PrimaryValuesGuardMetadata);
    });

    test('should check if process schedule items are type safe', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();

      processService.recipeService.isSafeProcessSchedule = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      expect(processService.isSafeProcessSchedule(_mockProcessSchedule)).toBe(true);
      expect(processService.isSafeProcessSchedule(_mockProcessSchedule)).toBe(false);
    });

    test('should check if a process is a timer process', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const _mockTimerProcess: TimerProcess = <TimerProcess>_mockProcessSchedule[2];
      const _mockOtherProcess: Process = _mockProcessSchedule[13];

      expect(processService.isTimerProcess(_mockTimerProcess)).toBe(true);
      expect(processService.isTimerProcess(_mockOtherProcess)).toBe(false);
    });

  });

});
