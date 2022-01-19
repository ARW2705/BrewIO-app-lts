/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockGrainBill, mockHopsSchedule, mockImage, mockOtherIngredients, mockProcessSchedule, mockRecipeMasterInactive, mockRecipeVariantIncomplete, mockYeastBatch } from '@test/mock-models';
import { ImageServiceStub, LibraryServiceStub, TypeGuardServiceStub } from '@test/service-stubs';

/* Interface imports */
import { GrainBill, HopsSchedule, Image, OtherIngredients, Process, RecipeMaster, RecipeVariant, YeastBatch } from '@shared/interfaces';

/* Type guard imports */
import { CalendarProcessGuardMetadata, GrainBillGuardMetadata, HopsScheduleGuardMetadata, ManualProcessGuardMetadata, OtherIngredientsGuardMetadata, ProcessGuardMetadata, TimerProcessGuardMetadata, YeastBatchGuardMetadata } from '@shared/type-guard-metadata';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ImageService, LibraryService, TypeGuardService } from '@services/public';
import { RecipeTypeGuardService } from './recipe-type-guard.service';


describe('RecipeTypeGuardService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: RecipeTypeGuardService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        RecipeTypeGuardService,
        { provide: ImageService, useClass: ImageServiceStub },
        { provide: LibraryService, useClass: LibraryServiceStub },
        { provide: TypeGuardService, useClass: TypeGuardServiceStub }
      ]
    });
    injector = getTestBed();
    service = injector.get(RecipeTypeGuardService);
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(RecipeTypeGuardService);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should check recipe type safety', (): void => {
    const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
    const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();
    const _mockError1: Error = new Error('test-error-1');
    const _mockError2: Error = new Error('test-error-2');
    service.isSafeRecipeMaster = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafeRecipeVariant = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.getUnsafeRecipeError = jest.fn()
      .mockReturnValueOnce(_mockError1)
      .mockReturnValueOnce(_mockError2);

    service.checkTypeSafety(_mockRecipeMasterInactive);
    service.checkTypeSafety(_mockRecipeVariantIncomplete);
    expect((): void => {
      service.checkTypeSafety(_mockRecipeMasterInactive);
    }).toThrow(_mockError1);
    expect((): void => {
      service.checkTypeSafety(_mockRecipeVariantIncomplete);
    }).toThrow(_mockError2);
  });

  test('should get unsafe type error', (): void => {
    const customError: CustomError = <CustomError>service.getUnsafeRecipeError(null, 'variant');
    expect(customError.name).toMatch('RecipeError');
    expect(customError.message).toMatch('Given variant is invalid: got null');
    expect(customError.severity).toEqual(2);
    expect(customError.userMessage).toMatch('An internal error occurred: invalid variant');
  });

  test('should get document guard by process type', (): void => {
    service.typeGuard.concatGuards = jest.fn().mockReturnValue(null);
    const concatSpy: jest.SpyInstance = jest.spyOn(service.typeGuard, 'concatGuards');

    service.getDocumentGuardByType('manual');
    expect(concatSpy).toHaveBeenCalledWith(ProcessGuardMetadata, ManualProcessGuardMetadata);
    service.getDocumentGuardByType('timer');
    expect(concatSpy).toHaveBeenCalledWith(ProcessGuardMetadata, TimerProcessGuardMetadata);
    service.getDocumentGuardByType('calendar');
    expect(concatSpy).toHaveBeenCalledWith(ProcessGuardMetadata, CalendarProcessGuardMetadata);
    expect((): void => {
      service.getDocumentGuardByType('invalid');
    }).toThrow(<CustomError>{
      name: 'TypeGuardError',
      message: 'Invalid process type on type guard validation: invalid',
      severity: 2,
      userMessage: 'An internal check error occurred, Process is malformed'
    });
  });

  test('should check if array of grain bills are type safe', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill();
    let failFlag: boolean = false;
    service.isSafeGrainBill = jest.fn().mockImplementation((): boolean => !failFlag);

    expect(service.isSafeGrainBillCollection(_mockGrainBill)).toBe(true);
    failFlag = true;
    expect(service.isSafeGrainBillCollection(_mockGrainBill)).toBe(false);
  });

  test('should check if single grain bill is type safe', (): void => {
    const _mockGrainBill: GrainBill = mockGrainBill()[0];
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.libraryService.isSafeGrains = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const guardSpy: jest.SpyInstance = jest.spyOn(service.typeGuard, 'hasValidProperties');

    expect(service.isSafeGrainBill(_mockGrainBill)).toBe(true);
    expect(guardSpy).toHaveBeenNthCalledWith(1, _mockGrainBill, GrainBillGuardMetadata);
    expect(service.isSafeGrainBill(_mockGrainBill)).toBe(false);
    expect(guardSpy).toHaveBeenNthCalledWith(2, _mockGrainBill, GrainBillGuardMetadata);
  });

  test('should check if array of hops schedules are type safe', (): void => {
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    let failFlag: boolean = false;
    service.isSafeHopsSchedule = jest.fn().mockImplementation((): boolean => !failFlag);

    expect(service.isSafeHopsScheduleCollection(_mockHopsSchedule)).toBe(true);
    failFlag = true;
    expect(service.isSafeHopsScheduleCollection(_mockHopsSchedule)).toBe(false);
  });

  test('should check if single hops schedule is type safe', (): void => {
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.libraryService.isSafeHops = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const guardSpy: jest.SpyInstance = jest.spyOn(service.typeGuard, 'hasValidProperties');

    expect(service.isSafeHopsSchedule(_mockHopsSchedule)).toBe(true);
    expect(guardSpy).toHaveBeenNthCalledWith(1, _mockHopsSchedule, HopsScheduleGuardMetadata);
    expect(service.isSafeHopsSchedule(_mockHopsSchedule)).toBe(false);
    expect(guardSpy).toHaveBeenNthCalledWith(2, _mockHopsSchedule, HopsScheduleGuardMetadata);
  });

  test('should check if array of other ingredients are type safe', (): void => {
    const _mockOtherIngredients: OtherIngredients[] = mockOtherIngredients();
    let failFlag: boolean = false;
    service.isSafeOtherIngredients = jest.fn().mockImplementation((): boolean => !failFlag);

    expect(service.isSafeOtherIngredientsCollection(_mockOtherIngredients)).toBe(true);
    failFlag = true;
    expect(service.isSafeOtherIngredientsCollection(_mockOtherIngredients)).toBe(false);
  });

  test('should check if single other ingredient is type safe', (): void => {
    const _mockOtherIngredients: OtherIngredients = mockOtherIngredients()[0];
    let failFlag: boolean = false;
    service.typeGuard.hasValidProperties = jest.fn().mockImplementation((): boolean => !failFlag);
    const guardSpy: jest.SpyInstance = jest.spyOn(service.typeGuard, 'hasValidProperties');

    expect(service.isSafeOtherIngredients(_mockOtherIngredients)).toBe(true);
    expect(guardSpy).toHaveBeenNthCalledWith(1, _mockOtherIngredients, OtherIngredientsGuardMetadata);
    failFlag = true;
    expect(service.isSafeOtherIngredients(_mockOtherIngredients)).toBe(false);
    expect(guardSpy).toHaveBeenNthCalledWith(2, _mockOtherIngredients, OtherIngredientsGuardMetadata);
    expect(guardSpy).toHaveBeenCalledTimes(2);
  });

  test('should check if process schedule items are type safe', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    let failFlag: boolean = false;
    service.getDocumentGuardByType = jest.fn().mockReturnValue(null);
    service.typeGuard.hasValidProperties = jest.fn()
      .mockImplementation((): boolean => {
        return !failFlag;
      });

    expect(service.isSafeProcessSchedule(_mockProcessSchedule)).toBe(true);
    failFlag = true;
    expect(service.isSafeProcessSchedule(_mockProcessSchedule)).toBe(false);
  });

  test('should check if recipe master is type safe', (): void => {
    const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
    const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();
    const _mockImage: Image = mockImage();
    _mockRecipeMasterInactive.variants.push(_mockRecipeVariantIncomplete);
    _mockRecipeMasterInactive.labelImage = _mockImage;
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.imageService.isSafeImage = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.libraryService.isSafeStyle = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafeRecipeVariant = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    expect(service.isSafeRecipeMaster(_mockRecipeMasterInactive)).toBe(true);
    expect(service.isSafeRecipeMaster(_mockRecipeMasterInactive)).toBe(false);
    expect(service.isSafeRecipeMaster(_mockRecipeMasterInactive)).toBe(false);
    expect(service.isSafeRecipeMaster(_mockRecipeMasterInactive)).toBe(false);
    expect(service.isSafeRecipeMaster(_mockRecipeMasterInactive)).toBe(false);
  });

  test('should check if recipe variant is type safe', (): void => {
    const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();
    const _mockGrainBill: GrainBill[] = [mockGrainBill()[0]];
    const _mockHopsSchedule: HopsSchedule[] = [mockHopsSchedule()[0]];
    const _mockYeastBatch: YeastBatch[] = [mockYeastBatch()[0]];
    _mockRecipeVariantIncomplete.grains = _mockGrainBill;
    _mockRecipeVariantIncomplete.hops = _mockHopsSchedule;
    _mockRecipeVariantIncomplete.yeast = _mockYeastBatch;
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafeGrainBillCollection = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafeHopsScheduleCollection = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafeYeastBatchCollection = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafeOtherIngredientsCollection = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isSafeProcessSchedule = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    expect(service.isSafeRecipeVariant(_mockRecipeVariantIncomplete)).toBe(true);
    expect(service.isSafeRecipeVariant(_mockRecipeVariantIncomplete)).toBe(false);
    expect(service.isSafeRecipeVariant(_mockRecipeVariantIncomplete)).toBe(false);
    expect(service.isSafeRecipeVariant(_mockRecipeVariantIncomplete)).toBe(false);
    expect(service.isSafeRecipeVariant(_mockRecipeVariantIncomplete)).toBe(false);
    expect(service.isSafeRecipeVariant(_mockRecipeVariantIncomplete)).toBe(false);
    expect(service.isSafeRecipeVariant(_mockRecipeVariantIncomplete)).toBe(false);
  });

  test('should check if array of yeast batches are type safe', (): void => {
    const _mockYeastBatch: YeastBatch[] = mockYeastBatch();
    let failFlag: boolean = false;
    service.isSafeYeastBatch = jest.fn().mockImplementation((): boolean => !failFlag);

    expect(service.isSafeYeastBatchCollection(_mockYeastBatch)).toBe(true);
    failFlag = true;
    expect(service.isSafeYeastBatchCollection(_mockYeastBatch)).toBe(false);
  });

  test('should check if single yeast batch is type safe', (): void => {
    const _mockYeastBatch: YeastBatch = mockYeastBatch()[0];
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.libraryService.isSafeYeast = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const guardSpy: jest.SpyInstance = jest.spyOn(service.typeGuard, 'hasValidProperties');

    expect(service.isSafeYeastBatch(_mockYeastBatch)).toBe(true);
    expect(guardSpy).toHaveBeenNthCalledWith(1, _mockYeastBatch, YeastBatchGuardMetadata);
    expect(service.isSafeYeastBatch(_mockYeastBatch)).toBe(false);
    expect(guardSpy).toHaveBeenNthCalledWith(2, _mockYeastBatch, YeastBatchGuardMetadata);
  });

});
