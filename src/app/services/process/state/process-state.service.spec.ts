/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

/* TestBed configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockBatch, mockGeneratedBatch, mockRecipeMasterActive, mockRecipeVariantComplete, mockUser } from '@test/mock-models';
import { ConnectionServiceStub, ErrorReportingServiceStub, EventServiceStub, IdServiceStub, ProcessHttpServiceStub, ProcessSyncServiceStub, ProcessTypeGuardServiceStub, RecipeServiceStub, StorageServiceStub, UserServiceStub, UtilityServiceStub } from '@test/service-stubs';

/* Constants imports */
import { HIGH_SEVERITY } from '@shared/constants';

/* Interface imports */
import { Batch, BatchAnnotations, BatchContext, BatchProcess, PrimaryValues, Process, RecipeMaster, RecipeVariant, User } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ProcessHttpService } from '@services/process/http/process-http.service';
import { ProcessSyncService } from '@services/process/sync/process-sync.service';
import { ProcessTypeGuardService } from '@services/process/type-guard/process-type-guard.service';
import { ConnectionService, ErrorReportingService, EventService, IdService, RecipeService, StorageService, UserService, UtilityService } from '@services/public';
import { ProcessStateService } from './process-state.service';


describe('ProcessStateService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: ProcessStateService;
  let originalRegister: any;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        ProcessStateService,
        { provide: ConnectionService, useClass: ConnectionServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: EventService, useClass: EventServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ProcessHttpService, useClass: ProcessHttpServiceStub },
        { provide: ProcessSyncService, useClass: ProcessSyncServiceStub },
        { provide: ProcessTypeGuardService, useClass: ProcessTypeGuardServiceStub },
        { provide: RecipeService, useClass: RecipeServiceStub },
        { provide: StorageService, useClass: StorageServiceStub },
        { provide: UserService, useClass: UserServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(ProcessStateService);
    originalRegister = service.registerEvents;
    service.registerEvents = jest.fn();
    service.errorReporter.handleUnhandledError = jest.fn();
    service.idService.hasId = jest.fn()
      .mockImplementation((obj: any, id: string): boolean => obj['_id'] === id || obj['cid'] === id);
    service.utilService.clone = jest.fn()
      .mockImplementation((source: any): any => JSON.parse(JSON.stringify(source)));
    service.processTypeGuardService.checkTypeSafety = jest.fn();
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  describe('Initializations', (): void => {

    test('should init batches from server', (done: jest.DoneCallback): void => {
      service.canSendRequest = jest.fn().mockReturnValue(true);
      service.syncOnConnection = jest.fn().mockReturnValue(of(null));
      const _mockBatchActive: Batch = mockBatch();
      const _mockBatchArchive: Batch = mockBatch();
      _mockBatchArchive.isArchived = true;
      service.processHttpService.getAllBatches = jest.fn()
        .mockReturnValue(
          of({ activeBatches: [_mockBatchActive], archiveBatches: [_mockBatchArchive]})
        );
      service.mapBatchArrayToSubjectArray = jest.fn();
      service.updateBatchStorage = jest.fn();
      const mapSpy: jest.SpyInstance = jest.spyOn(service, 'mapBatchArrayToSubjectArray');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateBatchStorage');

      service.initFromServer()
        .subscribe(
          (results: null): void => {
            expect(results).toBeNull();
            expect(mapSpy).toHaveBeenNthCalledWith(1, true, [_mockBatchActive]);
            expect(mapSpy).toHaveBeenNthCalledWith(2, false, [_mockBatchArchive]);
            expect(updateSpy).toHaveBeenNthCalledWith(1, true);
            expect(updateSpy).toHaveBeenNthCalledWith(2, false);
            done();
          },
          (error: any): void => {
            console.log('Error in: should init batches from server', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should skip init from server if request cannot be sent', (done: jest.DoneCallback): void => {
      service.canSendRequest = jest.fn().mockReturnValue(false);

      service.initFromServer()
        .subscribe(
          (results: null): void => {
            expect(results).toBeNull();
            done();
          },
          (error: any): void => {
            console.log('Error in: should skip init from server if request cannot be sent', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should init batches from storage', (done: jest.DoneCallback): void => {
      const _mockBatchActive: Batch = mockBatch();
      const _mockBatchArchive: Batch = mockBatch();
      _mockBatchArchive.isArchived = true;
      service.storageService.getBatches = jest.fn()
        .mockReturnValueOnce(of([_mockBatchActive]))
        .mockReturnValueOnce(of([_mockBatchArchive]));
      service.mapBatchArrayToSubjectArray = jest.fn();
      const mapSpy: jest.SpyInstance = jest.spyOn(service, 'mapBatchArrayToSubjectArray');

      service.initFromStorage()
        .subscribe(
          (results: null): void => {
            expect(results).toBeNull();
            expect(mapSpy).toHaveBeenNthCalledWith(1, true, [_mockBatchActive]);
            expect(mapSpy).toHaveBeenNthCalledWith(2, false, [_mockBatchArchive]);
            done();
          },
          (error: any): void => {
            console.log('Error in: should init batches from storage', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should init batch lists', (done: jest.DoneCallback): void => {
      service.initFromStorage = jest.fn().mockReturnValue(of(null));
      service.initFromServer = jest.fn().mockReturnValue(of(null));
      service.event.emit = jest.fn();
      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.initBatchLists();

      setTimeout((): void => {
        expect(emitSpy).toHaveBeenCalledWith('init-inventory');
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('batch init complete');
        done();
      }, 10);
    });

    test('should register events', (): void => {
      const mockSubjects: Subject<object>[] = Array.from(Array(4), () => new Subject<object>());
      let counter = 0;
      service.event.register = jest.fn()
        .mockImplementation(() => mockSubjects[counter++]);
      service.initBatchLists = jest.fn();
      service.clearAllBatchLists = jest.fn();
      service.syncOnSignup = jest.fn();
      service.syncOnConnection = jest.fn().mockResolvedValue(of(null));
      const spies: jest.SpyInstance[] = [
        jest.spyOn(service, 'initBatchLists'),
        jest.spyOn(service, 'clearAllBatchLists'),
        jest.spyOn(service, 'syncOnSignup'),
        jest.spyOn(service, 'syncOnConnection')
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


  describe('Sync Calls', (): void => {

    test('should perform sync on signup', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      const batchList: BehaviorSubject<Batch>[] = [_mockBatch$];
      service.getAllBatchesList = jest.fn().mockReturnValue(batchList);
      service.processSyncService.syncOnSignup = jest.fn().mockReturnValue(of(batchList));
      service.setBatchLists = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setBatchLists');

      service.syncOnSignup();

      setTimeout((): void => {
        expect(setSpy).toHaveBeenCalledWith(batchList);
        done();
      });
    });

    test('should catch error on sync on signup', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      const batchList: BehaviorSubject<Batch>[] = [_mockBatch$];
      service.getAllBatchesList = jest.fn().mockReturnValue(batchList);
      const _mockError: Error = new Error('test-error');
      service.processSyncService.syncOnSignup = jest.fn().mockReturnValue(throwError(_mockError));
      service.setBatchLists = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setBatchLists');
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.syncOnSignup();

      setTimeout((): void => {
        expect(setSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      });
    });

    test('should perform sync on connection', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      const batchList: BehaviorSubject<Batch>[] = [_mockBatch$];
      service.getAllBatchesList = jest.fn().mockReturnValue(batchList);
      service.processSyncService.syncOnConnection = jest.fn().mockReturnValue(of(batchList));
      service.setBatchLists = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setBatchLists');

      service.syncOnConnection(true)
        .subscribe(
          (results: null): void => {
            expect(results).toBeNull();
            expect(setSpy).toHaveBeenCalledWith(batchList);
            done();
          },
          (error: any): void => {
            console.log('Error in: should perform sync on connect', error);
            expect(true).toBe(false);
          }
        );
    });

  });


  describe('Http Handlers', (): void => {

    test('should send a background request', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      service.processHttpService.requestInBackground = jest.fn()
        .mockReturnValue(of(_mockBatch));
      service.idService.getId = jest.fn().mockReturnValue(_mockBatch.cid);
      service.canSendRequest = jest.fn().mockReturnValue(true);
      const sendSpy: jest.SpyInstance = jest.spyOn(service, 'canSendRequest');
      service.handleBackgroundUpdateResponse = jest.fn();
      const handleSpy: jest.SpyInstance = jest.spyOn(service, 'handleBackgroundUpdateResponse');

      service.sendBackgroundRequest('patch', _mockBatch);

      setTimeout((): void => {
        expect(sendSpy).toHaveBeenCalledWith([_mockBatch.cid]);
        expect(handleSpy).toHaveBeenCalledWith(_mockBatch, false);
        done();
      });
    });

    test('should store a sync flag', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      service.processSyncService.convertRequestMethodToSyncMethod = jest.fn()
        .mockReturnValue('create');
      service.processSyncService.addSyncFlag = jest.fn();
      service.idService.getId = jest.fn().mockReturnValue(_mockBatch.cid);
      service.canSendRequest = jest.fn().mockReturnValue(false);
      const sendSpy: jest.SpyInstance = jest.spyOn(service, 'canSendRequest');
      const requestSpy: jest.SpyInstance = jest.spyOn(service.processHttpService, 'requestInBackground');
      const addSpy: jest.SpyInstance = jest.spyOn(service.processSyncService, 'addSyncFlag');

      service.sendBackgroundRequest('post', _mockBatch);

      setTimeout((): void => {
        expect(sendSpy).toHaveBeenCalledWith([]);
        expect(requestSpy).not.toHaveBeenCalled();
        expect(addSpy).toHaveBeenCalledWith('create', _mockBatch.cid);
        done();
      });
    });

    test('should handle an error sending a background request', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockError: Error = new Error('test-error');
      service.processHttpService.requestInBackground = jest.fn()
        .mockReturnValue(throwError(_mockError));
      service.idService.getId = jest.fn().mockReturnValue(_mockBatch.cid);
      service.canSendRequest = jest.fn().mockReturnValue(true);
      const sendSpy: jest.SpyInstance = jest.spyOn(service, 'canSendRequest');
      service.handleBackgroundUpdateResponse = jest.fn();
      const handleSpy: jest.SpyInstance = jest.spyOn(service, 'handleBackgroundUpdateResponse');
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.sendBackgroundRequest('patch', _mockBatch);

      setTimeout((): void => {
        expect(sendSpy).toHaveBeenCalledWith([_mockBatch.cid]);
        expect(handleSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      });
    });

    test('should handle a background response', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      service.getBatchSubjectById = jest.fn().mockReturnValue(_mockBatch$);
      const _mockNewBatch: Batch = mockBatch();
      service.emitBatchListUpdate = jest.fn();
      const emitSpy: jest.SpyInstance = jest.spyOn(service, 'emitBatchListUpdate');

      service.handleBackgroundUpdateResponse(_mockNewBatch, false);

      expect(_mockBatch$.value).toStrictEqual(_mockNewBatch);
      expect(emitSpy).toHaveBeenCalledWith(!_mockNewBatch.isArchived);
    });

    test('should throw an error handling a background response if the batch cannot be found', (): void => {
      service.idService.getId = jest.fn().mockReturnValue('test-id');
      service.getBatchSubjectById = jest.fn().mockReturnValue(undefined);
      const _mockError: Error = new Error('test-error');
      service.getMissingError = jest.fn().mockReturnValue(_mockError);
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      expect((): void => {
        service.handleBackgroundUpdateResponse(null, false);
      }).toThrowError(_mockError);
      expect(getSpy).toHaveBeenCalledWith('update', 'test-id');
    });

  });


  describe('State Handlers', (): void => {

    test('should add a batch to active list', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      service.updateBatchStorage = jest.fn();

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
      service.getBatchSubjectById = jest.fn().mockReturnValue(_mockBatch$);
      service.getBatchList = jest.fn().mockReturnValue(_mockArchiveList$);
      service.updateBatchStorage = jest.fn();
      service.removeBatchFromList = jest.fn().mockReturnValue(of(_mockBatch));

      service.archiveActiveBatch(_mockBatch.cid)
        .subscribe(
          (): void => {
            expect(_mockArchiveList$.value.length).toEqual(1);
            done();
          },
          (error: any): void => {
            console.log('Error in: should archive an active batch', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error archiving missing active batch', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.getBatchById = jest.fn().mockReturnValue(undefined);
      service.getMissingError = jest.fn().mockReturnValue(_mockError);
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

    test('should clear a batch list', (): void => {
      const _mockBatch: Batch = mockBatch();
      service.storageService.removeBatches = jest.fn();
      const activeList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);
      const archiveList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);
      service.getBatchList = jest.fn()
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
      service.clearBatchList = jest.fn();
      const clearSpy: jest.SpyInstance = jest.spyOn(service, 'clearBatchList');

      service.clearAllBatchLists();

      expect(clearSpy.mock.calls[0][0]).toBe(true);
      expect(clearSpy.mock.calls[1][0]).toBe(false);
    });

    test('should emit a batch list subject update', (): void => {
      const activeList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
      const archiveList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
      service.getBatchList = jest.fn()
        .mockReturnValueOnce(activeList$)
        .mockReturnValueOnce(archiveList$);
      const nextActiveSpy: jest.SpyInstance = jest.spyOn(activeList$, 'next');
      const nextArchiveSpy: jest.SpyInstance = jest.spyOn(archiveList$, 'next');

      service.emitBatchListUpdate(true);
      expect(nextActiveSpy).toHaveBeenCalled();

      service.emitBatchListUpdate(false);
      expect(nextArchiveSpy).toHaveBeenCalled();
    });

    test('should generate batch annotations from recipe', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      const annotations: BatchAnnotations = service.generateBatchAnnotations(
        _mockRecipeMasterActive,
        _mockRecipeVariantComplete
      );

      expect(annotations.styleId).toMatch(_mockRecipeMasterActive.style._id);
      const { targetValues }: { targetValues: PrimaryValues } = annotations;
      expect(targetValues.efficiency).toEqual(_mockRecipeVariantComplete.efficiency);
      expect(targetValues.originalGravity).toEqual(_mockRecipeVariantComplete.originalGravity);
      expect(targetValues.finalGravity).toEqual(_mockRecipeVariantComplete.finalGravity);
      expect(targetValues.batchVolume).toEqual(_mockRecipeVariantComplete.batchVolume);
      expect(targetValues.ABV).toEqual(_mockRecipeVariantComplete.ABV);
      expect(targetValues.IBU).toEqual(_mockRecipeVariantComplete.IBU);
      expect(targetValues.SRM).toEqual(_mockRecipeVariantComplete.SRM);
      const { measuredValues }: { measuredValues: PrimaryValues } = annotations;
      expect(measuredValues.efficiency).toEqual(-1);
      expect(measuredValues.originalGravity).toEqual(-1);
      expect(measuredValues.finalGravity).toEqual(-1);
      expect(measuredValues.batchVolume).toEqual(-1);
      expect(measuredValues.ABV).toEqual(-1);
      expect(measuredValues.IBU).toEqual(-1);
      expect(measuredValues.SRM).toEqual(-1);
      expect(annotations.notes.length).toEqual(0);
    });

    test('should generate batch context from recipe', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      const context: BatchContext = service.generateBatchContext(
        _mockRecipeMasterActive,
        _mockRecipeVariantComplete
      );

      expect(context.recipeMasterName).toMatch(_mockRecipeMasterActive.name);
      expect(context.recipeVariantName).toMatch(_mockRecipeVariantComplete.variantName);
      expect(context.recipeImage).toStrictEqual(_mockRecipeMasterActive.labelImage);
      expect(context.batchVolume).toEqual(_mockRecipeVariantComplete.batchVolume);
      expect(context.boilVolume).toEqual(_mockRecipeVariantComplete.boilVolume);
      expect(context.grains).toStrictEqual(_mockRecipeVariantComplete.grains);
      expect(context.hops).toStrictEqual(_mockRecipeVariantComplete.hops);
      expect(context.yeast).toStrictEqual(_mockRecipeVariantComplete.yeast);
      expect(context.otherIngredients).toStrictEqual(_mockRecipeVariantComplete.otherIngredients);
    });

    test('should generate batch process from a recipe', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      const process: BatchProcess = service.generateBatchProcess(_mockRecipeVariantComplete);

      expect(process.currentStep).toEqual(0);
      expect(process.alerts.length).toEqual(0);
      expect(process.schedule.length).toEqual(_mockRecipeVariantComplete.processSchedule.length);
      const testIndex: number = process.schedule.length / 2;
      const sample: Process = process.schedule[testIndex];
      Object.assign(
        sample,
        {
          _id: _mockRecipeVariantComplete.processSchedule[testIndex]._id,
          cid: _mockRecipeVariantComplete.processSchedule[testIndex].cid
        }
      );
      const expected: Process = _mockRecipeVariantComplete.processSchedule[testIndex];
      expect(sample).toStrictEqual(expected);
    });

    test('should generate batch from a recipe', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockBatch: Batch = mockGeneratedBatch();
      global.Date.prototype.toISOString = jest.fn()
        .mockImplementation(() => '2020-01-01T00:00:00.000Z');
      expect((new Date()).toISOString()).toMatch('2020-01-01T00:00:00.000Z');
      service.recipeService.getRecipeMasterById = jest.fn()
        .mockReturnValue(_mockRecipeMasterActive$);
      service.idService.getNewId = jest.fn().mockReturnValue('0123456789012');
      service.errorReporter.handleGenericCatchError = jest.fn();
      service.idService.getId = jest.fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(_mockRecipeMasterActive.variants[0]._id);
      service.idService.hasId = jest.fn().mockReturnValue(true);
      service.generateBatchAnnotations = jest.fn().mockReturnValue(_mockBatch.annotations);
      service.generateBatchProcess = jest.fn().mockReturnValue(_mockBatch.process);
      service.generateBatchContext = jest.fn().mockReturnValue(_mockBatch.contextInfo);
      service.addBatchToActiveList = jest.fn().mockReturnValue(of(_mockBatch));
      service.setBatch = jest.fn();
      service.sendBackgroundRequest = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(service, 'addBatchToActiveList');
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setBatch');
      const sendSpy: jest.SpyInstance = jest.spyOn(service, 'sendBackgroundRequest');

      service.generateBatchFromRecipe(_mockUser._id, _mockRecipeMasterActive.cid, _mockRecipeMasterActive.variants[0].cid)
        .subscribe(
          (batch: Batch): void => {
            expect(batch).toStrictEqual(_mockBatch);
            expect(addSpy).toHaveBeenCalledWith(_mockBatch);
            expect(setSpy).toHaveBeenCalledWith(_mockBatch, true);
            expect(sendSpy).toHaveBeenCalledWith('post', _mockBatch);
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
      service.recipeService.getRecipeMasterById = jest.fn().mockReturnValue(undefined);
      service.getMissingError = jest.fn().mockReturnValue(_mockError);
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

    test('should get error generating new batch from missing recipe variant', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      service.recipeService.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.idService.hasId = jest.fn().mockReturnValue(false);
      service.getMissingError = jest.fn().mockReturnValue(_mockError);
      service.errorReporter.handleGenericCatchError = jest.fn().mockReturnValue((error: any): any => throwError(error));
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      service.generateBatchFromRecipe('user-id', 'rm-id', 'rv-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(errorSpy).toHaveBeenCalledWith(
              'An error occurring trying to generate batch from recipe: missing variant',
              'Recipe master with id rm-id was found, but variant with id rv-id not found'
            );
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

    test('should get combined active and archive batches list', (): void => {
      const _mockBatch: Batch = mockBatch();
      service.getBatchList = jest.fn()
        .mockReturnValueOnce(
          new BehaviorSubject<BehaviorSubject<Batch>[]>([
          new BehaviorSubject<Batch>(_mockBatch),
          new BehaviorSubject<Batch>(_mockBatch)
        ])
      )
      .mockReturnValueOnce(
        new BehaviorSubject<BehaviorSubject<Batch>[]>([
          new BehaviorSubject<Batch>(_mockBatch)
        ])
      );
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBatchList');

      const batchList: BehaviorSubject<Batch>[] = service.getAllBatchesList();

      expect(batchList.length).toEqual(3);
      expect(getSpy).toHaveBeenNthCalledWith(1, true);
      expect(getSpy).toHaveBeenNthCalledWith(2, false);
    });

    test('should get a batch by its id', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      service.getBatchSubjectById = jest.fn().mockReturnValue(_mockBatch$);
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBatchSubjectById');

      expect(service.getBatchById(_mockBatch.cid)).toStrictEqual(_mockBatch);
      expect(getSpy).toHaveBeenCalledWith(_mockBatch.cid);
    });

    test('should get a batch subject by its id', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatchTarget: Batch = mockBatch();
      _mockBatchTarget.cid = '12345';
      service.getBatchList = jest.fn()
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
      service.idService.hasId = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const fromActive: BehaviorSubject<Batch> = service.getBatchSubjectById('12345');
      expect(fromActive.value).toStrictEqual(_mockBatchTarget);

      const fromArchive: BehaviorSubject<Batch> = service.getBatchSubjectById('12345');
      expect(fromArchive.value).toStrictEqual(_mockBatchTarget);

      const notFound: BehaviorSubject<Batch> = service.getBatchSubjectById('12345');
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
      const customError: CustomError = service.getMissingError(message, additional);
      expect(customError.name).toMatch('BatchError');
      expect(customError.message).toMatch(`${message} ${additional}`);
      expect(customError.severity).toEqual(HIGH_SEVERITY);
      expect(customError.userMessage).toMatch(message);
    });

    test('should convert array of batches to an array of behavior subjects of batches', (): void => {
      const _mockBatch: Batch = mockBatch();
      const batchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
      const subjectArray$: BehaviorSubject<Batch>[] = [
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch),
      ];
      service.getBatchList = jest.fn().mockReturnValue(batchList$);
      service.utilService.toSubjectArray = jest.fn().mockReturnValue(subjectArray$);

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
      service.getBatchList = jest.fn().mockReturnValue(batchList$);
      service.utilService.getArrayFromSubjects = jest.fn().mockReturnValue([
        _mockBatch,
        _mockBatchTarget,
        _mockBatch
      ]);
      service.updateBatchStorage = jest.fn();
      service.idService.getIndexById = jest.fn().mockReturnValue(1);

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

    test('should do nothing when removing a batch from the list that does not exist', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const batchList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);
      service.getBatchList = jest.fn().mockReturnValue(batchList$);
      service.utilService.getArrayFromSubjects = jest.fn().mockReturnValue([
        _mockBatch,
        _mockBatch
      ]);
      service.updateBatchStorage = jest.fn();
      service.idService.getIndexById = jest.fn().mockReturnValue(-1);
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateBatchStorage');

      service.removeBatchFromList(true, 'not-found')
        .subscribe(
          (results: any): void => {
            expect(results).toBeNull();
            expect(batchList$.value.length).toEqual(2);
            expect(updateSpy).not.toHaveBeenCalled();
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should remove a batch from the list'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should set the batch lists with given lists', (): void => {
      const _mockBatchActive1: Batch = mockBatch();
      _mockBatchActive1.isArchived = false;
      const _mockBatchActive2: Batch = mockBatch();
      _mockBatchActive2.isArchived = false;
      const _mockBatchArchive: Batch = mockBatch();
      _mockBatchArchive.isArchived = true;
      const _mockBatchActive1$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatchActive1);
      const _mockBatchActive2$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatchActive2);
      const _mockBatchArchive$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatchArchive);
      const activeList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
      const archiveList$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
      service.getBatchList = jest.fn()
        .mockReturnValueOnce(activeList$)
        .mockReturnValueOnce(archiveList$);
      service.updateBatchStorage = jest.fn();

      service.setBatchLists([_mockBatchActive1$, _mockBatchArchive$, _mockBatchActive2$]);

      expect(activeList$.value.length).toEqual(2);
      expect(archiveList$.value.length).toEqual(1);
    });

    test('should set a batch in a list', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      const _mockNewBatch: Batch = mockBatch();
      _mockNewBatch.cid += '1';
      service.getBatchSubjectById = jest.fn().mockReturnValue(_mockBatch$);
      service.idService.getId = jest.fn().mockReturnValue('');
      service.emitBatchListUpdate = jest.fn();
      service.updateBatchStorage = jest.fn();
      const emitSpy: jest.SpyInstance = jest.spyOn(service, 'emitBatchListUpdate');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateBatchStorage');

      service.setBatch(_mockNewBatch, true);
      expect(_mockBatch$.value).toStrictEqual(_mockNewBatch);
      expect(emitSpy).toHaveBeenCalledWith(true);
      expect(updateSpy).toHaveBeenCalledWith(true);
    });

    test('should throw an error if batch to update is not found', (): void => {
      const _mockBatch: Batch = mockBatch();
      service.getBatchSubjectById = jest.fn().mockReturnValue(undefined);
      const _mockError: Error = new Error('test-error');
      service.getMissingError = jest.fn().mockReturnValue(_mockError);
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      expect((): void => {
        service.setBatch(_mockBatch, true);
      }).toThrowError(_mockError);
      expect(getSpy).toHaveBeenCalledWith(
        'An error occurring trying to update a batch',
        `Batch with id ${_mockBatch.cid} not found`
      );
    });

  });

  describe('Storage Methods', (): void => {

    test('should update batch storage', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      service.getBatchList = jest.fn()
        .mockReturnValue(new BehaviorSubject<BehaviorSubject<Batch>[]>([
          new BehaviorSubject<Batch>(_mockBatch)
        ]));
      service.storageService.setBatches = jest.fn().mockReturnValue(of(null));
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
      service.getBatchList = jest.fn()
        .mockReturnValue(new BehaviorSubject<BehaviorSubject<Batch>[]>([]));
      service.storageService.setBatches = jest.fn().mockReturnValue(throwError(_mockError));
      service.errorReporter.handleUnhandledError = jest.fn();
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

});
