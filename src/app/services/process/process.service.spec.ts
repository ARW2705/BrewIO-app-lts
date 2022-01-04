/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

/* TestBed configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockBatch, mockCalendarMetadata, mockHopsSchedule, mockPrimaryValues, mockProcessSchedule } from '@test/mock-models';
import { CalculationsServiceStub, ErrorReportingServiceStub, IdServiceStub, ProcessComponentHelperServiceStub, ProcessHttpServiceStub, ProcessStateServiceStub, ProcessSyncServiceStub, ProcessTypeGuardServiceStub } from '@test/service-stubs';

/* Interface imports */
import { Batch, CalendarMetadata, HopsSchedule, PrimaryValues, Process } from '@shared/interfaces';

/* Service imports */
import { CalculationsService } from '@services/calculations/calculations.service';
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { IdService } from '@services/id/id.service';
import { ProcessComponentHelperService } from '@services/process/component-helper/process-component-helper.service';
import { ProcessHttpService } from '@services/process/http/process-http.service';
import { ProcessStateService } from '@services/process/state/process-state.service';
import { ProcessSyncService } from '@services/process/sync/process-sync.service';
import { ProcessTypeGuardService } from '@services/process/type-guard/process-type-guard.service';
import { ProcessService } from './process.service';


describe('ProcessService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: ProcessService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        ProcessService,
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ProcessComponentHelperService, useClass: ProcessComponentHelperServiceStub },
        { provide: ProcessHttpService, useClass: ProcessHttpServiceStub },
        { provide: ProcessStateService, useClass: ProcessStateServiceStub },
        { provide: ProcessSyncService, useClass: ProcessSyncServiceStub },
        { provide: ProcessTypeGuardService, useClass: ProcessTypeGuardServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(ProcessService);
    service.errorReporter.handleUnhandledError = jest.fn();
    service.errorReporter.handleGenericCatchError = jest.fn()
      .mockReturnValue((error: any): Observable<any> => throwError(error));
    service.idService.hasId = jest.fn()
      .mockImplementation((obj: any, id: string): boolean => obj['_id'] === id || obj['cid'] === id);
    Object.assign(service.errorReporter, { highSeverity: 2 });
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should end a batch by id', (done: jest.DoneCallback): void => {
    const _mockBatch: Batch = mockBatch();
    service.getBatchById = jest.fn().mockReturnValue(_mockBatch);
    service.updateBatch = jest.fn().mockReturnValue(of(_mockBatch));
    service.processStateService.archiveActiveBatch = jest.fn().mockReturnValue(of(_mockBatch));
    service.errorReporter.handleGenericCatchError = jest.fn();
    const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateBatch');
    const archiveSpy: jest.SpyInstance = jest.spyOn(service.processStateService, 'archiveActiveBatch');

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

  test('should catch an error on ending batch', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    service.getBatchById = jest.fn().mockReturnValue(undefined);
    service.processStateService.getMissingError = jest.fn().mockReturnValue(_mockError);

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

  test('should get batch by id', (): void => {
    const _mockBatch: Batch = mockBatch();
    service.processStateService.getBatchById = jest.fn().mockReturnValue(_mockBatch);
    const getSpy: jest.SpyInstance = jest.spyOn(service.processStateService, 'getBatchById');
    const testId: string = 'test-id';

    expect(service.getBatchById(testId)).toStrictEqual(_mockBatch);
    expect(getSpy).toHaveBeenCalledWith(testId);
  });

  test('should get a batch list', (): void => {
    const batchList: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([]);
    service.processStateService.getBatchList = jest.fn().mockReturnValue(batchList);
    const getSpy: jest.SpyInstance = jest.spyOn(service.processStateService, 'getBatchList');

    expect(service.getBatchList(true)).toStrictEqual(batchList);
    expect(getSpy).toHaveBeenCalledWith(true);
  });

  test('should get batch by id', (): void => {
    const _mockBatch: Batch = mockBatch();
    const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
    service.processStateService.getBatchSubjectById = jest.fn().mockReturnValue(_mockBatch$);
    const getSpy: jest.SpyInstance = jest.spyOn(service.processStateService, 'getBatchSubjectById');
    const testId: string = 'test-id';

    expect(service.getBatchSubjectById(testId).value).toStrictEqual(_mockBatch);
    expect(getSpy).toHaveBeenCalledWith(testId);
  });

  test('should start a new batch', (done: jest.DoneCallback): void => {
    const _mockBatch: Batch = mockBatch();
    service.processStateService.generateBatchFromRecipe = jest.fn().mockReturnValue(of(_mockBatch));
    const genSpy: jest.SpyInstance = jest.spyOn(service.processStateService, 'generateBatchFromRecipe');
    const userId: string = 'user';
    const recipeId: string = 'recipe';
    const variantId: string = 'variant';

    service.startNewBatch(userId, recipeId, variantId)
      .subscribe(
        (batch: Batch): void => {
          expect(batch).toStrictEqual(_mockBatch);
          expect(genSpy).toHaveBeenCalledWith(userId, recipeId, variantId);
          done();
        },
        (error: any): void => {
          console.log('Error in: should start a new batch', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should update a batch', (done: jest.DoneCallback): void => {
    const _mockBatch: Batch = mockBatch();
    service.processStateService.setBatch = jest.fn();
    service.processStateService.sendBackgroundRequest = jest.fn();
    const setSpy: jest.SpyInstance = jest.spyOn(service.processStateService, 'setBatch');
    const sendSpy: jest.SpyInstance = jest.spyOn(service.processStateService, 'sendBackgroundRequest');

    service.updateBatch(_mockBatch, true)
      .subscribe(
        (batch: Batch): void => {
          expect(batch).toStrictEqual(_mockBatch);
          expect(setSpy).toHaveBeenCalledWith(_mockBatch, true);
          expect(sendSpy).toHaveBeenCalledWith('patch', _mockBatch);
          done();
        },
        (error: any): void => {
          console.log('Error in: should update a batch', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should update measured values', (done: jest.DoneCallback): void => {
    const _mockBatch: Batch = mockBatch();
    const _mockExpectedBatch: Batch = mockBatch();
    _mockExpectedBatch.annotations.measuredValues.originalGravity += 0.020;
    _mockExpectedBatch.annotations.measuredValues.finalGravity -= 0.010;
    _mockExpectedBatch.annotations.measuredValues.batchVolume += 1;
    _mockExpectedBatch.annotations.measuredValues.ABV = 4;
    _mockExpectedBatch.annotations.measuredValues.IBU = 30;
    _mockExpectedBatch.annotations.measuredValues.SRM = 5;
    service.getBatchById = jest.fn().mockReturnValue(_mockBatch);
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
    const _mockCalendarMetadata: CalendarMetadata = mockCalendarMetadata();
    const calendarIndex: number = 13;
    _mockCalendarMetadata.id = _mockBatch.process.schedule[calendarIndex].cid;
    const now: string = (new Date()).toISOString();
    _mockCalendarMetadata.startDatetime = now;
    service.getBatchById = jest.fn().mockReturnValue(_mockBatch);
    service.updateBatch = jest.fn().mockReturnValue(of(_mockBatch));

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
    service.processStateService.getMissingError = jest.fn().mockReturnValue(_mockError);
    const getSpy: jest.SpyInstance = jest.spyOn(service.processStateService, 'getMissingError');

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

  test('should auto set boil duration', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    service.processComponentHelperService.autoSetBoilDuration = jest.fn()
      .mockReturnValue(_mockProcessSchedule);
    const setSpy: jest.SpyInstance = jest.spyOn(service.processComponentHelperService, 'autoSetBoilDuration');
    const duration: number = 60;

    service.autoSetBoilDuration(_mockProcessSchedule, duration, _mockHopsSchedule);
    expect(setSpy).toHaveBeenCalledWith(_mockProcessSchedule, duration, _mockHopsSchedule);
  });

  test('should auto set hops schedule', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    service.processComponentHelperService.autoSetHopsAdditions = jest.fn()
      .mockReturnValue(_mockProcessSchedule);
    const setSpy: jest.SpyInstance = jest.spyOn(service.processComponentHelperService, 'autoSetHopsAdditions');
    const duration: number = 60;

    service.autoSetHopsAdditions(_mockProcessSchedule, duration, _mockHopsSchedule);
    expect(setSpy).toHaveBeenCalledWith(_mockProcessSchedule, duration, _mockHopsSchedule);
  });

  test('should auto set mash duration', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    service.processComponentHelperService.autoSetMashDuration = jest.fn()
      .mockReturnValue(_mockProcessSchedule);
    const setSpy: jest.SpyInstance = jest.spyOn(service.processComponentHelperService, 'autoSetMashDuration');
    const duration: number = 60;

    service.autoSetMashDuration(_mockProcessSchedule, duration);
    expect(setSpy).toHaveBeenCalledWith(_mockProcessSchedule, duration);
  });

  test('should format hops description', (): void => {
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
    service.processComponentHelperService.formatHopsDescription = jest.fn()
      .mockReturnValue(_mockHopsSchedule);
    const setSpy: jest.SpyInstance = jest.spyOn(service.processComponentHelperService, 'formatHopsDescription');

    service.formatHopsDescription(_mockHopsSchedule);
    expect(setSpy).toHaveBeenCalledWith(_mockHopsSchedule);
  });

  test('should generate hops processes', (): void => {
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    service.processComponentHelperService.generateHopsProcesses = jest.fn()
      .mockReturnValue(_mockHopsSchedule);
    const setSpy: jest.SpyInstance = jest.spyOn(service.processComponentHelperService, 'generateHopsProcesses');
    const duration: number = 60;

    service.generateHopsProcesses(_mockHopsSchedule, duration);
    expect(setSpy).toHaveBeenCalledWith(_mockHopsSchedule, duration);
  });

  test('should get process index', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    const searchIndex: number = _mockProcessSchedule.length / 2;
    const searchTerm: string = _mockProcessSchedule[searchIndex].cid;

    expect(service.getProcessIndex(_mockProcessSchedule, 'cid', searchTerm)).toEqual(searchIndex);
    expect(service.getProcessIndex(_mockProcessSchedule, 'not-a-field', searchTerm)).toEqual(-1);
  });

});
