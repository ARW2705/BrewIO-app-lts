/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockYeastBatch, mockHopsSchedule, mockProcessSchedule, mockGrainBill, mockRecipeMasterActive, mockRecipeVariantComplete, mockEnglishUnits, mockMetricUnits, mockGrains, mockHops, mockYeast, mockStyles } from '../../../../../test-config/mock-models';
import { ActionSheetServiceStub, CalculationsServiceStub, IdServiceStub, ErrorReportingServiceStub, LibraryServiceStub, PreferencesServiceStub, RecipeServiceStub, ToastServiceStub, UtilityServiceStub } from '../../../../../test-config/service-stubs';
import { HeaderComponentStub, GrainBillComponentStub, HopsScheduleComponentStub, OtherIngredientsComponentStub, ProcessListComponentStub, RecipeQuickDataComponentStub, YeastBatchComponentStub, NoteListComponentStub } from '../../../../../test-config/component-stubs';
import { ActivatedRouteStub, ModalControllerStub, ModalStub } from '../../../../../test-config/ionic-stubs';
import { TruncatePipeStub } from '../../../../../test-config/pipe-stubs';

/* Default imports */
import { defaultRecipeMaster } from '../../../shared/defaults';

/* Interface imports */
import { Grains, GrainBill, Hops, HopsSchedule, Process, RecipeMaster, RecipeVariant, SelectedUnits, TimerProcess, Yeast, YeastBatch, Style } from '../../../shared/interfaces';

/* Service imports */
import { ActionSheetService, CalculationsService, IdService, ErrorReportingService, LibraryService, PreferencesService, RecipeService, ToastService, UtilityService } from '../../../services/services';

/* Page imports */
import { RecipeFormPage } from './recipe-form.page';


describe('RecipeFormPage', (): void => {
  let fixture: ComponentFixture<RecipeFormPage>;
  let recipeFormPage: RecipeFormPage;
  let originalOnInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        RecipeFormPage,
        HeaderComponentStub,
        GrainBillComponentStub,
        HopsScheduleComponentStub,
        OtherIngredientsComponentStub,
        YeastBatchComponentStub,
        RecipeQuickDataComponentStub,
        ProcessListComponentStub,
        NoteListComponentStub,
        TruncatePipeStub
      ],
      imports: [
        IonicModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: ActionSheetService, useClass: ActionSheetServiceStub },
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: LibraryService, useClass: LibraryServiceStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub },
        { provide: RecipeService, useClass: RecipeServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(RecipeFormPage);
    recipeFormPage = fixture.componentInstance;
    originalOnInit = recipeFormPage.ngOnInit;
    originalOnDestroy = recipeFormPage.ngOnDestroy;
    recipeFormPage.ngOnInit = jest.fn();
    recipeFormPage.ngOnDestroy = jest.fn();
    recipeFormPage.toastService.presentToast = jest.fn();
    recipeFormPage.toastService.presentErrorToast = jest.fn();
    recipeFormPage.modalCtrl.dismiss = jest.fn();
    recipeFormPage.errorReporter.handleUnhandledError = jest.fn();
    recipeFormPage.utilService.clone = jest
      .fn()
      .mockImplementation((recipe: any): any => recipe);
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(recipeFormPage).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (): void => {
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      recipeFormPage.preferenceService.getSelectedUnits = jest
        .fn()
        .mockReturnValue(_mockEnglishUnits);

      recipeFormPage.getAllLibraries = jest
        .fn();
      recipeFormPage.listenForRoute = jest
        .fn();

      recipeFormPage.ngOnInit = originalOnInit;

      fixture.detectChanges();

      expect(recipeFormPage.units).toStrictEqual(_mockEnglishUnits);
    });

    test('should handle destroying the component', (): void => {
      const nextSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.destroy$, 'complete');

      recipeFormPage.ngOnDestroy = originalOnDestroy;

      fixture.detectChanges();

      recipeFormPage.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

    test('should scroll to top on view leave', (): void => {
      fixture.detectChanges();

      recipeFormPage.ionContent.scrollToTop = jest
        .fn();

      const scrollSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.ionContent, 'scrollToTop');

      recipeFormPage.ionViewDidLeave();

      expect(scrollSpy).toHaveBeenCalled();
    });

  });


  describe('Initializations', (): void => {

    test('should get all libraries', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      const _mockHops: Hops[] = mockHops();
      const _mockYeast: Yeast[] = mockYeast();
      const _mockStyles: Style[] = mockStyles();

      recipeFormPage.libraryService.getAllLibraries = jest
        .fn()
        .mockReturnValue(of([_mockGrains, _mockHops, _mockYeast, _mockStyles]));

      fixture.detectChanges();

      recipeFormPage.getAllLibraries();

      setTimeout((): void => {
        expect(recipeFormPage.grainsLibrary).toStrictEqual(_mockGrains);
        expect(recipeFormPage.hopsLibrary).toStrictEqual(_mockHops);
        expect(recipeFormPage.yeastLibrary).toStrictEqual(_mockYeast);
        expect(recipeFormPage.styleLibrary).toStrictEqual(_mockStyles);
        done();
      }, 10);
    });

    test('should handle error when getting all libraries', (): void => {
      const _mockError: Error = new Error('test-error');

      recipeFormPage.libraryService.getAllLibraries = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      recipeFormPage.errorReporter.handleUnhandledError = jest.fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      recipeFormPage.getAllLibraries();

      expect(errorSpy).toHaveBeenCalledWith(_mockError);
    });

    test('should listen for route changes', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];

      recipeFormPage.router.getCurrentNavigation = jest
        .fn()
        .mockReturnValue({
          extras: {
            state: {
              formType: 'create',
              docMethod: 'create',
              masterData: _mockRecipeMasterActive,
              variantData: _mockRecipeVariantComplete
            }
          }
        });

      recipeFormPage.setFormTypeConfiguration = jest
        .fn();

      recipeFormPage.errorReporter.handleGenericCatchError = jest.fn();

      const configSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'setFormTypeConfiguration');

      fixture.detectChanges();

      recipeFormPage.listenForRoute();

      setTimeout((): void => {
        expect(configSpy).toHaveBeenCalledWith(
          'create',
          'create',
          _mockRecipeMasterActive,
          _mockRecipeVariantComplete
        );
        expect(recipeFormPage.isLoaded).toBe(true);
        done();
      }, 10);
    });

    test('should handle an error parsing route query params', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      recipeFormPage.router.getCurrentNavigation = jest
        .fn()
        .mockImplementation((): any => { throw _mockError; });

      recipeFormPage.errorReporter.handleGenericCatchError = jest
        .fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error).toStrictEqual(_mockError);
            return throwError(null);
          };
        });

      const errorSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      recipeFormPage.listenForRoute();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(null);
        done();
      }, 10);
    });

    test('should get config error message', (): void => {
      recipeFormPage.isValidDocMethod = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      recipeFormPage.isValidFormType = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      recipeFormPage.docMethod = 'invalidMethod';
      recipeFormPage.formType = 'invalidType';

      fixture.detectChanges();

      const invalidDoc: string = recipeFormPage.onConfigError();
      expect(invalidDoc).toMatch('Error: invalid document method: \'invalidMethod\';');

      const invalidForm: string = recipeFormPage.onConfigError();
      expect(invalidForm).toMatch('Error: invalid form type: \'invalidType\';');

      const invalidBoth: string = recipeFormPage.onConfigError();
      expect(invalidBoth).toMatch('Error: invalid document method: \'invalidMethod\'; invalid form type: \'invalidType\';');
    });

  });


  describe('Modals', (): void => {

    test('should get general form modal options', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];
      const _mockStyles: Style[] = mockStyles();

      const createMock: () => object = (): object => {
        const mock: object = {
          labelImage: _mockRecipeMasterActive.labelImage,
          style: _mockRecipeMasterActive.style,
          brewingType: _mockRecipeVariantComplete.brewingType,
          mashDuration: _mockRecipeVariantComplete.mashDuration,
          boilDuration: _mockRecipeVariantComplete.boilDuration,
          batchVolume: _mockRecipeVariantComplete.batchVolume,
          boilVolume: _mockRecipeVariantComplete.boilVolume,
          efficiency: _mockRecipeVariantComplete.efficiency,
          mashVolume: _mockRecipeVariantComplete.mashVolume,
          isFavorite: _mockRecipeVariantComplete.isFavorite,
          isMaster: _mockRecipeVariantComplete.isMaster
        };
        return mock;
      };

      const mockBaseMaster: object = createMock();
      const mockBaseVariant: object = createMock();

      const mockCompleteMaster: object = createMock();
      mockCompleteMaster['name'] = _mockRecipeMasterActive.name;

      const mockCompleteVariant: object = createMock();
      mockCompleteVariant['variantName'] = _mockRecipeVariantComplete.variantName;

      recipeFormPage.master = _mockRecipeMasterActive;
      recipeFormPage.variant = _mockRecipeVariantComplete;
      recipeFormPage.styleLibrary = _mockStyles;
      recipeFormPage.isGeneralFormComplete = false;
      recipeFormPage.formType = 'master';
      recipeFormPage.docMethod = 'create';
      recipeFormPage.getGeneralFormModalUpdateData = jest
        .fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(mockBaseMaster)
        .mockReturnValueOnce(mockBaseVariant);

      fixture.detectChanges();

      const incomplete: object = recipeFormPage.getGeneralFormModalOptions();
      expect(incomplete).toStrictEqual({
        formType: 'master',
        docMethod: 'create',
        data: null,
        styles: _mockStyles
      });

      recipeFormPage.isGeneralFormComplete = true;

      fixture.detectChanges();

      const completeMaster: object = recipeFormPage.getGeneralFormModalOptions();
      expect(completeMaster).toStrictEqual({
        formType: 'master',
        docMethod: 'create',
        data: mockCompleteMaster,
        styles: _mockStyles
      });

      recipeFormPage.formType = 'variant';

      fixture.detectChanges();

      const completeVariant: object = recipeFormPage.getGeneralFormModalOptions();
      expect(completeVariant).toStrictEqual({
        formType: 'variant',
        docMethod: 'create',
        data: mockCompleteVariant
      });
    });

    test('should handle general form error', (): void => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const toastSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      const handler: (error: string) => void = recipeFormPage.onGeneralFormModalError();
      handler('test-error');

      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('General form modal error');
      expect(consoleCalls[1]).toMatch('test-error');
      expect(toastSpy).toHaveBeenCalledWith('A general form error occurred');
    });

    test('should handle general form success', (): void => {
      recipeFormPage.updateDisplay = jest
        .fn();
      recipeFormPage.updateRecipeValues = jest
        .fn();
      recipeFormPage.autoSetMashDuration = jest
        .fn();
      recipeFormPage.autoSetBoilDuration = jest
        .fn();

      const displaySpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'updateDisplay');
      const recipeSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'updateRecipeValues');
      const mashSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'autoSetMashDuration');
      const boilSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'autoSetBoilDuration');

      const mockResults: object = {
        data: {
          mashDuration: 10,
          boilDuration: 20
        }
      };

      fixture.detectChanges();

      const handler: (data: object) => void = recipeFormPage.onGeneralFormModalSuccess();
      handler(mockResults);

      expect(displaySpy).toHaveBeenCalledWith(mockResults['data']);
      expect(recipeSpy).toHaveBeenCalled();
      expect(mashSpy).toHaveBeenCalledWith(10);
      expect(boilSpy).toHaveBeenCalledWith(20);
    });

    test('should get general form modal update data', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];

      recipeFormPage.master = _mockRecipeMasterActive;
      recipeFormPage.variant = _mockRecipeVariantComplete;
      recipeFormPage.isGeneralFormComplete = false;
      recipeFormPage.formType = 'master';

      fixture.detectChanges();

      expect(recipeFormPage.getGeneralFormModalUpdateData()).toBeNull();

      recipeFormPage.formType = 'variant';

      fixture.detectChanges();

      expect(recipeFormPage.getGeneralFormModalUpdateData()).toStrictEqual({
        labelImage: _mockRecipeMasterActive.labelImage,
        style: _mockRecipeMasterActive.style,
        brewingType: _mockRecipeVariantComplete.brewingType,
        mashDuration: _mockRecipeVariantComplete.mashDuration,
        boilDuration: _mockRecipeVariantComplete.boilDuration,
        batchVolume: _mockRecipeVariantComplete.batchVolume,
        boilVolume: _mockRecipeVariantComplete.boilVolume,
        efficiency: _mockRecipeVariantComplete.efficiency,
        mashVolume: _mockRecipeVariantComplete.mashVolume,
        isFavorite: _mockRecipeVariantComplete.isFavorite,
        isMaster: _mockRecipeVariantComplete.isMaster
      });
    });

    test('should open general form moda', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();

      recipeFormPage.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      recipeFormPage.getGeneralFormModalOptions = jest
        .fn()
        .mockReturnValue({});

      recipeFormPage.onGeneralFormModalSuccess = jest
        .fn()
        .mockReturnValue((data: any): void => {});

      const successSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'onGeneralFormModalSuccess');

      fixture.detectChanges();

      recipeFormPage.openGeneralFormModal();

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(successSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should get ingredient form modal options', (): void => {
      const _mockGrainBill: GrainBill = mockGrainBill()[0];
      const _mockGrains: Grains[] = mockGrains();
      const _mockHops: Hops[] = mockHops();
      const _mockYeast: Yeast[] = mockYeast();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      recipeFormPage.grainsLibrary = _mockGrains;
      recipeFormPage.hopsLibrary = _mockHops;
      recipeFormPage.yeastLibrary = _mockYeast;
      recipeFormPage.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      expect(recipeFormPage.getIngredientFormModalOptions('grains', _mockGrainBill)).toStrictEqual({
        ingredientType: 'grains',
        update: _mockGrainBill,
        boilTime: _mockRecipeVariantComplete.boilDuration,
        ingredientLibrary: _mockGrains
      });

      expect(recipeFormPage.getIngredientFormModalOptions('hops')).toStrictEqual({
        ingredientType: 'hops',
        update: undefined,
        boilTime: _mockRecipeVariantComplete.boilDuration,
        ingredientLibrary: _mockHops
      });

      expect(recipeFormPage.getIngredientFormModalOptions('yeast')).toStrictEqual({
        ingredientType: 'yeast',
        update: undefined,
        boilTime: _mockRecipeVariantComplete.boilDuration,
        ingredientLibrary: _mockYeast
      });

      expect(recipeFormPage.getIngredientFormModalOptions('otherIngredients')).toStrictEqual({
        ingredientType: 'otherIngredients',
        update: undefined,
        boilTime: _mockRecipeVariantComplete.boilDuration,
      });
    });

    test('should handle ingredient form error', (): void => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const toastSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      const handler: (error: string) => void = recipeFormPage.onIngredientFormModalError();
      handler('test-error');

      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('Ingredient form modal error');
      expect(consoleCalls[1]).toMatch('test-error');
      expect(toastSpy).toHaveBeenCalledWith('An ingredient form error occurred');
    });

    test('should handle ingredient form success', (): void => {
      recipeFormPage.updateIngredientList = jest
        .fn();
      recipeFormPage.updateRecipeValues = jest
        .fn();
      recipeFormPage.autoSetHopsAdditions = jest
        .fn();

      const listSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'updateIngredientList');
      const valSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'updateRecipeValues');
      const autoSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'autoSetHopsAdditions');

      fixture.detectChanges();

      const emptyHandler: (data: object) => void = recipeFormPage.onIngredientFormModalSuccess('hops');
      emptyHandler({});
      expect(listSpy).not.toHaveBeenCalled();
      expect(valSpy).not.toHaveBeenCalled();
      expect(autoSpy).not.toHaveBeenCalled();

      const handler: (data: object) => void = recipeFormPage.onIngredientFormModalSuccess('hops');
      handler({ data: { delete: true } });

      expect(listSpy).toHaveBeenCalledWith(
        { delete: true },
        'hops',
        undefined,
        true
      );
      expect(valSpy).toHaveBeenCalled();
      expect(autoSpy).toHaveBeenCalled();
    });

    test('should open general form moda', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();

      recipeFormPage.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve());

      recipeFormPage.getIngredientFormModalOptions = jest
        .fn()
        .mockReturnValue({});

      recipeFormPage.onIngredientFormModalSuccess = jest
        .fn()
        .mockReturnValue((): void => {});

      const successSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'onIngredientFormModalSuccess');

      fixture.detectChanges();

      recipeFormPage.openIngredientFormModal('hops');

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(successSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle not modal dismiss', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.notes = [];
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];
      _mockRecipeVariantComplete.notes = [];

      recipeFormPage.master = _mockRecipeMasterActive;
      recipeFormPage.variant = _mockRecipeVariantComplete;
      recipeFormPage.formType = 'master';

      fixture.detectChanges();

      const masterEmpty: (data: object) => void = recipeFormPage.onNoteModalDismiss();
      masterEmpty({});
      expect(_mockRecipeMasterActive.notes.length).toEqual(0);

      const masterAdd: (data: object) => void = recipeFormPage.onNoteModalDismiss();
      masterAdd({ data: { method: 'create', note: 'test' } });
      expect(_mockRecipeMasterActive.notes.length).toEqual(1);

      _mockRecipeMasterActive.notes = [ 'a', 'b', 'c' ];
      const masterUpdate: (data: object) => void = recipeFormPage.onNoteModalDismiss(1);
      masterUpdate({ data: { method: 'update', note: 'd' } });
      expect(_mockRecipeMasterActive.notes.length).toEqual(3);
      expect(_mockRecipeMasterActive.notes[1]).toMatch('d');

      const masterRemove: (data: object) => void = recipeFormPage.onNoteModalDismiss(1);
      masterRemove({ data: { method: 'delete' } });
      expect(_mockRecipeMasterActive.notes.length).toEqual(2);
      expect(_mockRecipeMasterActive.notes[1]).toMatch('c');

      recipeFormPage.formType = 'variant';

      fixture.detectChanges();

      const variantEmpty: (data: object) => void = recipeFormPage.onNoteModalDismiss();
      variantEmpty({});
      expect(_mockRecipeVariantComplete.notes.length).toEqual(0);

      const variantAdd: (data: object) => void = recipeFormPage.onNoteModalDismiss();
      variantAdd({ data: { method: 'create', note: 'test' } });
      expect(_mockRecipeVariantComplete.notes.length).toEqual(1);

      _mockRecipeVariantComplete.notes = [ 'a', 'b', 'c' ];
      const variantUpdate: (data: object) => void = recipeFormPage.onNoteModalDismiss(1);
      variantUpdate({ data: { method: 'update', note: 'd' } });
      expect(_mockRecipeVariantComplete.notes.length).toEqual(3);
      expect(_mockRecipeVariantComplete.notes[1]).toMatch('d');

      const variantRemove: (data: object) => void = recipeFormPage.onNoteModalDismiss(1);
      variantRemove({ data: { method: 'delete' } });
      expect(_mockRecipeVariantComplete.notes.length).toEqual(2);
      expect(_mockRecipeVariantComplete.notes[1]).toMatch('c');
    });

    test('should open note list note modal', (): void => {
      fixture.detectChanges();

      recipeFormPage.noteList = new NoteListComponentStub(
        recipeFormPage.errorReporter,
        recipeFormPage.modalCtrl,
        recipeFormPage.recipeService,
        recipeFormPage.toastService
      );

      const modalSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.noteList, 'openNoteModal');

      recipeFormPage.openNoteModal();

      expect(modalSpy).toHaveBeenCalled();
    });

    test('should get process form modal options', (): void => {
      const _mockProcess: Process = mockProcessSchedule()[0];

      fixture.detectChanges();

      expect(recipeFormPage.getProcessFormModalOptions('test', _mockProcess)).toStrictEqual({
        processType: _mockProcess.type,
        update: _mockProcess,
        formMode: 'update'
      });

      expect(recipeFormPage.getProcessFormModalOptions('test')).toStrictEqual({
        processType: 'test',
        update: undefined,
        formMode: 'create'
      });
    });

    test('should handle process form error', (): void => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const toastSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      const handler: (error: string) => void = recipeFormPage.onProcessFormModalError();
      handler('test-error');

      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('Process form modal error');
      expect(consoleCalls[1]).toMatch('test-error');
      expect(toastSpy).toHaveBeenCalledWith('A process form error occurred');
    });

    test('should handle process form success', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      const _mockNewProcessSchedule: Process[] = mockProcessSchedule();
      const _mockProcess: Process = _mockNewProcessSchedule[0];
      const _mockUpdateProcess: Process = _mockNewProcessSchedule[1];
      recipeFormPage.variant = _mockRecipeVariantComplete;
      const initialLength: number = _mockProcessSchedule.length;

      fixture.detectChanges();

      expect(recipeFormPage.variant.processSchedule).toStrictEqual(_mockProcessSchedule);

      const emptyHandler: (data: object) => void = recipeFormPage.onProcessFormModalSuccess();
      emptyHandler({});

      expect(recipeFormPage.variant.processSchedule).toStrictEqual(_mockProcessSchedule);

      const addHandler: (data: object) => void = recipeFormPage.onProcessFormModalSuccess();
      addHandler({ data: _mockProcess });

      expect(recipeFormPage.variant.processSchedule.length).toEqual(initialLength + 1);
      expect(recipeFormPage.variant.processSchedule[initialLength]).toStrictEqual(_mockProcess);

      const updateHandler: (data: object) => void = recipeFormPage.onProcessFormModalSuccess(0);
      updateHandler({ data: { update: _mockUpdateProcess } });

      expect(recipeFormPage.variant.processSchedule.length).toEqual(initialLength + 1);
      expect(recipeFormPage.variant.processSchedule[0]).toStrictEqual(_mockUpdateProcess);

      const removeHandler: (data: object) => void = recipeFormPage.onProcessFormModalSuccess(initialLength);
      removeHandler({ data: { delete: true } });

      expect(recipeFormPage.variant.processSchedule.length).toEqual(initialLength);
      expect(recipeFormPage.variant.processSchedule[initialLength - 1]).not.toStrictEqual(_mockProcess);
    });

    test('should open process modal', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve());

      recipeFormPage.getProcessFormModalOptions = jest
        .fn()
        .mockReturnValue({});

      recipeFormPage.onProcessFormModalSuccess = jest
        .fn()
        .mockReturnValue((): void => {});

      recipeFormPage.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      const successSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'onProcessFormModalSuccess');

      fixture.detectChanges();

      recipeFormPage.openProcessModal('test');

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(successSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

  });


  describe('Action Sheets', (): void => {

    test('should open ingredient action sheet', (): void => {
      let subCall: any[];

      recipeFormPage.actionService.openActionSheet = jest
        .fn()
        .mockImplementation((...options: any[]): any => {
          subCall = options;
        });

      recipeFormPage.openIngredientFormModal = jest
        .fn();

      const formSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'openIngredientFormModal');

      fixture.detectChanges();

      recipeFormPage.openIngredientActionSheet();

      expect(subCall[0]).toMatch('Select an Ingredient');

      const opts: any[] = subCall[1];

      expect(opts[0].text).toMatch('Grains');
      opts[0].handler();
      expect(formSpy).toHaveBeenNthCalledWith(1, 'grains');

      expect(opts[1].text).toMatch('Hops');
      opts[1].handler();
      expect(formSpy).toHaveBeenNthCalledWith(2, 'hops');

      expect(opts[2].text).toMatch('Yeast');
      opts[2].handler();
      expect(formSpy).toHaveBeenNthCalledWith(3, 'yeast');

      expect(opts[3].text).toMatch('Other');
      opts[3].handler();
      expect(formSpy).toHaveBeenNthCalledWith(4, 'otherIngredients');
    });

    test('should open process action sheet', (): void => {
      let subCall: any[];

      recipeFormPage.actionService.openActionSheet = jest
        .fn()
        .mockImplementation((...options: any[]): any => {
          subCall = options;
        });

      recipeFormPage.openProcessModal = jest
        .fn();

      const formSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'openProcessModal');

      fixture.detectChanges();

      recipeFormPage.openProcessActionSheet();

      expect(subCall[0]).toMatch('Add a process step');

      const opts: any[] = subCall[1];

      expect(opts[0].text).toMatch('Manual');
      opts[0].handler();
      expect(formSpy).toHaveBeenNthCalledWith(1, 'manual');

      expect(opts[1].text).toMatch('Timer');
      opts[1].handler();
      expect(formSpy).toHaveBeenNthCalledWith(2, 'timer');

      expect(opts[2].text).toMatch('Calendar');
      opts[2].handler();
      expect(formSpy).toHaveBeenNthCalledWith(3, 'calendar');
    });

  });


  describe('Auto Generation Functions', (): void => {

    test('should auto set boil duration', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const boilIndex: number = 7;
      (<TimerProcess>_mockRecipeVariantComplete.processSchedule[boilIndex]).duration = 60;

      expect(boilIndex).not.toEqual(-1);

      recipeFormPage.variant = _mockRecipeVariantComplete;

      recipeFormPage.getProcessIndex = jest
        .fn()
        .mockReturnValueOnce(-1)
        .mockReturnValueOnce(boilIndex);

      recipeFormPage.idService.getNewId = jest
        .fn()
        .mockReturnValue('1');

      recipeFormPage.autoSetHopsAdditions = jest
        .fn();

      const autoSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'autoSetHopsAdditions');

      fixture.detectChanges();

      recipeFormPage.autoSetBoilDuration(90);

      expect(recipeFormPage.variant.processSchedule[recipeFormPage.variant.processSchedule.length - 1]).toStrictEqual({
        cid: '1',
        type: 'timer',
        name: 'Boil',
        description: 'Boil wort',
        duration: 90,
        concurrent: false,
        splitInterval: 1
      });
      expect(autoSpy).not.toHaveBeenCalled();

      recipeFormPage.autoSetBoilDuration(100);

      expect((<TimerProcess>recipeFormPage.variant.processSchedule[boilIndex]).duration).toEqual(100);
      expect(autoSpy).toHaveBeenCalled();
    });

    test('should get process index', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockMashIndex: number = 2;
      const _mockPitchIndex: number = 11;

      recipeFormPage.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      const mashIndex: number = recipeFormPage.getProcessIndex('name', 'Mash');
      expect(mashIndex).toEqual(_mockMashIndex);

      const pitchIndex: number = recipeFormPage.getProcessIndex('name', 'Pitch yeast');
      expect(pitchIndex).toEqual(_mockPitchIndex);
    });

    test('should auto set hops additions', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const boilIndex: number = 7;
      (<TimerProcess>_mockRecipeVariantComplete.processSchedule[boilIndex]).duration = 60;
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

      recipeFormPage.generateHopsProcesses = jest
        .fn()
        .mockReturnValue(newHopsProcesses);

      recipeFormPage.variant = _mockRecipeVariantComplete;

      recipeFormPage.getProcessIndex = jest
        .fn()
        .mockReturnValueOnce(boilIndex)
        .mockReturnValueOnce(boilIndex - 2);

      fixture.detectChanges();

      recipeFormPage.autoSetHopsAdditions();

      expect(_mockRecipeVariantComplete.processSchedule[boilIndex - 2]).toStrictEqual(newHopsProcesses[0]);
    });

    test('should auto set mash duration', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const mashIndex: number = 2;
      (<TimerProcess>_mockRecipeVariantComplete.processSchedule[mashIndex]).duration = 60;

      recipeFormPage.variant = _mockRecipeVariantComplete;

      recipeFormPage.getProcessIndex = jest
        .fn()
        .mockReturnValueOnce(-1)
        .mockReturnValueOnce(mashIndex);

      recipeFormPage.idService.getNewId = jest
        .fn()
        .mockReturnValue('1');

      fixture.detectChanges();

      recipeFormPage.autoSetMashDuration(90);

      expect(recipeFormPage.variant.processSchedule[recipeFormPage.variant.processSchedule.length - 1]).toStrictEqual({
        cid: '1',
        type: 'timer',
        name: 'Mash',
        description: 'Mash grains',
        duration: 90,
        concurrent: false,
        splitInterval: 1
      });

      recipeFormPage.autoSetMashDuration(120);

      expect((<TimerProcess>recipeFormPage.variant.processSchedule[mashIndex]).duration).toEqual(120);
    });

    test('should format hops step description', (): void => {
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
      const _mockMetricUnits: SelectedUnits = mockMetricUnits();
      const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
      _mockHopsSchedule.quantity = 2;

      recipeFormPage.units = _mockEnglishUnits;

      recipeFormPage.calculator.requiresConversion = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      recipeFormPage.calculator.convertWeight = jest
        .fn()
        .mockImplementation((value: number, ...options: any[]): number => value * 2);

      recipeFormPage.utilService.roundToDecimalPlace = jest
        .fn()
        .mockImplementation((value: number, places: number): number => {
          return Math.floor(value);
        });

      fixture.detectChanges();

      expect(recipeFormPage.formatHopsDescription(_mockHopsSchedule)).toMatch('Hops addition: 2oz');

      recipeFormPage.units = _mockMetricUnits;

      expect(recipeFormPage.formatHopsDescription(_mockHopsSchedule)).toMatch('Hops addition: 4g');
    });

    test('should generate hops processes based on hops schedule', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
      _mockRecipeVariantComplete.boilDuration = 60;
      _mockRecipeVariantComplete.hops = _mockHopsSchedule;

      recipeFormPage.variant = _mockRecipeVariantComplete;

      recipeFormPage.idService.getNewId = jest
        .fn()
        .mockReturnValue('1');

      recipeFormPage.formatHopsDescription = jest
        .fn()
        .mockReturnValue('');

      fixture.detectChanges();

      const processes: Process[] = recipeFormPage.generateHopsProcesses();

      expect(processes.length).toEqual(3);

      processes.forEach((process: Process, index: number): void => {
        expect(process.name).toMatch(`Add ${_mockHopsSchedule[index].hopsType.name} hops`);
      });
    });


  });


  describe('Form Data Handling', (): void => {

    test('should format form payload', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];

      recipeFormPage.master = _mockRecipeMasterActive;
      recipeFormPage.variant = _mockRecipeVariantComplete;
      recipeFormPage.formType = 'master';
      recipeFormPage.docMethod = 'create';

      fixture.detectChanges();

      const masterCreate: object = recipeFormPage.constructPayload();
      expect(masterCreate).toStrictEqual({
        master: {
          name: _mockRecipeMasterActive.name,
          style: _mockRecipeMasterActive.style,
          notes: _mockRecipeMasterActive.notes,
          isPublic: _mockRecipeMasterActive.isPublic,
          labelImage: _mockRecipeMasterActive.labelImage
        },
        variant: _mockRecipeVariantComplete
      });

      recipeFormPage.docMethod = 'update';

      fixture.detectChanges();

      const masterUpdate: object = recipeFormPage.constructPayload();
      expect(masterUpdate).toStrictEqual({
        name: _mockRecipeMasterActive.name,
        style: _mockRecipeMasterActive.style,
        notes: _mockRecipeMasterActive.notes,
        isPublic: _mockRecipeMasterActive.isPublic,
        labelImage: _mockRecipeMasterActive.labelImage
      });

      recipeFormPage.formType = 'variant';

      fixture.detectChanges();

      const variantUpdate: object = recipeFormPage.constructPayload();
      expect(variantUpdate).toStrictEqual(_mockRecipeVariantComplete);
    });

    test('should init the form in master creation mode', (): void => {
      const _defaultRecipeMaster: RecipeMaster = defaultRecipeMaster();

      fixture.detectChanges();

      recipeFormPage.initCreateMasterForm();

      expect(recipeFormPage.submitSuccessMessage).toMatch('New Recipe Created');
      expect(recipeFormPage.isGeneralFormComplete).toBe(false);
      expect(recipeFormPage.title).toMatch('Create Recipe');
      expect(recipeFormPage.master).toStrictEqual(_defaultRecipeMaster);
      expect(recipeFormPage.variant).toStrictEqual(_defaultRecipeMaster.variants[0]);
      expect(recipeFormPage.previousRoute).toMatch('/tabs/recipe');
    });

    test('should init the form in variant creation mode', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipeFormPage.idService.getId = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive._id);

      fixture.detectChanges();

      recipeFormPage.initCreateVariantForm(_mockRecipeMasterActive);

      expect(recipeFormPage.submitSuccessMessage).toMatch('New Variant Created');
      expect(recipeFormPage.isGeneralFormComplete).toBe(false);
      expect(recipeFormPage.title).toMatch('Add Variant');
      expect(recipeFormPage.master).toStrictEqual(_mockRecipeMasterActive);
      expect(recipeFormPage.previousRoute).toMatch('/tabs/recipe');
      expect(recipeFormPage.variant.variantName.length).toEqual(0);
    });

    test('should init the form in master update mode', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipeFormPage.idService.getId = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive._id);

      fixture.detectChanges();

      recipeFormPage.initUpdateMasterForm(_mockRecipeMasterActive);

      expect(recipeFormPage.submitSuccessMessage).toMatch('Recipe Update Successful');
      expect(recipeFormPage.isGeneralFormComplete).toBe(true);
      expect(recipeFormPage.title).toMatch('Update Recipe');
      expect(recipeFormPage.master).toStrictEqual(_mockRecipeMasterActive);
      expect(recipeFormPage.variant).toStrictEqual(_mockRecipeMasterActive.variants[0]);
      expect(recipeFormPage.previousRoute).toMatch(`/tabs/recipe/${_mockRecipeMasterActive._id}`);
    });

    test('should init the form in variant update mode', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];

      recipeFormPage.idService.getId = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive._id);

      fixture.detectChanges();

      recipeFormPage.initUpdateVariantForm(_mockRecipeMasterActive, _mockRecipeVariantComplete);

      expect(recipeFormPage.submitSuccessMessage).toMatch('Variant Update Successful');
      expect(recipeFormPage.isGeneralFormComplete).toBe(true);
      expect(recipeFormPage.title).toMatch('Update Variant');
      expect(recipeFormPage.master).toStrictEqual(_mockRecipeMasterActive);
      expect(recipeFormPage.variant).toStrictEqual(_mockRecipeMasterActive.variants[0]);
      expect(recipeFormPage.previousRoute).toMatch(`/tabs/recipe/${_mockRecipeMasterActive._id}`);
    });

    test('should submit recipe master post form', (done: jest.DoneCallback): void => {
      recipeFormPage.submitRecipeMasterPost = jest
        .fn()
        .mockReturnValue(of(null));

      recipeFormPage.navToPreviousRoute = jest
        .fn();

      recipeFormPage.submitSuccessMessage = 'test-message';

      const toastSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.toastService, 'presentToast');
      const navSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'navToPreviousRoute');

      recipeFormPage.formType = 'master';
      recipeFormPage.docMethod = 'create';

      fixture.detectChanges();

      recipeFormPage.onSubmit();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'test-message',
          1500,
          'middle',
          'toast-bright'
        );
        expect(navSpy).toHaveBeenCalled();
        done();
      });
    });

    test('should submit recipe master patch form', (done: jest.DoneCallback): void => {
      recipeFormPage.submitRecipeMasterPatch = jest
        .fn()
        .mockReturnValue(of(null));

      recipeFormPage.navToPreviousRoute = jest
        .fn();

      recipeFormPage.submitSuccessMessage = 'test-message';

      const toastSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.toastService, 'presentToast');
      const navSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'navToPreviousRoute');

      recipeFormPage.formType = 'master';
      recipeFormPage.docMethod = 'update';

      fixture.detectChanges();

      recipeFormPage.onSubmit();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'test-message',
          1500,
          'middle',
          'toast-bright'
        );
        expect(navSpy).toHaveBeenCalled();
        done();
      });
    });

    test('should submit recipe variant post form', (done: jest.DoneCallback): void => {
      recipeFormPage.submitRecipeVariantPost = jest
        .fn()
        .mockReturnValue(of(null));

      recipeFormPage.navToPreviousRoute = jest
        .fn();

      recipeFormPage.submitSuccessMessage = 'test-message';

      const toastSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.toastService, 'presentToast');
      const navSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'navToPreviousRoute');

      recipeFormPage.formType = 'variant';
      recipeFormPage.docMethod = 'create';

      fixture.detectChanges();

      recipeFormPage.onSubmit();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'test-message',
          1500,
          'middle',
          'toast-bright'
        );
        expect(navSpy).toHaveBeenCalled();
        done();
      });
    });

    test('should submit recipe variant patch form', (done: jest.DoneCallback): void => {
      recipeFormPage.submitRecipeVariantPatch = jest
        .fn()
        .mockReturnValue(of(null));

      recipeFormPage.navToPreviousRoute = jest
        .fn();

      recipeFormPage.submitSuccessMessage = 'test-message';

      const toastSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.toastService, 'presentToast');
      const navSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'navToPreviousRoute');

      recipeFormPage.formType = 'variant';
      recipeFormPage.docMethod = 'update';

      fixture.detectChanges();

      recipeFormPage.onSubmit();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'test-message',
          1500,
          'middle',
          'toast-bright'
        );
        expect(navSpy).toHaveBeenCalled();
        done();
      });
    });

    test('should handle form submission error', (done: jest.DoneCallback): void => {
      recipeFormPage.submitRecipeMasterPost = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      recipeFormPage.navToPreviousRoute = jest
        .fn();

      const toastSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.toastService, 'presentErrorToast');

      recipeFormPage.formType = 'master';
      recipeFormPage.docMethod = 'create';

      fixture.detectChanges();

      recipeFormPage.onSubmit();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('test-error');
        done();
      });
    });

    test('should setup form metadata', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];

      recipeFormPage.isValidFormType = jest
        .fn()
        .mockReturnValue(true);

      recipeFormPage.isValidDocMethod = jest
        .fn()
        .mockReturnValue(true);

      recipeFormPage.initCreateMasterForm = jest
        .fn();
      recipeFormPage.initCreateVariantForm = jest
        .fn();
      recipeFormPage.initUpdateMasterForm = jest
        .fn();
      recipeFormPage.initUpdateVariantForm = jest
        .fn();

      const createMasterSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'initCreateMasterForm');
      const createVariantSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'initCreateVariantForm');
      const updateMasterSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'initUpdateMasterForm');
      const updateVariantSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'initUpdateVariantForm');

      fixture.detectChanges();

      recipeFormPage.setFormTypeConfiguration('master', 'create', _mockRecipeMasterActive, _mockRecipeVariantComplete);

      expect(recipeFormPage.formType).toMatch('master');
      expect(recipeFormPage.docMethod).toMatch('create');
      expect(createMasterSpy).toHaveBeenCalled();

      recipeFormPage.setFormTypeConfiguration('variant', 'create', _mockRecipeMasterActive, _mockRecipeVariantComplete);

      expect(recipeFormPage.formType).toMatch('variant');
      expect(recipeFormPage.docMethod).toMatch('create');
      expect(createVariantSpy).toHaveBeenCalledWith(_mockRecipeMasterActive);

      recipeFormPage.setFormTypeConfiguration('master', 'update', _mockRecipeMasterActive, _mockRecipeVariantComplete);

      expect(recipeFormPage.formType).toMatch('master');
      expect(recipeFormPage.docMethod).toMatch('update');
      expect(updateMasterSpy).toHaveBeenCalledWith(_mockRecipeMasterActive);

      recipeFormPage.setFormTypeConfiguration('variant', 'update', _mockRecipeMasterActive, _mockRecipeVariantComplete);

      expect(recipeFormPage.formType).toMatch('variant');
      expect(recipeFormPage.docMethod).toMatch('update');
      expect(updateVariantSpy).toHaveBeenCalledWith(_mockRecipeMasterActive, _mockRecipeVariantComplete);
    });

    test('should throw config error if formType or docMethod are invalid', (): void => {
      recipeFormPage.isValidFormType = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      recipeFormPage.isValidDocMethod = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      recipeFormPage.onConfigError = jest
        .fn()
        .mockReturnValue('test-error');

      fixture.detectChanges();

      expect(() => {
        recipeFormPage.setFormTypeConfiguration('invalid', 'invalid', mockRecipeMasterActive(), mockRecipeVariantComplete());
      })
      .toThrowError(new Error('test-error'));

      expect(() => {
        recipeFormPage.setFormTypeConfiguration('invalid', 'invalid', undefined, undefined);
      })
      .toThrowError(new Error('test-error'));
    });

    test('should submit a recipe master patch', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];

      recipeFormPage.master = _mockRecipeMasterActive;
      recipeFormPage.variant = _mockRecipeVariantComplete;

      recipeFormPage.constructPayload = jest
        .fn()
        .mockReturnValue({});

      recipeFormPage.recipeService.updateRecipeMasterById = jest
        .fn()
        .mockReturnValue(of(null));

      recipeFormPage.idService.getId = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive._id);

      const updateSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.recipeService, 'updateRecipeMasterById');

      fixture.detectChanges();

      recipeFormPage.submitRecipeMasterPatch().subscribe();

      expect(updateSpy).toHaveBeenCalledWith(_mockRecipeMasterActive._id, {});
    });

    test('should submit a recipe variant patch', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];

      recipeFormPage.master = _mockRecipeMasterActive;
      recipeFormPage.variant = _mockRecipeVariantComplete;

      recipeFormPage.constructPayload = jest
        .fn()
        .mockReturnValue({});

      recipeFormPage.recipeService.updateRecipeVariantById = jest
        .fn()
        .mockReturnValue(of(null));

      recipeFormPage.idService.getId = jest
        .fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(_mockRecipeVariantComplete._id);

      const updateSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.recipeService, 'updateRecipeVariantById');

      fixture.detectChanges();

      recipeFormPage.submitRecipeVariantPatch().subscribe();

      expect(updateSpy).toHaveBeenCalledWith(
        _mockRecipeMasterActive._id,
        _mockRecipeVariantComplete._id,
        {}
      );
    });

    test('should submit a recipe master post', (): void => {
      recipeFormPage.constructPayload = jest
        .fn()
        .mockReturnValue({});

      recipeFormPage.recipeService.createRecipeMaster = jest
        .fn()
        .mockReturnValue(of(null));

      const updateSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.recipeService, 'createRecipeMaster');

      fixture.detectChanges();

      recipeFormPage.submitRecipeMasterPost().subscribe();

      expect(updateSpy).toHaveBeenCalledWith({});
    });

    test('should submit a recipe variant post', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipeFormPage.master = _mockRecipeMasterActive;

      recipeFormPage.constructPayload = jest
        .fn()
        .mockReturnValue({});

      recipeFormPage.recipeService.createRecipeVariant = jest
        .fn()
        .mockReturnValue(of(null));

      recipeFormPage.idService.getId = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive._id);

      const updateSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.recipeService, 'createRecipeVariant');

      fixture.detectChanges();

      recipeFormPage.submitRecipeVariantPost().subscribe();

      expect(updateSpy).toHaveBeenCalledWith(_mockRecipeMasterActive._id, {});
    });

  });


  describe('Ingredient List', (): void => {

    test('should get index of ingredient by type', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const grainTargetIndex: number = 2;
      const hopsTargetIndex: number = 1;
      const yeastTargetIndex: number = 1;
      const otherTargetIndex: number = 0;

      recipeFormPage.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      expect(
        recipeFormPage.getIngredientIndex('grains', _mockRecipeVariantComplete.grains[grainTargetIndex])
      ).toEqual(2);

      expect(
        recipeFormPage.getIngredientIndex('hops', _mockRecipeVariantComplete.hops[hopsTargetIndex])
      ).toEqual(1);

      expect(
        recipeFormPage.getIngredientIndex('yeast', _mockRecipeVariantComplete.yeast[yeastTargetIndex])
      ).toEqual(1);

      expect(
        recipeFormPage.getIngredientIndex('otherIngredients', _mockRecipeVariantComplete.otherIngredients[otherTargetIndex])
      ).toEqual(0);

      expect(recipeFormPage.getIngredientIndex('otherIngredients', undefined)).toEqual(-1);
    });

    test('should compare names to determine if they should be swapped', (): void => {
      fixture.detectChanges();

      expect(recipeFormPage.shouldSwapByName('Before', 'later')).toBe(false);
      expect(recipeFormPage.shouldSwapByName('before', 'After')).toBe(true);
    });

    test('should sort grain bill by quantity or by name if quantities are equal', (): void => {
      const _mockGrainBill: GrainBill[] = mockGrainBill();
      _mockGrainBill[0].quantity = 8;
      _mockGrainBill[1].quantity = 0.5;

      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      _mockRecipeVariantComplete.grains.push(_mockGrainBill[1]);
      _mockRecipeVariantComplete.grains.push(_mockGrainBill[0]);

      recipeFormPage.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      recipeFormPage.sortGrains();

      expect(recipeFormPage.variant.grains[1]).toStrictEqual(_mockGrainBill[0]);
      expect(recipeFormPage.variant.grains[3]).toStrictEqual(_mockGrainBill[1]);
    });

    test('should sort hops schedule by quantity or by name if quantities are equal', (): void => {
      const _mockBaseHopsSchedule: HopsSchedule[] = mockHopsSchedule();

      const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
      const _mockHopsSchedule0: HopsSchedule = _mockHopsSchedule[0];
      _mockHopsSchedule0._id += '1';
      _mockHopsSchedule0.dryHop = true;
      const _mockHopsSchedule1: HopsSchedule = _mockHopsSchedule[1];
      _mockHopsSchedule1._id += '1';
      const _mockHopsSchedule2: HopsSchedule = _mockHopsSchedule[2];
      _mockHopsSchedule2._id += '1';
      const _mockHopsSchedule3: HopsSchedule = _mockHopsSchedule[3];
      _mockHopsSchedule3._id += '1';
      _mockHopsSchedule2.dryHop = true;
      const testHopsSchedule: HopsSchedule[] = _mockBaseHopsSchedule.concat([
        _mockHopsSchedule0,
        _mockHopsSchedule2,
        _mockHopsSchedule3,
        _mockHopsSchedule2,
        _mockHopsSchedule1
      ]);

      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      _mockRecipeVariantComplete.hops = testHopsSchedule;

      recipeFormPage.variant = _mockRecipeVariantComplete;

      recipeFormPage.shouldSwapByName = jest
        .fn()
        .mockImplementation((n1: string, n2: string): boolean => n1.toLowerCase() > n2.toLowerCase());

      fixture.detectChanges();

      recipeFormPage.sortHops();

      recipeFormPage.variant.hops.reduce((acc: HopsSchedule, curr: HopsSchedule): HopsSchedule => {
        if (!acc.dryHop && !curr.dryHop) {
          if (acc.quantity < curr.quantity) {
            console.log('Hops sort error', acc, curr);
            expect(true).toBe(false);
          }
        }
        if (acc.dryHop && curr.dryHop) {
          if (acc.quantity < curr.quantity) {
            console.log('Hops sort error', acc, curr);
            expect(true).toBe(false);
          }
        }
        return curr;
      });
    });

    test('should call appropriate sort method based on ingredient type', (): void => {
      recipeFormPage.sortGrains = jest
        .fn();
      recipeFormPage.sortHops = jest
        .fn();
      recipeFormPage.sortYeast = jest
        .fn();

      const grainsSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'sortGrains');
      const hopsSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'sortHops');
      const yeastSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'sortYeast');

      fixture.detectChanges();

      recipeFormPage.sortIngredients('grains');

      expect(grainsSpy).toHaveBeenCalled();
      expect(hopsSpy).not.toHaveBeenCalled();
      expect(yeastSpy).not.toHaveBeenCalled();

      recipeFormPage.sortIngredients('hops');

      expect(grainsSpy).toHaveBeenCalledTimes(1);
      expect(hopsSpy).toHaveBeenCalled();
      expect(yeastSpy).not.toHaveBeenCalled();

      recipeFormPage.sortIngredients('yeast');

      expect(grainsSpy).toHaveBeenCalledTimes(1);
      expect(hopsSpy).toHaveBeenCalledTimes(1);
      expect(yeastSpy).toHaveBeenCalled();

      recipeFormPage.sortIngredients('invalid');

      expect(grainsSpy).toHaveBeenCalledTimes(1);
      expect(hopsSpy).toHaveBeenCalledTimes(1);
      expect(yeastSpy).toHaveBeenCalledTimes(1);
    });

    test('should sort grain bill by quantity or by name if quantities are equal', (): void => {
      const _mockBaseYeastBatch1: YeastBatch[] = mockYeastBatch();

      const _mockBaseYeastBatch2: YeastBatch[] = mockYeastBatch();
      _mockBaseYeastBatch2[0].quantity = 1.5;
      _mockBaseYeastBatch2[1].quantity = 0.5;

      const _mockYeastBatch: YeastBatch[] = _mockBaseYeastBatch1.concat(_mockBaseYeastBatch2);

      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      _mockRecipeVariantComplete.yeast = _mockYeastBatch;

      recipeFormPage.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      recipeFormPage.sortYeast();

      recipeFormPage.variant.yeast.reduce((acc: YeastBatch, curr: YeastBatch): YeastBatch => {
        if (acc.quantity === curr.quantity) {
          expect(acc.yeastType.name.toLowerCase() < curr.yeastType.name.toLowerCase()).toBe(true);
        } else {
          expect(acc.quantity > curr.quantity);
        }
        return curr;
      });
    });

    test('should update the ingredient list', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      const _mockGrainBill: GrainBill = mockGrainBill()[0];
      const grainLength: number = _mockRecipeVariantComplete.grains.length;

      const testHopsIndex: number = 1;
      const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[testHopsIndex];
      _mockHopsSchedule._id = 'test-id';

      const testYeastIndex: number = 0;
      const _mockYeastBatch: YeastBatch = mockYeastBatch()[testYeastIndex];

      recipeFormPage.variant = _mockRecipeVariantComplete;

      recipeFormPage.getIngredientIndex = jest
        .fn()
        .mockReturnValueOnce(testHopsIndex);

      recipeFormPage.sortIngredients = jest
        .fn();

      fixture.detectChanges();

      recipeFormPage.updateIngredientList(_mockGrainBill, 'grains');

      expect(recipeFormPage.variant.grains.length).toEqual(grainLength + 1);

      recipeFormPage.updateIngredientList(_mockHopsSchedule, 'hops', _mockHopsSchedule);

      expect(recipeFormPage.variant.hops[testHopsIndex]._id).toMatch('test-id');

      expect(recipeFormPage.variant.yeast.length).toEqual(2);
      recipeFormPage.updateIngredientList(_mockYeastBatch, 'yeast', _mockYeastBatch, true);
      expect(recipeFormPage.variant.yeast.length).toEqual(1);
    });

  });


  describe('Other', (): void => {

    test('should check if doc method is valid', (): void => {
      fixture.detectChanges();

      recipeFormPage.docMethod = 'create';

      expect(recipeFormPage.isValidDocMethod()).toBe(true);

      recipeFormPage.docMethod = 'update';

      expect(recipeFormPage.isValidDocMethod()).toBe(true);

      recipeFormPage.docMethod = 'invalid';

      expect(recipeFormPage.isValidDocMethod()).toBe(false);
    });

    test('should check if form type is valid', (): void => {
      fixture.detectChanges();

      recipeFormPage.formType = 'master';

      expect(recipeFormPage.isValidFormType()).toBe(true);

      recipeFormPage.formType = 'variant';

      expect(recipeFormPage.isValidFormType()).toBe(true);

      recipeFormPage.formType = 'invalid';

      expect(recipeFormPage.isValidFormType()).toBe(false);
    });

    test('should handle sub component control action', (): void => {
      recipeFormPage.openIngredientFormModal = jest
        .fn();

      recipeFormPage.recipeActions['openIngredientFormModal'] = recipeFormPage.openIngredientFormModal;

      fixture.detectChanges();

      const changeSpy: jest.SpyInstance = jest.spyOn(recipeFormPage, 'openIngredientFormModal');

      recipeFormPage.onRecipeActionHandler('openIngredientFormModal', []);

      expect(changeSpy).toHaveBeenCalled();
    });

    test('should handle an error from a child component control action call', (): void => {
      const _mockError: Error = new Error('test-error');

      recipeFormPage.openIngredientFormModal = jest
        .fn()
        .mockImplementation((): void => { throw _mockError; });

      recipeFormPage.recipeActions['openIngredientFormModal'] = recipeFormPage.openIngredientFormModal;

      fixture.detectChanges();

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      recipeFormPage.onRecipeActionHandler('openIngredientFormModal', []);

      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('Recipe action error');
      expect(consoleCalls[1]).toMatch('openIngredientFormModal');
      expect(consoleCalls[2]).toStrictEqual(_mockError);
    });

    test('should nav to previous route', (): void => {
      recipeFormPage.previousRoute = 'test-route';

      recipeFormPage.router.navigate = jest
        .fn();

      const navSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.router, 'navigate');

      fixture.detectChanges();

      recipeFormPage.navToPreviousRoute();

      expect(navSpy).toHaveBeenCalledWith(['test-route']);
    });

    test('should apply list reorder results to process schedule', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      _mockRecipeVariantComplete.processSchedule = [];
      const _mockProcessSchedule: Process[] = mockProcessSchedule();

      recipeFormPage.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      expect(recipeFormPage.variant.processSchedule.length).toEqual(0);

      recipeFormPage.onReorder(_mockProcessSchedule);

      expect(recipeFormPage.variant.processSchedule).toStrictEqual(_mockProcessSchedule);
    });

    test('should update display with given values', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      recipeFormPage.master = _mockRecipeMasterActive;
      recipeFormPage.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      recipeFormPage.updateDisplay({
        name: 'updated name',
        variantName: 'updated variant name',
        none: 'should not update'
      });

      expect(recipeFormPage.master.name).toMatch('updated name');
      expect(recipeFormPage.variant.variantName).toMatch('updated variant name');
      expect(recipeFormPage.master['none']).toBeUndefined();
      expect(recipeFormPage.variant['none']).toBeUndefined();
    });

    test('should update recipe values', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      recipeFormPage.variant = _mockRecipeVariantComplete;

      recipeFormPage.calculator.calculateRecipeValues = jest
        .fn();

      const calcSpy: jest.SpyInstance = jest.spyOn(recipeFormPage.calculator, 'calculateRecipeValues');

      fixture.detectChanges();

      recipeFormPage.updateRecipeValues();

      expect(calcSpy).toHaveBeenCalledWith(_mockRecipeVariantComplete);
    });

  });


  describe('Render Template', (): void => {
    TruncatePipeStub._returnValue = (value: number): string => value.toString();

    describe('Render template as create master mode', (): void => {
      const _defaultRecipeMaster: RecipeMaster = defaultRecipeMaster();

      beforeEach((): void => {
        recipeFormPage.initCreateMasterForm();

        recipeFormPage.formType = 'master';
        recipeFormPage.docMethod = 'create';
        recipeFormPage.isLoaded = true;
      });

      test('should render open general form button', (): void => {
        fixture.detectChanges();

        const genFormButton: HTMLElement = fixture.nativeElement.querySelector('#generalInfoModalButton');
        const topRow: HTMLElement = <HTMLElement>genFormButton.children[0];
        expect(topRow.children[0].textContent).toMatch('Tap Here To Begin');
        const bottomRow: HTMLElement = <HTMLElement>genFormButton.children[1];
        expect(bottomRow.children[0].textContent).toMatch(`${_defaultRecipeMaster.variants[0].ABV}% ABV`);
        expect(bottomRow.children[1].textContent).toMatch(`${_defaultRecipeMaster.style.name}`);
      });

      test('should render recipe quick data component', (): void => {
        fixture.detectChanges();

        const recipeQuickData: HTMLElement = fixture.nativeElement.querySelector('recipe-quick-data');
        expect(recipeQuickData).not.toBeNull();
      });

      test('should render ingredient button', (): void => {
        fixture.detectChanges();

        const ionButtons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
        const ingredientButton: HTMLElement = <HTMLElement>ionButtons.item(0);
        expect(ingredientButton.textContent).toMatch('ADD INGREDIENT');
      });

      test('should render process button', (): void => {
        fixture.detectChanges();

        const ionButtons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
        const processButton: HTMLElement = <HTMLElement>ionButtons.item(1);
        expect(processButton.textContent).toMatch('ADD PROCESS');
      });

      test('should render note button', (): void => {
        fixture.detectChanges();

        const ionButtons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
        const noteButton: HTMLElement = <HTMLElement>ionButtons.item(2);
        expect(noteButton.textContent).toMatch('ADD RECIPE NOTE');
      });

    });


    describe('Render template as update master mode', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      beforeEach((): void => {
        recipeFormPage.idService.getId = jest
          .fn()
          .mockReturnValue(_mockRecipeMasterActive._id);
        recipeFormPage.initUpdateMasterForm(_mockRecipeMasterActive);

        recipeFormPage.formType = 'master';
        recipeFormPage.docMethod = 'update';
        recipeFormPage.isLoaded = true;
      });

      test('should render open general form button', (): void => {
        fixture.detectChanges();

        const genFormButton: HTMLElement = fixture.nativeElement.querySelector('#generalInfoModalButton');
        const topRow: HTMLElement = <HTMLElement>genFormButton.children[0];
        expect(topRow.children[0].textContent).toMatch('Active');
        const bottomRow: HTMLElement = <HTMLElement>genFormButton.children[1];
        expect(bottomRow.children[0].textContent).toMatch(`${_mockRecipeMasterActive.variants[0].ABV}% ABV`);
        expect(bottomRow.children[1].textContent).toMatch(`${_mockRecipeMasterActive.style.name}`);
      });

      test('should render recipe quick data component', (): void => {
        fixture.detectChanges();

        const recipeQuickData: HTMLElement = fixture.nativeElement.querySelector('recipe-quick-data');
        expect(recipeQuickData).not.toBeNull();
      });

      test('should not render ingredient or process button', (): void => {
        fixture.detectChanges();

        const ionButtons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

        ionButtons.forEach((node: Node): void => {
          expect(node.textContent).not.toMatch('ADD INGREDIENT');
          expect(node.textContent).not.toMatch('ADD PROCESS');
        });
      });

    });


    describe('Render template as create variant mode', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];

      beforeEach((): void => {
        recipeFormPage.utilService.stripSharedProperties = jest.fn();
        recipeFormPage.idService.getId = jest
          .fn()
          .mockReturnValue(_mockRecipeMasterActive._id);
        recipeFormPage.initCreateVariantForm(_mockRecipeMasterActive);

        recipeFormPage.formType = 'variant';
        recipeFormPage.docMethod = 'create';
        recipeFormPage.isLoaded = true;
      });

      test('should render open general form button', (): void => {
        fixture.detectChanges();

        const genFormButton: HTMLElement = fixture.nativeElement.querySelector('#generalInfoModalButton');
        const topRow: HTMLElement = <HTMLElement>genFormButton.children[0];
        expect(topRow.children[0].textContent).toMatch(('Tap Here To Begin'));
        const bottomRow: HTMLElement = <HTMLElement>genFormButton.children[1];
        expect(bottomRow.children[0].textContent).toMatch(`${_mockRecipeVariantComplete.ABV}% ABV`);
        expect(bottomRow.children[1].textContent).toMatch(`${_mockRecipeMasterActive.style.name}`);
      });

      test('should render recipe quick data component', (): void => {
        fixture.detectChanges();

        const recipeQuickData: HTMLElement = fixture.nativeElement.querySelector('recipe-quick-data');
        expect(recipeQuickData).not.toBeNull();
      });

      test('should render ingredient button', (): void => {
        fixture.detectChanges();

        const ionButtons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
        const ingredientButton: HTMLElement = <HTMLElement>ionButtons.item(0);
        expect(ingredientButton.textContent).toMatch('ADD INGREDIENT');
      });

      test('should have a grain bill', (): void => {
        fixture.detectChanges();

        const grainBillElem: HTMLElement = fixture.nativeElement.querySelector('grain-bill');
        expect(grainBillElem).not.toBeNull();
      });

      test('should have a hops schedule', (): void => {
        fixture.detectChanges();

        const hopsScheduleElem: HTMLElement = fixture.nativeElement.querySelector('hops-schedule');
        expect(hopsScheduleElem).not.toBeNull();
      });

      test('should have a yeast batch', (): void => {
        fixture.detectChanges();

        const yeastBatchElem: HTMLElement = fixture.nativeElement.querySelector('yeast-batch');
        expect(yeastBatchElem).not.toBeNull();
      });

      test('should have a other ingredients', (): void => {
        fixture.detectChanges();

        const otherIngredientsElem: HTMLElement = fixture.nativeElement.querySelector('other-ingredients');
        expect(otherIngredientsElem).not.toBeNull();
      });

      test('should render process button', (): void => {
        fixture.detectChanges();

        const ionButtons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
        const processButton: HTMLElement = <HTMLElement>ionButtons.item(1);
        expect(processButton.textContent).toMatch('ADD PROCESS');
      });

      test('should have a process list', (): void => {
        fixture.detectChanges();

        const processListElem: HTMLElement = fixture.nativeElement.querySelector('process-list');
        expect(processListElem).not.toBeNull();
      });

      test('should render note button', (): void => {
        fixture.detectChanges();

        const ionButtons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
        const noteButton: HTMLElement = <HTMLElement>ionButtons.item(2);
        expect(noteButton.textContent).toMatch('ADD VARIANT NOTE');
      });

      test('should have a note list', (): void => {
        fixture.detectChanges();

        const noteListElem: HTMLElement = fixture.nativeElement.querySelector('note-list');
        expect(noteListElem).not.toBeNull();
      });

      test('should render save button as disabled', (): void => {
        fixture.detectChanges();

        const ionButtons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

        const saveButton: HTMLElement = <HTMLElement>ionButtons.item(ionButtons.length -  1);
        expect(saveButton.textContent).toMatch('SAVE');
        expect(saveButton.getAttribute('ng-reflect-disabled')).toMatch('true');
      });

    });


    describe('Render template as update variant mode', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];

      beforeEach((): void => {
        recipeFormPage.idService.getId = jest
          .fn()
          .mockReturnValue(_mockRecipeMasterActive._id);
        recipeFormPage.initUpdateVariantForm(_mockRecipeMasterActive, _mockRecipeVariantComplete);

        recipeFormPage.formType = 'variant';
        recipeFormPage.docMethod = 'update';
        recipeFormPage.isLoaded = true;
      });

      test('should render save button as not disabled', (): void => {
        fixture.detectChanges();

        const ionButtons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

        const saveButton: HTMLElement = <HTMLElement>ionButtons.item(ionButtons.length -  1);
        expect(saveButton.textContent).toMatch('SAVE');
        expect(saveButton.getAttribute('ng-reflect-disabled')).toMatch('false');
      });

    });

  });

});
