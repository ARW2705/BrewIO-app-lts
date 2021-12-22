/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, forkJoin, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/* TestBed configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAlert, mockBatch, mockCalendarMetadata, mockEnglishUnits, mockGeneratedBatch, mockHopsSchedule, mockMetricUnits, mockSyncError, mockSyncMetadata, mockSyncResponse, mockRecipeMasterActive, mockPrimaryValues, mockProcessSchedule, mockErrorResponse, mockUser } from '../../../../test-config/mock-models';
import { CalculationsServiceStub, IdServiceStub, ConnectionServiceStub, ErrorReportingServiceStub, EventServiceStub, HttpErrorServiceStub, LibraryServiceStub, RecipeServiceStub, StorageServiceStub, SyncServiceStub, ToastServiceStub, UserServiceStub, TypeGuardServiceStub, UtilityServiceStub } from '../../../../test-config/service-stubs';

/* Constants imports */
import { API_VERSION, BASE_URL } from '../../shared/constants';

/* Interface imports */
import { Alert, Batch, BatchAnnotations, BatchContext, BatchProcess, CalendarMetadata, CalendarProcess, HopsSchedule, PrimaryValues, Process, RecipeMaster, SelectedUnits, SyncData, SyncError, SyncRequests, SyncResponse, TimerProcess, User } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Type guard imports */
import { AlertGuardMetadata, BatchGuardMetadata, BatchContextGuardMetadata, BatchAnnotationsGuardMetadata, BatchProcessGuardMetadata, PrimaryValuesGuardMetadata } from '../../shared/type-guard-metadata';

/* Service imports */
import { ProcessService } from './process.service';
import { CalculationsService, ConnectionService, ErrorReportingService, EventService, HttpErrorService, IdService, LibraryService, RecipeService, StorageService, SyncService, ToastService, TypeGuardService, UserService, UtilityService } from '../services';


describe('ProcessService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: ProcessService;
  let httpMock: HttpTestingController;
  let originalRegister: any;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        ProcessService,
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: IdService, useClass: IdServiceStub },
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
        { provide: TypeGuardService, useClass: TypeGuardServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(ProcessService);
    originalRegister = service.registerEvents;
    service.registerEvents = jest.fn();
    httpMock = injector.get(HttpTestingController);
    service.errorReporter.handleUnhandledError = jest.fn();
    service.idService.hasId = jest.fn()
      .mockImplementation((obj: any, id: string): boolean => obj['_id'] === id || obj['cid'] === id);
    Object.assign(service.errorReporter, { highSeverity: 2 });
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    expect(service).toBeDefined();
  });

  describe('Initializations', (): void => {

    test('should init batches from storage', (done: jest.DoneCallback): void => {
      service.syncOnConnection = jest
        .fn()
        .mockReturnValue(of(true));

      service.mapBatchArrayToSubjectArray = jest
        .fn();

      service.updateBatchStorage = jest
        .fn();

      service.event.emit = jest
        .fn();

      service.errorReporter.handleGenericCatchError = jest
        .fn();

      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateBatchStorage');

      service.initFromServer();

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

      service.syncOnConnection = jest
        .fn()
        .mockReturnValue(of(true));

      service.errorReporter.handleGenericCatchError = jest
        .fn()
        .mockImplementation((): (error: HttpErrorResponse) => Observable<never> => {
          return (error: HttpErrorResponse): Observable<never> => {
            expect(error).toStrictEqual(_mockHttpErrorResponse);
            return throwError(null);
          };
        });

      service.errorReporter.handleUnhandledError = jest
        .fn();

      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.initFromServer();

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

      service.storageService.getBatches = jest
        .fn()
        .mockReturnValueOnce(of([_mockBatch, _mockBatch]))
        .mockReturnValueOnce(of([_mockBatch]));

      service.mapBatchArrayToSubjectArray = jest
        .fn();

      const mapSpy: jest.SpyInstance = jest.spyOn(service, 'mapBatchArrayToSubjectArray');

      service.initFromStorage();

      setTimeout((): void => {
        expect(mapSpy.mock.calls[0][0]).toBe(true);
        expect(mapSpy.mock.calls[1][0]).toBe(false);
        done();
      }, 10);
    });

    test('should get errors on init batches from storage', (done: jest.DoneCallback): void => {
      const _mockErrorActive: Error = new Error('test-error-active');
      const _mockErrorArchive: Error = new Error('test-error-archive');

      service.storageService.getBatches = jest
        .fn()
        .mockReturnValueOnce(throwError(_mockErrorActive))
        .mockReturnValueOnce(throwError(_mockErrorArchive));

      service.errorReporter.handleUnhandledError = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.initFromStorage();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenNthCalledWith(1, _mockErrorActive);
        expect(errorSpy).toHaveBeenNthCalledWith(2, _mockErrorArchive);
        done();
      }, 10);
    });

    test('should initialize the batch lists', (): void => {
      service.initFromStorage = jest
        .fn();

      service.initFromServer = jest
        .fn();

      service.canSendRequest = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.event.emit = jest
        .fn();

      const initSpy: jest.SpyInstance = jest.spyOn(service, 'initFromServer');
      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');

      service.initializeBatchLists();

      expect(initSpy).toHaveBeenCalled();

      service.initializeBatchLists();

      expect(emitSpy).toHaveBeenCalledWith('init-inventory');
    });

    test('should register events', (): void => {
      const mockSubjects: Subject<object>[] = Array.from(Array(4), () => new Subject<object>());

      let counter = 0;
      service.event.register = jest
        .fn()
        .mockImplementation(() => mockSubjects[counter++]);

      service.initializeBatchLists = jest
        .fn();

      service.clearAllBatchLists = jest
        .fn();

      service.syncOnSignup = jest
        .fn();

      service.syncOnReconnect = jest
        .fn();

      const spies: jest.SpyInstance[] = [
        jest.spyOn(service, 'initializeBatchLists'),
        jest.spyOn(service, 'clearAllBatchLists'),
        jest.spyOn(service, 'syncOnSignup'),
        jest.spyOn(service, 'syncOnReconnect')
      ];

      const eventSpy: jest.SpyInstance = jest.spyOn(service.event, 'register');

      service.registerEvents = originalRegister;

      service.registerEvents();

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

      service.getBatchById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<Batch>(_mockBatch));

      service.updateBatch = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      service.archiveActiveBatch = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      service.errorReporter.handleGenericCatchError = jest
        .fn();

      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateBatch');
      const archiveSpy: jest.SpyInstance = jest.spyOn(service, 'archiveActiveBatch');

      service.endBatchById(_mockBatch.cid)
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

      service.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      service.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      service.endBatchById('test-id')
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

      service.generateBatchFromRecipe = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      service.canSendRequest = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.requestInBackground = jest
        .fn();

      service.addSyncFlag = jest
        .fn();

      service.addBatchToActiveList = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      service.errorReporter.handleGenericCatchError = jest
        .fn();

      const requestSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');

      service.startNewBatch('user-id', 'rm-id', 'rv-id')
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should start a new batch'`, error);
            expect(true).toBe(false);
          }
        );

      service.startNewBatch('user-id', 'rm-id', 'rv-id')
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

      service.generateBatchFromRecipe = jest
        .fn()
        .mockReturnValue(of(undefined));

      service.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      service.errorReporter.handleGenericCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error).toStrictEqual(_mockError);
            return throwError(null);
          };
        });

      service.startNewBatch('user-id', 'rm-id', 'rv-id')
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

      service.getBatchById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<Batch>(_mockBatch));

      service.emitBatchListUpdate = jest
        .fn();

      service.updateBatchStorage = jest
        .fn();

      service.canSendRequest = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.requestInBackground = jest
        .fn();

      service.addSyncFlag = jest
        .fn();

      service.checkTypeSafety = jest
        .fn();

      service.idService.getId = jest
        .fn()
        .mockReturnValue('test-id');

      const requestSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');

      service.updateBatch(_mockBatch)
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should update a batch'`, error);
            expect(true).toBe(false);
          }
        );

      service.updateBatch(_mockBatch)
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

      service.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      service.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      service.idService.getId = jest
        .fn()
        .mockReturnValue('');

      service.updateBatch(_mockBatch)
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
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      const _mockExpectedBatch: Batch = mockBatch();
      _mockExpectedBatch.annotations.measuredValues.originalGravity += 0.020;
      _mockExpectedBatch.annotations.measuredValues.finalGravity -= 0.010;
      _mockExpectedBatch.annotations.measuredValues.batchVolume += 1;
      _mockExpectedBatch.annotations.measuredValues.ABV = 4;
      _mockExpectedBatch.annotations.measuredValues.IBU = 30;
      _mockExpectedBatch.annotations.measuredValues.SRM = 5;
      service.getBatchById = jest.fn().mockReturnValue(_mockBatch$);
      const batchSpy: jest.SpyInstance = jest.spyOn(service, 'getBatchById');
      service.calculator.getABV = jest.fn().mockReturnValue(4);
      const abvSpy: jest.SpyInstance = jest.spyOn(service.calculator, 'getABV');
      service.calculator.calculateTotalIBU = jest.fn().mockReturnValue(30);
      const ibuSpy: jest.SpyInstance = jest.spyOn(service.calculator, 'calculateTotalIBU');
      service.calculator.calculateTotalSRM = jest.fn().mockReturnValue(5);
      const srmSpy: jest.SpyInstance = jest.spyOn(service.calculator, 'calculateTotalSRM');
      service.updateBatch = jest.fn().mockReturnValue(of(_mockBatch));
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateBatch');
      const _mockPrimaryValues: PrimaryValues = mockPrimaryValues();
      _mockPrimaryValues.efficiency = _mockBatch.annotations.measuredValues.efficiency;
      _mockPrimaryValues.originalGravity = _mockBatch.annotations.measuredValues.originalGravity + 0.020;
      _mockPrimaryValues.finalGravity = _mockBatch.annotations.measuredValues.finalGravity - 0.010;
      _mockPrimaryValues.batchVolume = _mockBatch.annotations.measuredValues.batchVolume + 1;

      service.updateMeasuredValues(_mockBatch.cid, _mockPrimaryValues, true)
        .subscribe(
          (batch: Batch): void => {
            expect(batchSpy).toHaveBeenCalledWith(_mockBatch.cid);
            expect(abvSpy).toHaveBeenCalledWith(
              _mockPrimaryValues.originalGravity,
              _mockPrimaryValues.finalGravity
            );
            expect(ibuSpy).toHaveBeenCalledWith(
              _mockBatch.contextInfo.hops,
              _mockPrimaryValues.originalGravity,
              _mockPrimaryValues.batchVolume,
              _mockBatch.contextInfo.boilVolume
            );
            expect(srmSpy).toHaveBeenCalledWith(
              _mockBatch.contextInfo.grains,
              _mockPrimaryValues.batchVolume
            );
            expect(updateSpy).toHaveBeenCalledWith(_mockExpectedBatch, true);
            expect(batch).toStrictEqual(_mockExpectedBatch);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should update measured values', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error updating measured values', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.getBatchById = jest.fn()
        .mockImplementation(() => {
          throw _mockError;
        });
      service.errorReporter.handleGenericCatchError = jest.fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error).toStrictEqual(_mockError);
            return throwError(null);
          };
        });

      service.updateMeasuredValues(null, null, false)
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

    test('should update a calendar step', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      const _mockCalendarMetadata: CalendarMetadata = mockCalendarMetadata();
      const calendarIndex: number = 13;
      _mockCalendarMetadata.id = _mockBatch.process.schedule[calendarIndex].cid;
      const now: string = (new Date()).toISOString();
      _mockCalendarMetadata.startDatetime = now;
      service.getBatchById = jest.fn().mockReturnValue(_mockBatch$);
      service.updateBatch = jest.fn()
        .mockImplementation((batch: Batch): Observable<Batch> => of(batch));

      service.updateCalendarStep(_mockBatch.cid, _mockCalendarMetadata)
        .subscribe(
          (batch: Batch): void => {
            expect(batch.process.schedule[calendarIndex]['startDatetime']).toMatch(now);
            expect(batch.process.alerts[batch.process.alerts.length - 1])
              .toStrictEqual(_mockCalendarMetadata.alerts[0]);
            done();
          },
          (error: any): void => {
            console.log('Error in: should update a calendar step', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should catch an error when updating a calendar step', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.getBatchById = jest.fn().mockImplementation((): void => { throw _mockError; });
      service.getMissingError = jest.fn().mockReturnValue(_mockError);
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      service.updateCalendarStep('', null)
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch('test-error');
            expect(getSpy).toHaveBeenCalledWith('test-error', 'An error occurring trying to update batch step');
            done();
          }
        );
    });

  });


  describe('Background Server Updates', (): void => {

    test('should configure a background request', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      service.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      service.errorReporter.handleResolvableCatchError = jest
        .fn();

      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBackgroundRequest');

      service.configureBackgroundRequest('post', false, _mockBatch)
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

      service.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      service.errorReporter.handleResolvableCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error).toStrictEqual(_mockError);
            return throwError(null);
          };
        });

      service.configureBackgroundRequest('post', false, null)
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

      service.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(throwError(_mockHttpErrorResponse));

      service.errorReporter.handleResolvableCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<any> => {
          return (error: Error): Observable<any> => {
            expect(error).toStrictEqual(_mockHttpErrorResponse);
            return of(error);
          };
        });

      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleResolvableCatchError');

      service.configureBackgroundRequest('post', true, null)
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

      service.getBackgroundRequest('post', _mockBatch)
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

      service.getBackgroundRequest('patch', _mockBatch)
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

      service.getBackgroundRequest('invalid', _mockBatch)
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

      service.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      service.getBatchById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<Batch>(_mockBatch));

      service.emitBatchListUpdate = jest
        .fn();

      service.updateBatchStorage = jest
        .fn();

      service.errorReporter.handleGenericCatchError = jest
        .fn();

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const emitSpy: jest.SpyInstance = jest.spyOn(service, 'emitBatchListUpdate');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateBatchStorage');

      service.requestInBackground('post', _mockBatch);

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Batch: background post request successful');
        expect(emitSpy).toHaveBeenCalledTimes(2);
        expect(updateSpy).toHaveBeenCalledTimes(2);
        done();
      }, 10);
    });

    test('should get an error for an invalid request method', (done: jest.DoneCallback): void => {
      service.errorReporter.handleGenericCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error.message).toMatch('Unknown sync type: invalid');
            return throwError(null);
          };
        });

      service.errorReporter.handleUnhandledError = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.requestInBackground('invalid', null);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(null);
        done();
      }, 10);
    });

    test('should get an error updating client batch after successful response', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockError: Error = new Error('test-error');

      service.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      service.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      service.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      service.errorReporter.handleGenericCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error).toStrictEqual(_mockError);
            return throwError(null);
          };
        });

      service.errorReporter.handleUnhandledError = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.requestInBackground('post', _mockBatch);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(null);
        done();
      }, 10);
    });

  });


  describe('Sync Methods', (): void => {

    test('should add a sync flag', (): void => {
      service.syncService.addSyncFlag = jest
        .fn();

      const syncSpy: jest.SpyInstance = jest.spyOn(service.syncService, 'addSyncFlag');

      service.addSyncFlag('create', '012345');

      expect(syncSpy).toHaveBeenCalledWith({
        method: 'create',
        docId: '012345',
        docType: 'batch'
      });
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
      const _mockBatch: Batch = mockBatch();
      const _mockUser: User = mockUser();

      service.syncService.getSyncFlagsByType = jest
        .fn()
        .mockReturnValue([
          mockSyncMetadata('create', _mockBatchOffline.cid, 'batch'),
          mockSyncMetadata('update', _mockBatch.cid, 'batch')
        ]);

      service.getBatchById = jest
        .fn()
        .mockReturnValueOnce(new BehaviorSubject<Batch>(_mockBatchOffline))
        .mockReturnValueOnce(new BehaviorSubject<Batch>(_mockBatch));

      service.userService.getUser = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<User>(_mockUser));

      service.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));

      service.configureBackgroundRequest = jest
        .fn()
        .mockReturnValueOnce(of(_mockBatchOffline))
        .mockReturnValueOnce(of(_mockBatch));

      service.idService.hasDefaultIdType = jest
        .fn()
        .mockReturnValue(false);

      service.idService.isMissingServerId = jest
        .fn()
        .mockReturnValue(false);

      const syncRequests: SyncRequests<Batch> = service.generateSyncRequests();
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

      service.syncService.getSyncFlagsByType = jest
        .fn()
        .mockReturnValue([
          mockSyncMetadata('create', _mockBatch.cid, 'batch'),
          mockSyncMetadata('update', _mockBatch.cid, 'batch'),
          mockSyncMetadata('update', _mockBatch.cid, 'batch'),
          mockSyncMetadata('update', _mockBatch.cid, 'batch'),
          mockSyncMetadata('invalid', _mockBatch.cid, 'batch'),
        ]);

      service.getBatchById = jest
        .fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(_mockBatch$)
        .mockReturnValueOnce(_mockBatch$)
        .mockReturnValueOnce(_mockBatch$)
        .mockReturnValueOnce(_mockBatch$);

      service.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(_mockRecipeMasterActive$)
        .mockReturnValueOnce(_mockRecipeMasterActive$);

      service.syncService.constructSyncError = jest
        .fn()
        .mockImplementation((errMsg: string): SyncError => {
          return mockSyncError(errMsg);
        });

      service.userService.getUser = jest
        .fn()
        .mockReturnValueOnce(_mockUserNoId$)
        .mockReturnValueOnce(_mockUser$)
        .mockReturnValueOnce(_mockUser$)
        .mockReturnValueOnce(_mockUser$);

      service.idService.hasDefaultIdType = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValue(false);

      service.idService.isMissingServerId = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValue(false);

      service.idService.hasId = jest
        .fn()
        .mockReturnValue(true);

      const syncRequests: SyncRequests<Batch> = service.generateSyncRequests();
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

      service.getBatchById = jest
        .fn()
        .mockReturnValue(_mockBatch$);

      service.emitBatchListUpdate = jest
        .fn();

      service.checkTypeSafety = jest
        .fn();

      const syncData: (Batch | SyncData<Batch>)[] = [
        _mockBatchUpdate,
        { isDeleted: true, data: null }
      ];

      service.processSyncSuccess(syncData);

      expect(_mockBatch$.value.cid).toMatch('updated');
    });

    test('should get error handling sync success', (): void => {
      const _mockBatch: Batch = mockBatch();

      service.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      service.emitBatchListUpdate = jest
        .fn();

      service.processSyncSuccess([_mockBatch]);

      expect(service.syncErrors[0]['message']).toMatch(`Sync error: batch with id: '${_mockBatch.cid}' not found`);
    });

    test('should sync on connection (not login)', (done: jest.DoneCallback): void => {
      const _mockSyncResponse: SyncResponse<Batch> = mockSyncResponse<Batch>();
      const preError: SyncError = mockSyncError();
      preError.message = 'pre-error';
      const responseError: SyncError = mockSyncError();
      responseError.message = 'response-error';
      _mockSyncResponse.errors.push(responseError);

      service.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(true);

      service.generateSyncRequests = jest
        .fn()
        .mockReturnValue({ syncRequests: [], syncErrors: [ preError ] });

      service.syncService.sync = jest
        .fn()
        .mockReturnValue(of(_mockSyncResponse));

      service.processSyncSuccess = jest
        .fn();

      service.updateBatchStorage = jest
        .fn();

      service.errorReporter.handleGenericCatchError = jest
        .fn();

      const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateBatchStorage');

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
      const _mockSyncResponse: SyncResponse<Batch> = mockSyncResponse<Batch>();

      service.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(true);

      service.generateSyncRequests = jest
        .fn()
        .mockReturnValue({ syncRequests: [], syncErrors: [] });

      service.syncService.sync = jest
        .fn()
        .mockReturnValue(of(_mockSyncResponse));

      service.processSyncSuccess = jest
        .fn();

      service.updateBatchStorage = jest
        .fn();

      service.errorReporter.handleGenericCatchError = jest
        .fn();

      const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateBatchStorage');

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
      service.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(false);

      const genSpy: jest.SpyInstance = jest.spyOn(service, 'generateSyncRequests');

      service.syncOnConnection(false)
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
      service.syncOnConnection = jest
        .fn()
        .mockReturnValue(of({}));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.syncOnReconnect();

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('batch sync on reconnect complete');
        done();
      }, 10);
    });

    test('should get error when syncing on reconnect', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      service.syncOnConnection = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      service.errorReporter.handleUnhandledError = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.syncOnReconnect();

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

      service.getAllBatchesList = jest
        .fn()
        .mockReturnValue(_mockBatchList$);

      service.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      service.userService.getUser = jest
        .fn()
        .mockReturnValue(_mockUser$);

      service.configureBackgroundRequest = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      service.syncService.sync = jest
        .fn()
        .mockReturnValue(of(_mockSyncResponse));

      service.event.emit = jest
        .fn();

      service.processSyncSuccess = jest
        .fn();

      service.updateBatchStorage = jest
        .fn();

      service.idService.isMissingServerId = jest
        .fn()
        .mockReturnValue(false);

      const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateBatchStorage');
      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');

      service.syncOnSignup();

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

      service.getAllBatchesList = jest
        .fn()
        .mockReturnValue(_mockBatchList$);

      service.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(_mockRecipeMasterActive$);

      service.userService.getUser = jest
        .fn()
        .mockReturnValue(undefined);

      service.syncService.sync = jest
        .fn()
        .mockReturnValue(of(_mockSyncResponse));

      service.idService.isMissingServerId = jest
        .fn()
        .mockReturnValue(false);

      const syncSpy: jest.SpyInstance = jest.spyOn(service.syncService, 'sync');
      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');

      service.syncOnSignup();

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

      service.updateBatchStorage = jest
        .fn();

      service.addBatchToActiveList(_mockBatch)
        .subscribe(
          (): void => {
            expect(service.activeBatchList$.value[0].value).toStrictEqual(_mockBatch);
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

      service.getBatchById = jest
        .fn()
        .mockReturnValue(_mockBatch$);

      service.getBatchList = jest
        .fn()
        .mockReturnValue(_mockArchiveList$);

      service.updateBatchStorage = jest
        .fn();

      service.removeBatchFromList = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      service.archiveActiveBatch(_mockBatch.cid)
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

      service.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      service.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      service.archiveActiveBatch('error-id')
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
      service.connectionService.isConnected = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.userService.isLoggedIn = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.idService.hasDefaultIdType = jest
        .fn()
        .mockReturnValue(false);

      expect(service.canSendRequest(['1a2b3c4d5e', '6f7g8h9i10j'])).toBe(true);
      expect(service.canSendRequest()).toBe(false);
    });

    test('should clear a batch list', (): void => {
      const _mockBatch: Batch = mockBatch();

      service.storageService.removeBatches = jest
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

      service.getBatchList = jest
        .fn()
        .mockReturnValueOnce(activeList$)
        .mockReturnValueOnce(archiveList$);

      expect(activeList$.value.length).toEqual(2);

      service.clearBatchList(true);

      expect(activeList$.value.length).toEqual(0);
      expect(archiveList$.value.length).toEqual(3);

      service.clearBatchList(false);

      expect(archiveList$.value.length).toEqual(0);
    });

    test('should clear all batches', (): void => {
      service.clearBatchList = jest
        .fn();

      const clearSpy: jest.SpyInstance = jest.spyOn(service, 'clearBatchList');

      service.clearAllBatchLists();

      expect(clearSpy.mock.calls[0][0]).toBe(true);
      expect(clearSpy.mock.calls[1][0]).toBe(false);
    });

    test('should emit a batch list subject update', (): void => {
      const activeList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
      const archiveList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);

      service.getBatchList = jest
        .fn()
        .mockReturnValueOnce(activeList$)
        .mockReturnValueOnce(archiveList$);

      const nextActiveSpy: jest.SpyInstance = jest.spyOn(activeList$, 'next');
      const nextArchiveSpy: jest.SpyInstance = jest.spyOn(archiveList$, 'next');

      service.emitBatchListUpdate(true);
      expect(nextActiveSpy).toHaveBeenCalled();

      service.emitBatchListUpdate(false);
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

      service.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      service.idService.getNewId = jest
        .fn()
        .mockReturnValue('0123456789012');

      service.errorReporter.handleGenericCatchError = jest
        .fn();

      service.idService.getId = jest
        .fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(_mockRecipeMasterActive.variants[0]._id);

      service.idService.hasId = jest
        .fn()
        .mockReturnValue(true);

      service.utilService.clone = jest
        .fn()
        .mockImplementation((obj: any): any => obj);

      service.generateBatchFromRecipe(_mockUser._id, _mockRecipeMasterActive.cid, _mockRecipeMasterActive.variants[0].cid)
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

      service.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      service.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      service.generateBatchFromRecipe('user-id', 'rm-id', 'rv-id')
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

      service.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));

      service.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      service.errorReporter.handleGenericCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error).toStrictEqual(_mockError);
            return throwError(null);
          };
        });

      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      service.generateBatchFromRecipe('user-id', 'rm-id', 'rv-id')
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

      service.activeBatchList$ = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      service.archiveBatchList$ = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      const batchList: BehaviorSubject<Batch>[] = service.getAllBatchesList();

      expect(batchList.length).toEqual(3);
    });

    test('should get a batch by its id', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatchTarget: Batch = mockBatch();
      _mockBatchTarget.cid = '12345';

      service.getBatchList = jest
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

      service.idService.hasId = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const fromActive: BehaviorSubject<Batch> = service.getBatchById('12345');
      expect(fromActive.value).toStrictEqual(_mockBatchTarget);

      const fromArchive: BehaviorSubject<Batch> = service.getBatchById('12345');
      expect(fromArchive.value).toStrictEqual(_mockBatchTarget);

      const notFound: BehaviorSubject<Batch> = service.getBatchById('12345');
      expect(notFound).toBeUndefined();
    });

    test('should get a batch list', (): void => {
      const _mockBatch: Batch = mockBatch();

      service.activeBatchList$ = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      service.archiveBatchList$ = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      const fromActive: BehaviorSubject<BehaviorSubject<Batch>[]> = service.getBatchList(true);
      expect(fromActive.value.length).toEqual(2);

      const fromArchive: BehaviorSubject<BehaviorSubject<Batch>[]> = service.getBatchList(false);
      expect(fromArchive.value.length).toEqual(1);
    });

    test('should get a custom missing batch error', (): void => {
      const message: string = 'test-message';
      const additional: string = 'test-additional';
      const customError: CustomError = <CustomError>service.getMissingError(message, additional);
      expect(customError.name).toMatch('BatchError');
      expect(customError.message).toMatch(`${message} ${additional}`);
      expect(customError.severity).toEqual(2);
      expect(customError.userMessage).toMatch(message);
    });

    test('should convert array of batches to an array of behavior subjects of batches', (): void => {
      const _mockBatch: Batch = mockBatch();

      const batchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
      const subjectArray$: BehaviorSubject<Batch>[] = [
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch),
      ];
      service.getBatchList = jest
        .fn()
        .mockReturnValue(batchList$);

      service.utilService.toSubjectArray = jest
        .fn()
        .mockReturnValue(subjectArray$);

      service.mapBatchArrayToSubjectArray(true, [ _mockBatch, _mockBatch ]);

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

      service.getBatchList = jest
        .fn()
        .mockReturnValue(batchList$);

      service.updateBatchStorage = jest
        .fn();

      service.idService.getIndexById = jest
        .fn()
        .mockReturnValue(1);

      service.removeBatchFromList(true, '12345')
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

      service.getBatchList = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<BehaviorSubject<Batch>[]>([]));

      service.getMissingError = jest
        .fn()
        .mockReturnValue(_mockError);

      service.idService.getIndexById = jest
        .fn()
        .mockReturnValue(-1);

      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      service.removeBatchFromList(true, '0')
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


  describe('Auto Generation Functions', (): void => {

    test('should auto set boil duration', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
      const boilIndex: number = 7;
      (<TimerProcess>_mockProcessSchedule[boilIndex]).duration = 60;
      service.getProcessIndex = jest.fn()
        .mockReturnValueOnce(-1)
        .mockReturnValueOnce(boilIndex);
      service.idService.getNewId = jest.fn()
        .mockReturnValue('1');
      service.autoSetHopsAdditions = jest.fn();
      const autoSpy: jest.SpyInstance = jest.spyOn(service, 'autoSetHopsAdditions');

      service.autoSetBoilDuration(_mockProcessSchedule, 90, _mockHopsSchedule);
      expect(_mockProcessSchedule[_mockProcessSchedule.length - 1]).toStrictEqual({
        cid: '1',
        type: 'timer',
        name: 'Boil',
        description: 'Boil wort',
        duration: 90,
        concurrent: false,
        splitInterval: 1
      });
      expect(autoSpy).not.toHaveBeenCalled();

      service.autoSetBoilDuration(_mockProcessSchedule, 100, _mockHopsSchedule);
      expect((<TimerProcess>_mockProcessSchedule[boilIndex]).duration).toEqual(100);
      expect(autoSpy).toHaveBeenCalled();
    });

    test('should get process index', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const mockMashIndex: number = 2;
      const mockPitchIndex: number = 11;
      const mashIndex: number = service.getProcessIndex(_mockProcessSchedule, 'name', 'Mash');
      expect(mashIndex).toEqual(mockMashIndex);
      const pitchIndex: number = service.getProcessIndex(_mockProcessSchedule, 'name', 'Pitch yeast');
      expect(pitchIndex).toEqual(mockPitchIndex);
    });

    test('should auto set hops additions', (): void => {
      const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const boilIndex: number = 7;
      (<TimerProcess>_mockProcessSchedule[boilIndex]).duration = 60;
      const newHopsProcesses: TimerProcess[] = [
        {
          cid: '1',
          type: 'timer',
          name: 'Add mock hops 1',
          concurrent: true,
          description: 'mock description 1',
          duration: 0,
          splitInterval: 1
        },
        {
          cid: '2',
          type: 'timer',
          name: 'Add mock hops 2',
          concurrent: true,
          description: 'mock description 2',
          duration: 30,
          splitInterval: 1
        }
      ];
      expect(boilIndex).not.toEqual(-1);
      service.generateHopsProcesses = jest.fn()
        .mockReturnValue(newHopsProcesses);
      service.getProcessIndex = jest.fn()
        .mockReturnValueOnce(-1)
        .mockReturnValueOnce(boilIndex)
        .mockReturnValueOnce(boilIndex - 2);

      expect(service.autoSetHopsAdditions(_mockProcessSchedule, 60, _mockHopsSchedule))
        .toStrictEqual(_mockProcessSchedule);
      const newSchedule: Process[] = service.autoSetHopsAdditions(
        _mockProcessSchedule,
        60,
        _mockHopsSchedule
      );
      expect(newSchedule[boilIndex - 2]).toStrictEqual(newHopsProcesses[0]);
      expect(newSchedule[boilIndex - 1]).toStrictEqual(newHopsProcesses[1]);
    });

    test('should auto set mash duration', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const mashIndex: number = 2;
      (<TimerProcess>_mockProcessSchedule[mashIndex]).duration = 60;
      service.getProcessIndex = jest.fn()
        .mockReturnValueOnce(-1)
        .mockReturnValueOnce(mashIndex);
      service.idService.getNewId = jest.fn()
        .mockReturnValue('1');

      service.autoSetMashDuration(_mockProcessSchedule, 90);
      expect(_mockProcessSchedule[_mockProcessSchedule.length - 1]).toStrictEqual({
        cid: '1',
        type: 'timer',
        name: 'Mash',
        description: 'Mash grains',
        duration: 90,
        concurrent: false,
        splitInterval: 1
      });

      service.autoSetMashDuration(_mockProcessSchedule, 120);
      expect((<TimerProcess>_mockProcessSchedule[mashIndex]).duration).toEqual(120);
    });

    test('should format hops step description', (): void => {
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
      const _mockMetricUnits: SelectedUnits = mockMetricUnits();
      const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
      _mockHopsSchedule.quantity = 2;
      service.preferenceService.getSelectedUnits = jest.fn()
        .mockReturnValueOnce(_mockEnglishUnits)
        .mockReturnValueOnce(_mockMetricUnits);
      service.calculator.requiresConversion = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      service.calculator.convertWeight = jest.fn()
        .mockImplementation((value: number, ...options: any[]): number => value * 2);
      service.utilService.roundToDecimalPlace = jest.fn()
        .mockImplementation((value: number, places: number): number => {
          return Math.floor(value);
        });

      expect(service.formatHopsDescription(_mockHopsSchedule)).toMatch('Hops addition: 2oz');
      expect(service.formatHopsDescription(_mockHopsSchedule)).toMatch('Hops addition: 4g');
    });

    test('should generate hops processes based on hops schedule', (): void => {
      const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
      service.idService.getNewId = jest.fn()
        .mockReturnValue('1');
      service.formatHopsDescription = jest.fn()
        .mockReturnValue('');

      const processes: Process[] = service.generateHopsProcesses(_mockHopsSchedule, 60);
      expect(processes.length).toEqual(3);
      processes.forEach((process: Process, index: number): void => {
        expect(process.name).toMatch(`Add ${_mockHopsSchedule[index].hopsType.name} hops`);
      });
    });


  });


  describe('Storage Methods', (): void => {

    test('should update batch storage', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      service.getBatchList = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<BehaviorSubject<Batch>[]>([
          new BehaviorSubject<Batch>(_mockBatch)
        ]));

      service.storageService.setBatches = jest
        .fn()
        .mockReturnValue(of(null));

      const storeSpy: jest.SpyInstance = jest.spyOn(service.storageService, 'setBatches');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.updateBatchStorage(true);

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(true, [_mockBatch]);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('stored active batches');
        done();
      }, 10);
    });

    test('should get an error updating batch storage', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      service.getBatchList = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<BehaviorSubject<Batch>[]>([]));

      service.storageService.setBatches = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      service.errorReporter.handleUnhandledError = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storageService, 'setBatches');

      service.updateBatchStorage(true);

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
      service.isSafeBatch = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const _mockError: Error = new Error('test-error');
      service.getUnsafeError = jest
        .fn()
        .mockReturnValue(_mockError);

      service.checkTypeSafety(_mockBatch);
      expect((): void => {
        service.checkTypeSafety(null);
      }).toThrow(_mockError);
    });

    test('should get a type unsafe error', (): void => {
      const _mockCheck: any = { mock: false };
      const customError: CustomError = <CustomError>service.getUnsafeError(_mockCheck);
      expect(customError.name).toMatch('BatchError');
      expect(customError.message).toMatch(`Batch is invalid: got {\n  "mock": false\n}`);
      expect(customError.severity).toEqual(2);
      expect(customError.userMessage).toMatch('An internal error occurred: invalid batch');
    });

    test('should check if alerts are type safe', (): void => {
      const _mockAlert: Alert = mockAlert();

      service.typeGuard.hasValidProperties = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const guardSpy: jest.SpyInstance = jest.spyOn(service.typeGuard, 'hasValidProperties');

      expect(service.isSafeAlerts([_mockAlert, _mockAlert])).toBe(true);
      expect(service.isSafeAlerts([_mockAlert, _mockAlert])).toBe(false);
      expect(guardSpy).toHaveBeenCalledWith(_mockAlert, AlertGuardMetadata);
    });

    test('should check if batch is type safe', (): void => {
      const _mockBatch: Batch = mockBatch();
      service.typeGuard.hasValidProperties = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.isSafeBatchAnnotations = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.isSafeBatchContext = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.isSafeBatchProcess = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const guardSpy: jest.SpyInstance = jest.spyOn(service.typeGuard, 'hasValidProperties');

      expect(service.isSafeBatch(_mockBatch)).toBe(true);
      expect(service.isSafeBatch(_mockBatch)).toBe(false);
      expect(service.isSafeBatch(_mockBatch)).toBe(false);
      expect(service.isSafeBatch(_mockBatch)).toBe(false);
      expect(service.isSafeBatch(_mockBatch)).toBe(false);
      expect(guardSpy).toHaveBeenCalledWith(_mockBatch, BatchGuardMetadata);
    });

    test('should check if batch annotations are type safe', (): void => {
      const _mockBatchAnnotations: BatchAnnotations = mockBatch().annotations;

      service.typeGuard.hasValidProperties = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.isSafePrimaryValues = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      const guardSpy: jest.SpyInstance = jest.spyOn(service.typeGuard, 'hasValidProperties');

      expect(service.isSafeBatchAnnotations(_mockBatchAnnotations)).toBe(true);
      expect(service.isSafeBatchAnnotations(_mockBatchAnnotations)).toBe(false);
      expect(service.isSafeBatchAnnotations(_mockBatchAnnotations)).toBe(false);
      expect(service.isSafeBatchAnnotations(_mockBatchAnnotations)).toBe(false);
      expect(guardSpy).toHaveBeenCalledWith(_mockBatchAnnotations, BatchAnnotationsGuardMetadata);
    });

    test('should check if batch context is type safe', (): void => {
      const _mockBatchContext: BatchContext = mockBatch().contextInfo;
      service.typeGuard.hasValidProperties = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.recipeService.isSafeGrainBillCollection = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.recipeService.isSafeHopsScheduleCollection = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.recipeService.isSafeYeastBatchCollection = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.recipeService.isSafeOtherIngredientsCollection = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const guardSpy: jest.SpyInstance = jest.spyOn(service.typeGuard, 'hasValidProperties');

      expect(service.isSafeBatchContext(_mockBatchContext)).toBe(true);
      expect(service.isSafeBatchContext(_mockBatchContext)).toBe(false);
      expect(service.isSafeBatchContext(_mockBatchContext)).toBe(false);
      expect(service.isSafeBatchContext(_mockBatchContext)).toBe(false);
      expect(service.isSafeBatchContext(_mockBatchContext)).toBe(false);
      expect(service.isSafeBatchContext(_mockBatchContext)).toBe(false);
      expect(guardSpy).toHaveBeenCalledWith(_mockBatchContext, BatchContextGuardMetadata);
    });

    test('should check if batch context is type safe', (): void => {
      const _mockBatchProcess: BatchProcess = mockBatch().process;
      service.typeGuard.hasValidProperties = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.isSafeProcessSchedule = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      service.isSafeAlerts = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const guardSpy: jest.SpyInstance = jest.spyOn(service.typeGuard, 'hasValidProperties');

      expect(service.isSafeBatchProcess(_mockBatchProcess)).toBe(true);
      expect(service.isSafeBatchProcess(_mockBatchProcess)).toBe(false);
      expect(service.isSafeBatchProcess(_mockBatchProcess)).toBe(false);
      expect(service.isSafeBatchProcess(_mockBatchProcess)).toBe(false);
      expect(guardSpy).toHaveBeenCalledWith(_mockBatchProcess, BatchProcessGuardMetadata);
    });

    test('should check if primary values are type safe', (): void => {
      const _mockPrimaryValues: PrimaryValues = mockPrimaryValues();

      service.typeGuard.hasValidProperties = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const guardSpy: jest.SpyInstance = jest.spyOn(service.typeGuard, 'hasValidProperties');

      expect(service.isSafePrimaryValues(_mockPrimaryValues)).toBe(true);
      expect(service.isSafePrimaryValues(_mockPrimaryValues)).toBe(false);
      expect(guardSpy).toHaveBeenCalledWith(_mockPrimaryValues, PrimaryValuesGuardMetadata);
    });

    test('should check if process schedule items are type safe', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();

      service.recipeService.isSafeProcessSchedule = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      expect(service.isSafeProcessSchedule(_mockProcessSchedule)).toBe(true);
      expect(service.isSafeProcessSchedule(_mockProcessSchedule)).toBe(false);
    });

  });

});
