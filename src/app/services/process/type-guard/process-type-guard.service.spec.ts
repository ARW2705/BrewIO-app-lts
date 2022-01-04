/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';

/* TestBed configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockAlert, mockBatch, mockPrimaryValues, mockProcessSchedule } from '@test/mock-models';
import { RecipeServiceStub, TypeGuardServiceStub } from '@test/service-stubs';

/* Constants imports */
import { HIGH_SEVERITY } from '@shared/constants';

/* Interface imports */
import { Alert, Batch, BatchAnnotations, BatchContext, BatchProcess, PrimaryValues, Process } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Type guard imports */
import { AlertGuardMetadata, BatchAnnotationsGuardMetadata, BatchContextGuardMetadata, BatchGuardMetadata, BatchProcessGuardMetadata, PrimaryValuesGuardMetadata } from '@shared/type-guard-metadata';

/* Service imports */
import { RecipeService, TypeGuardService } from '@services/public';
import { ProcessTypeGuardService } from './process-type-guard.service';


describe('ProcessTypeGuardService', () => {
  configureTestBed();
  let injector: TestBed;
  let service: ProcessTypeGuardService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        ProcessTypeGuardService,
        { provide: RecipeService, useClass: RecipeServiceStub },
        { provide: TypeGuardService, useClass: TypeGuardServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(ProcessTypeGuardService);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should check type safety', (): void => {
    const _mockBatch: Batch = mockBatch();
    service.isSafeBatch = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const _mockError: Error = new Error('test-error');
    service.getUnsafeError = jest.fn().mockReturnValue(_mockError);

    service.checkTypeSafety(_mockBatch);

    expect((): void => {
      service.checkTypeSafety(null);
    }).toThrow(_mockError);
  });

  test('should get a type unsafe error', (): void => {
    const _mockCheck: any = { mock: false };
    const customError: CustomError = service.getUnsafeError(_mockCheck);
    expect(customError.name).toMatch('BatchError');
    expect(customError.message).toMatch(`Batch is invalid: got {\n  "mock": false\n}`);
    expect(customError.severity).toEqual(HIGH_SEVERITY);
    expect(customError.userMessage).toMatch('An internal error occurred: invalid batch');
  });

  test('should check if alerts are type safe', (): void => {
    const _mockAlert: Alert = mockAlert();
    service.typeGuard.hasValidProperties = jest.fn()
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
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafeBatchAnnotations = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafeBatchContext = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafeBatchProcess = jest.fn()
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
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafePrimaryValues = jest.fn()
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
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.recipeService.isSafeGrainBillCollection = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.recipeService.isSafeHopsScheduleCollection = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.recipeService.isSafeYeastBatchCollection = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.recipeService.isSafeOtherIngredientsCollection = jest.fn()
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
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafeProcessSchedule = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafeAlerts = jest.fn()
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
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const guardSpy: jest.SpyInstance = jest.spyOn(service.typeGuard, 'hasValidProperties');

    expect(service.isSafePrimaryValues(_mockPrimaryValues)).toBe(true);
    expect(service.isSafePrimaryValues(_mockPrimaryValues)).toBe(false);
    expect(guardSpy).toHaveBeenCalledWith(_mockPrimaryValues, PrimaryValuesGuardMetadata);
  });

  test('should check if process schedule items are type safe', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    service.recipeService.isSafeProcessSchedule = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    expect(service.isSafeProcessSchedule(_mockProcessSchedule)).toBe(true);
    expect(service.isSafeProcessSchedule(_mockProcessSchedule)).toBe(false);
  });

});
