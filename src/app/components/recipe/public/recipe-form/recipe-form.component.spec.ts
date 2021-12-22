/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonContent, IonicModule, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockYeastBatch, mockHopsSchedule, mockIngredientUpdateEvent, mockProcessSchedule, mockProcessUpdateEvent, mockGrainBill, mockRecipeMasterActive, mockRecipeVariantComplete, mockEnglishUnits, mockMetricUnits, mockGrains, mockHops, mockYeast, mockStyles } from '../../../../../../test-config/mock-models';
import { ActionSheetServiceStub, CalculationsServiceStub, IdServiceStub, ErrorReportingServiceStub, LibraryServiceStub, PreferencesServiceStub, ProcessServiceStub, RecipeServiceStub, ToastServiceStub, UtilityServiceStub } from '../../../../../../test-config/service-stubs';
import { HeaderComponentStub, GrainBillComponentStub, HopsScheduleComponentStub, OtherIngredientsComponentStub, ProcessListComponentStub, RecipeQuickDataComponentStub, YeastBatchComponentStub, NoteListComponentStub } from '../../../../../../test-config/component-stubs';
import { ActivatedRouteStub, IonContentStub, ModalControllerStub, ModalStub } from '../../../../../../test-config/ionic-stubs';
import { TruncatePipeStub } from '../../../../../../test-config/pipe-stubs';

/* Default imports */
import { defaultRecipeMaster } from '../../../../shared/defaults';

/* Interface imports */
import { Grains, GrainBill, Hops, HopsSchedule, IngredientUpdateEvent, Process, ProcessUpdateEvent, RecipeMaster, RecipeVariant, SelectedUnits, TimerProcess, Yeast, YeastBatch, Style } from '../../../../shared/interfaces';

/* Service imports */
import { ActionSheetService, CalculationsService, IdService, ErrorReportingService, LibraryService, PreferencesService, ProcessService, RecipeService, ToastService, UtilityService } from '../../../../services/services';

/* Page imports */
import { RecipeFormComponent } from './recipe-form.component';


describe('RecipeFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<RecipeFormComponent>;
  let component: RecipeFormComponent;
  let originalOnInit: any;
  let originalOnDestroy: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ RecipeFormComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub },
        { provide: ProcessService, useClass: ProcessServiceStub },
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
    fixture = TestBed.createComponent(RecipeFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnInit = jest.fn();
    component.ngOnDestroy = jest.fn();
    component.toastService.presentToast = jest.fn();
    component.toastService.presentErrorToast = jest.fn();
    component.toastService.mediumDuration = 1500;
    component.errorReporter.handleUnhandledError = jest.fn();
    component.utilService.clone = jest.fn()
      .mockImplementation((recipe: any): any => recipe);
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (): void => {
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
      component.preferenceService.getSelectedUnits = jest.fn()
        .mockReturnValue(_mockEnglishUnits);
      component.listenForRoute = jest.fn();
      component.ngOnInit = originalOnInit;

      fixture.detectChanges();

      expect(component.units).toStrictEqual(_mockEnglishUnits);
    });

    test('should handle destroying the component', (): void => {
      const nextSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'complete');
      component.ngOnDestroy = originalOnDestroy;

      fixture.detectChanges();

      component.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

    test('should scroll to top on view leave', (): void => {
      fixture.detectChanges();

      const _stubContent: IonContent = ((new IonContentStub()) as unknown) as IonContent;
      _stubContent.scrollToTop = jest.fn();
      component.ionContent = _stubContent;
      const scrollSpy: jest.SpyInstance = jest.spyOn(component.ionContent, 'scrollToTop');
      component.ionViewDidLeave();
      expect(scrollSpy).toHaveBeenCalled();
    });

  });


  describe('Initializations', (): void => {

    test('should listen for route changes', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];
      component.router.getCurrentNavigation = jest.fn()
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
      component.setFormTypeConfiguration = jest.fn();
      component.errorReporter.handleGenericCatchError = jest.fn();
      const configSpy: jest.SpyInstance = jest.spyOn(component, 'setFormTypeConfiguration');

      fixture.detectChanges();

      component.listenForRoute();
      setTimeout((): void => {
        expect(configSpy).toHaveBeenCalledWith({
          formType: 'create',
          docMethod: 'create',
          masterData: _mockRecipeMasterActive,
          variantData: _mockRecipeVariantComplete
        });
        expect(component.isLoaded).toBe(true);
        done();
      }, 10);
    });

    test('should handle an error parsing route query params', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      component.router.getCurrentNavigation = jest.fn()
        .mockImplementation((): any => { throw _mockError; });
      component.errorReporter.handleGenericCatchError = jest.fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error).toStrictEqual(_mockError);
            return throwError(null);
          };
        });
      const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      component.listenForRoute();
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(null);
        done();
      }, 10);
    });

  });


  describe('Event Handlers', (): void => {

    test('should handle general form event', (): void => {
      const _mockFormValues: object = {
        mashDuration: 60,
        boilDuration: 60
      };
      component.updateDisplay = jest.fn();
      const displaySpy: jest.SpyInstance = jest.spyOn(component, 'updateDisplay');
      component.updateRecipeValues = jest.fn();
      const valuesSpy: jest.SpyInstance = jest.spyOn(component, 'updateRecipeValues');
      component.autoSetMashDuration = jest.fn();
      const mashSpy: jest.SpyInstance = jest.spyOn(component, 'autoSetMashDuration');
      component.autoSetBoilDuration = jest.fn();
      const boilSpy: jest.SpyInstance = jest.spyOn(component, 'autoSetBoilDuration');

      fixture.detectChanges();

      component.handleGeneralFormEvent(_mockFormValues);
      expect(displaySpy).toHaveBeenCalledWith(_mockFormValues);
      expect(valuesSpy).toHaveBeenCalled();
      expect(mashSpy).toHaveBeenCalledWith(_mockFormValues['mashDuration']);
      expect(boilSpy).toHaveBeenCalledWith(_mockFormValues['boilDuration']);
    });

    test('should handle ingredient update event', (): void => {
      component.updateIngredientList = jest.fn();
      const listSpy: jest.SpyInstance = jest.spyOn(component, 'updateIngredientList');
      component.sortIngredients = jest.fn();
      const sortSpy: jest.SpyInstance = jest.spyOn(component, 'sortIngredients');
      component.updateDisplay = jest.fn();
      const updateSpy: jest.SpyInstance = jest.spyOn(component, 'updateRecipeValues');
      component.autoSetHopsAdditions = jest.fn();
      const hopsSpy: jest.SpyInstance = jest.spyOn(component, 'autoSetHopsAdditions');

      fixture.detectChanges();

      const _mockUpdate: IngredientUpdateEvent = mockIngredientUpdateEvent('hops');
      component.handleIngredientUpdateEvent(_mockUpdate);
      expect(listSpy).toHaveBeenCalledWith(_mockUpdate);
      expect(sortSpy).toHaveBeenCalledWith(_mockUpdate.type);
      expect(updateSpy).toHaveBeenCalled();
      expect(hopsSpy).toHaveBeenCalled();
    });

    test('should handle process update event', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      component.variant = _mockRecipeVariantComplete;
      component.idService.getNewId = jest.fn()
        .mockReturnValue('123');

      fixture.detectChanges();

      const scheduleLength: number = _mockRecipeVariantComplete.processSchedule.length;
      const _mockAddProcess: ProcessUpdateEvent = mockProcessUpdateEvent('calendar');
      component.handleProcessUpdateEvent(_mockAddProcess);
      expect(component.variant.processSchedule.length).toEqual(scheduleLength + 1);
      const previousProcess: Process = component.variant.processSchedule[1];
      const _mockUpdateProcess: ProcessUpdateEvent = mockProcessUpdateEvent('manual', true, 1);
      component.handleProcessUpdateEvent(_mockUpdateProcess);
      expect(component.variant.processSchedule[1]).not.toStrictEqual(previousProcess);
      const _mockDeleteProcess: ProcessUpdateEvent = mockProcessUpdateEvent('timer', true, 1, true);
      component.handleProcessUpdateEvent(_mockDeleteProcess);
      expect(component.variant.processSchedule.length).toEqual(scheduleLength);
    });

    test('should handle note update event', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariant: RecipeVariant = _mockRecipeMasterActive.variants[0];
      component.master = _mockRecipeMasterActive;
      component.variant = _mockRecipeVariant;
      component.formType = 'master';

      fixture.detectChanges();

      const newNotes: string[] = [ 'a', 'b', 'c'];
      component.handleNoteUpdateEvent(newNotes);
      expect(_mockRecipeMasterActive.notes).toStrictEqual(newNotes);
      component.formType = 'variant';
      component.handleNoteUpdateEvent(newNotes);
      expect(_mockRecipeVariant.notes).toStrictEqual(newNotes);
    });

  });


  describe('Auto Generation Functions', (): void => {

    test('should auto set boil duration', (): void => {
      component.processService.autoSetBoilDuration = jest.fn()
        .mockImplementation((schedule: Process[], ...args: any[]): Process[] => schedule);
      const setSpy: jest.SpyInstance = jest.spyOn(component.processService, 'autoSetBoilDuration');
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      component.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      component.autoSetBoilDuration(60);
      expect(setSpy).toHaveBeenCalledWith(
        _mockRecipeVariantComplete.processSchedule,
        60,
        _mockRecipeVariantComplete.hops
      );
    });

    test('should auto set hops additions', (): void => {
      component.processService.autoSetHopsAdditions = jest.fn()
        .mockImplementation((schedule: Process[], ...args: any[]): Process[] => schedule);
      const setSpy: jest.SpyInstance = jest.spyOn(component.processService, 'autoSetHopsAdditions');
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      component.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      component.autoSetHopsAdditions();
      expect(setSpy).toHaveBeenCalledWith(
        _mockRecipeVariantComplete.processSchedule,
        _mockRecipeVariantComplete.boilDuration,
        _mockRecipeVariantComplete.hops
      );
    });

    test('should auto set mash duration', (): void => {
      component.processService.autoSetMashDuration = jest.fn()
        .mockImplementation((schedule: Process[], ...args: any[]): Process[] => schedule);
      const setSpy: jest.SpyInstance = jest.spyOn(component.processService, 'autoSetMashDuration');
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      component.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      component.autoSetMashDuration(60);
      expect(setSpy).toHaveBeenCalledWith(_mockRecipeVariantComplete.processSchedule, 60);
    });

  });


  describe('Form Data Handling', (): void => {

    test('should format form payload', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];
      component.master = _mockRecipeMasterActive;
      component.variant = _mockRecipeVariantComplete;
      component.formType = 'master';
      component.docMethod = 'create';

      fixture.detectChanges();

      const masterCreate: object = component.constructPayload();
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
      component.docMethod = 'update';

      fixture.detectChanges();

      const masterUpdate: object = component.constructPayload();
      expect(masterUpdate).toStrictEqual({
        name: _mockRecipeMasterActive.name,
        style: _mockRecipeMasterActive.style,
        notes: _mockRecipeMasterActive.notes,
        isPublic: _mockRecipeMasterActive.isPublic,
        labelImage: _mockRecipeMasterActive.labelImage
      });
      component.formType = 'variant';

      fixture.detectChanges();

      const variantUpdate: object = component.constructPayload();
      expect(variantUpdate).toStrictEqual(_mockRecipeVariantComplete);
    });

    test('should init the form in master creation mode', (): void => {
      const _defaultRecipeMaster: RecipeMaster = defaultRecipeMaster();

      fixture.detectChanges();

      component.initCreateMasterForm();
      expect(component.submitSuccessMessage).toMatch('New Recipe Created');
      expect(component.isGeneralFormComplete).toBe(false);
      expect(component.title).toMatch('Create Recipe');
      expect(component.master).toStrictEqual(_defaultRecipeMaster);
      expect(component.variant).toStrictEqual(_defaultRecipeMaster.variants[0]);
      expect(component.previousRoute).toMatch('/tabs/recipe');
    });

    test('should init the form in variant creation mode', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      component.idService.getId = jest.fn()
        .mockReturnValue(_mockRecipeMasterActive._id);

      fixture.detectChanges();

      component.initCreateVariantForm(_mockRecipeMasterActive);
      expect(component.submitSuccessMessage).toMatch('New Variant Created');
      expect(component.isGeneralFormComplete).toBe(false);
      expect(component.title).toMatch('Add Variant');
      expect(component.master).toStrictEqual(_mockRecipeMasterActive);
      expect(component.previousRoute).toMatch('/tabs/recipe');
      expect(component.variant.variantName.length).toEqual(0);
    });

    test('should init the form in master update mode', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      component.idService.getId = jest.fn()
        .mockReturnValue(_mockRecipeMasterActive._id);

      fixture.detectChanges();

      component.initUpdateMasterForm(_mockRecipeMasterActive);
      expect(component.submitSuccessMessage).toMatch('Recipe Update Successful');
      expect(component.isGeneralFormComplete).toBe(true);
      expect(component.title).toMatch('Update Recipe');
      expect(component.master).toStrictEqual(_mockRecipeMasterActive);
      expect(component.variant).toStrictEqual(_mockRecipeMasterActive.variants[0]);
      expect(component.previousRoute).toMatch(`/tabs/recipe/${_mockRecipeMasterActive._id}`);
    });

    test('should init the form in variant update mode', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];
      component.idService.getId = jest.fn()
        .mockReturnValue(_mockRecipeMasterActive._id);

      fixture.detectChanges();

      component.initUpdateVariantForm(_mockRecipeMasterActive, _mockRecipeVariantComplete);
      expect(component.submitSuccessMessage).toMatch('Variant Update Successful');
      expect(component.isGeneralFormComplete).toBe(true);
      expect(component.title).toMatch('Update Variant');
      expect(component.master).toStrictEqual(_mockRecipeMasterActive);
      expect(component.variant).toStrictEqual(_mockRecipeMasterActive.variants[0]);
      expect(component.previousRoute).toMatch(`/tabs/recipe/${_mockRecipeMasterActive._id}`);
    });

    test('should submit recipe master post form', (done: jest.DoneCallback): void => {
      component.submitRecipeMasterPost = jest.fn()
        .mockReturnValue(of(null));
      component.navToPreviousRoute = jest.fn();
      component.submitSuccessMessage = 'test-message';
      const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');
      const navSpy: jest.SpyInstance = jest.spyOn(component, 'navToPreviousRoute');
      component.formType = 'master';
      component.docMethod = 'create';

      fixture.detectChanges();

      component.onSubmit();
      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('test-message', 1500, 'middle', 'toast-bright');
        expect(navSpy).toHaveBeenCalled();
        done();
      });
    });

    test('should submit recipe master patch form', (done: jest.DoneCallback): void => {
      component.submitRecipeMasterPatch = jest.fn()
        .mockReturnValue(of(null));
      component.navToPreviousRoute = jest.fn();
      component.submitSuccessMessage = 'test-message';
      const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');
      const navSpy: jest.SpyInstance = jest.spyOn(component, 'navToPreviousRoute');
      component.formType = 'master';
      component.docMethod = 'update';

      fixture.detectChanges();

      component.onSubmit();
      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('test-message', 1500, 'middle', 'toast-bright');
        expect(navSpy).toHaveBeenCalled();
        done();
      });
    });

    test('should submit recipe variant post form', (done: jest.DoneCallback): void => {
      component.submitRecipeVariantPost = jest.fn()
        .mockReturnValue(of(null));
      component.navToPreviousRoute = jest.fn();
      component.submitSuccessMessage = 'test-message';
      const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');
      const navSpy: jest.SpyInstance = jest.spyOn(component, 'navToPreviousRoute');
      component.formType = 'variant';
      component.docMethod = 'create';

      fixture.detectChanges();

      component.onSubmit();
      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('test-message', 1500, 'middle', 'toast-bright');
        expect(navSpy).toHaveBeenCalled();
        done();
      });
    });

    test('should submit recipe variant patch form', (done: jest.DoneCallback): void => {
      component.submitRecipeVariantPatch = jest.fn()
        .mockReturnValue(of(null));
      component.navToPreviousRoute = jest.fn();
      component.submitSuccessMessage = 'test-message';
      const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');
      const navSpy: jest.SpyInstance = jest.spyOn(component, 'navToPreviousRoute');
      component.formType = 'variant';
      component.docMethod = 'update';

      fixture.detectChanges();

      component.onSubmit();
      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('test-message', 1500, 'middle', 'toast-bright');
        expect(navSpy).toHaveBeenCalled();
        done();
      });
    });

    test('should handle error on form submission', (done: jest.DoneCallback): void => {
      component.formType = 'master';
      component.docMethod = 'create';
      const _mockError: Error = new Error('test-error');
      component.submitRecipeMasterPost = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      component.onSubmit();
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should set form type configuration for recipe master create', (): void => {
      const initSpy: jest.SpyInstance = jest.spyOn(component, 'initCreateMasterForm');

      fixture.detectChanges();

      const masterCreationState: { [key: string]: any } = { formType: 'master', docMethod: 'create' };
      component.setFormTypeConfiguration(masterCreationState);
      expect(component.formType).toMatch('master');
      expect(component.docMethod).toMatch('create');
      expect(initSpy).toHaveBeenCalled();
    });

    test('should set form type configuration for recipe master update', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const initSpy: jest.SpyInstance = jest.spyOn(component, 'initUpdateMasterForm');

      fixture.detectChanges();

      const masterUpdateState: { [key: string]: any } = {
        formType: 'master',
        docMethod: 'update',
        masterData: _mockRecipeMasterActive
      };
      component.setFormTypeConfiguration(masterUpdateState);
      expect(component.formType).toMatch('master');
      expect(component.docMethod).toMatch('update');
      expect(initSpy).toHaveBeenCalledWith(_mockRecipeMasterActive);
    });

    test('should set form type configuration for recipe variant create', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const initSpy: jest.SpyInstance = jest.spyOn(component, 'initCreateVariantForm');

      fixture.detectChanges();

      const variantCreationState: { [key: string]: any } = {
        formType: 'variant',
        docMethod: 'create',
        masterData: _mockRecipeMasterActive
      };
      component.setFormTypeConfiguration(variantCreationState);
      expect(component.formType).toMatch('variant');
      expect(component.docMethod).toMatch('create');
      expect(initSpy).toHaveBeenCalled();
    });

    test('should set form type configuration for recipe variant update', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const initSpy: jest.SpyInstance = jest.spyOn(component, 'initUpdateVariantForm');

      fixture.detectChanges();

      const variantUpdateState: { [key: string]: any } = {
        formType: 'variant',
        docMethod: 'update',
        masterData: _mockRecipeMasterActive,
        variantData: _mockRecipeVariantComplete
      };
      component.setFormTypeConfiguration(variantUpdateState);
      expect(component.formType).toMatch('variant');
      expect(component.docMethod).toMatch('update');
      expect(initSpy).toHaveBeenCalled();
    });

    test('should submit a recipe master patch', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];
      component.master = _mockRecipeMasterActive;
      component.variant = _mockRecipeVariantComplete;
      component.constructPayload = jest.fn()
        .mockReturnValue({});
      component.recipeService.updateRecipeMasterById = jest.fn()
        .mockReturnValue(of(null));
      component.idService.getId = jest.fn()
        .mockReturnValue(_mockRecipeMasterActive._id);
      const updateSpy: jest.SpyInstance = jest.spyOn(component.recipeService, 'updateRecipeMasterById');

      fixture.detectChanges();

      component.submitRecipeMasterPatch().subscribe();
      expect(updateSpy).toHaveBeenCalledWith(_mockRecipeMasterActive._id, {});
    });

    test('should submit a recipe variant patch', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];
      component.master = _mockRecipeMasterActive;
      component.variant = _mockRecipeVariantComplete;
      component.constructPayload = jest.fn()
        .mockReturnValue({});
      component.recipeService.updateRecipeVariantById = jest.fn()
        .mockReturnValue(of(null));
      component.idService.getId = jest.fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(_mockRecipeVariantComplete._id);
      const updateSpy: jest.SpyInstance = jest.spyOn(component.recipeService, 'updateRecipeVariantById');

      fixture.detectChanges();

      component.submitRecipeVariantPatch().subscribe();
      expect(updateSpy).toHaveBeenCalledWith(
        _mockRecipeMasterActive._id,
        _mockRecipeVariantComplete._id,
        {}
      );
    });

    test('should submit a recipe master post', (): void => {
      component.constructPayload = jest.fn()
        .mockReturnValue({});
      component.recipeService.createRecipeMaster = jest.fn()
        .mockReturnValue(of(null));
      const updateSpy: jest.SpyInstance = jest.spyOn(component.recipeService, 'createRecipeMaster');

      fixture.detectChanges();

      component.submitRecipeMasterPost().subscribe();
      expect(updateSpy).toHaveBeenCalledWith({});
    });

    test('should submit a recipe variant post', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      component.master = _mockRecipeMasterActive;
      component.constructPayload = jest.fn()
        .mockReturnValue({});
      component.recipeService.createRecipeVariant = jest.fn()
        .mockReturnValue(of(null));
      component.idService.getId = jest.fn()
        .mockReturnValue(_mockRecipeMasterActive._id);
      const updateSpy: jest.SpyInstance = jest.spyOn(component.recipeService, 'createRecipeVariant');

      fixture.detectChanges();

      component.submitRecipeVariantPost().subscribe();
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
      component.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      expect(
        component.getIngredientIndex('grains', _mockRecipeVariantComplete.grains[grainTargetIndex])
      ).toEqual(2);
      expect(
        component.getIngredientIndex('hops', _mockRecipeVariantComplete.hops[hopsTargetIndex])
      ).toEqual(1);
      expect(
        component.getIngredientIndex('yeast', _mockRecipeVariantComplete.yeast[yeastTargetIndex])
      ).toEqual(1);
      expect(
        component.getIngredientIndex('otherIngredients', _mockRecipeVariantComplete.otherIngredients[otherTargetIndex])
      ).toEqual(0);
      expect(component.getIngredientIndex('otherIngredients', undefined)).toEqual(-1);
    });

    test('should compare names to determine if they should be swapped', (): void => {
      fixture.detectChanges();

      expect(component.shouldSwapByName('Before', 'later')).toBe(false);
      expect(component.shouldSwapByName('before', 'After')).toBe(true);
    });

    test('should sort grain bill by quantity or by name if quantities are equal', (): void => {
      const _mockGrainBill: GrainBill[] = mockGrainBill();
      _mockGrainBill[0].quantity = 8;
      _mockGrainBill[1].quantity = 0.5;
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      _mockRecipeVariantComplete.grains.push(_mockGrainBill[1]);
      _mockRecipeVariantComplete.grains.push(_mockGrainBill[0]);
      component.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      component.sortGrains();
      expect(component.variant.grains[1]).toStrictEqual(_mockGrainBill[0]);
      expect(component.variant.grains[3]).toStrictEqual(_mockGrainBill[1]);
    });

    test('should sort hops schedule by quantity or by name if quantities are equal', (): void => {
      const _mockBaseHopsSchedule: HopsSchedule[] = mockHopsSchedule();
      const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
      const _mockHopsSchedule0: HopsSchedule = _mockHopsSchedule[0];
      _mockHopsSchedule0.dryHop = true;
      const _mockHopsSchedule1: HopsSchedule = _mockHopsSchedule[1];
      const _mockHopsSchedule2: HopsSchedule = _mockHopsSchedule[2];
      const _mockHopsSchedule3: HopsSchedule = _mockHopsSchedule[3];
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
      component.variant = _mockRecipeVariantComplete;
      component.shouldSwapByName = jest.fn()
        .mockImplementation((n1: string, n2: string): boolean => n1.toLowerCase() > n2.toLowerCase());

      fixture.detectChanges();

      component.sortHops();
      component.variant.hops.reduce((acc: HopsSchedule, curr: HopsSchedule): HopsSchedule => {
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
      component.sortGrains = jest.fn();
      component.sortHops = jest.fn();
      component.sortYeast = jest.fn();
      const grainsSpy: jest.SpyInstance = jest.spyOn(component, 'sortGrains');
      const hopsSpy: jest.SpyInstance = jest.spyOn(component, 'sortHops');
      const yeastSpy: jest.SpyInstance = jest.spyOn(component, 'sortYeast');

      fixture.detectChanges();

      component.sortIngredients('grains');
      expect(grainsSpy).toHaveBeenCalled();
      expect(hopsSpy).not.toHaveBeenCalled();
      expect(yeastSpy).not.toHaveBeenCalled();
      component.sortIngredients('hops');
      expect(grainsSpy).toHaveBeenCalledTimes(1);
      expect(hopsSpy).toHaveBeenCalled();
      expect(yeastSpy).not.toHaveBeenCalled();
      component.sortIngredients('yeast');
      expect(grainsSpy).toHaveBeenCalledTimes(1);
      expect(hopsSpy).toHaveBeenCalledTimes(1);
      expect(yeastSpy).toHaveBeenCalled();
      component.sortIngredients('invalid');
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
      component.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      component.sortYeast();
      component.variant.yeast.reduce((acc: YeastBatch, curr: YeastBatch): YeastBatch => {
        if (acc.quantity === curr.quantity) {
          expect(acc.yeastType.name.toLowerCase() < curr.yeastType.name.toLowerCase()).toBe(true);
        } else {
          expect(acc.quantity > curr.quantity);
        }
        return curr;
      });
    });

    test('should update ingredient list', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      component.variant = _mockRecipeVariantComplete;
      component.getIngredientIndex = jest.fn()
        .mockReturnValue(1);

      fixture.detectChanges();

      const listLength: number = _mockRecipeVariantComplete.grains.length;
      const _mockAddIngredient: IngredientUpdateEvent = mockIngredientUpdateEvent('grains');
      component.updateIngredientList(_mockAddIngredient);
      expect(component.variant.grains.length).toEqual(listLength + 1);
      const previousIngredient: GrainBill = component.variant.grains[1];
      const _mockUpdateIngredient: IngredientUpdateEvent = mockIngredientUpdateEvent('grains', true, 1);
      component.updateIngredientList(_mockUpdateIngredient);
      expect(component.variant.grains[1]).not.toStrictEqual(previousIngredient);
      const _mockDeleteIngredient: IngredientUpdateEvent = mockIngredientUpdateEvent('grains', true, 1, true);
      component.updateIngredientList(_mockDeleteIngredient);
      expect(component.variant.grains.length).toEqual(listLength);
    });

  });


  describe('Other', (): void => {

    test('should nav to previous route', (): void => {
      component.previousRoute = 'test-route';
      component.router.navigate = jest.fn();
      const navSpy: jest.SpyInstance = jest.spyOn(component.router, 'navigate');

      fixture.detectChanges();

      component.navToPreviousRoute();
      expect(navSpy).toHaveBeenCalledWith(['test-route']);
    });

    test('should apply list reorder results to process schedule', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      _mockRecipeVariantComplete.processSchedule = [];
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      component.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      expect(component.variant.processSchedule.length).toEqual(0);
      component.onReorder(_mockProcessSchedule);
      expect(component.variant.processSchedule).toStrictEqual(_mockProcessSchedule);
    });

    test('should update display with given values', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      component.master = _mockRecipeMasterActive;
      component.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      component.updateDisplay({
        name: 'updated name',
        variantName: 'updated variant name',
        none: 'should not update'
      });
      expect(component.master.name).toMatch('updated name');
      expect(component.variant.variantName).toMatch('updated variant name');
      expect(component.master['none']).toBeUndefined();
      expect(component.variant['none']).toBeUndefined();
    });

    test('should update recipe values', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      component.variant = _mockRecipeVariantComplete;
      component.calculator.calculateRecipeValues = jest.fn();
      const calcSpy: jest.SpyInstance = jest.spyOn(component.calculator, 'calculateRecipeValues');

      fixture.detectChanges();

      component.updateRecipeValues();
      expect(calcSpy).toHaveBeenCalledWith(_mockRecipeVariantComplete);
    });

  });


  describe('Template Render', (): void => {

    test('should render the template as initial state', (): void => {
      component.isLoaded = true;
      component.isGeneralFormComplete = false;
      component.formType = 'master';
      component.docMethod = 'create';
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      component.master = _mockRecipeMasterActive;
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      component.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      const genFormElem: Element = fixture.nativeElement.querySelector('app-general-form-button');
      expect(genFormElem['formType']).toMatch('master');
      expect(genFormElem['docMethod']).toMatch('create');
      expect(genFormElem['isGeneralFormComplete']).toBe(false);
      expect(genFormElem['master']).toStrictEqual(_mockRecipeMasterActive);
      expect(genFormElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const quickViewElem: Element = fixture.nativeElement.querySelector('app-recipe-quick-data');
      expect(quickViewElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const ingredientElem: Element = fixture.nativeElement.querySelector('app-ingredient-container');
      expect(ingredientElem['isAddButtonDisabled']).toBe(true);
      expect(ingredientElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const processElem: Element = fixture.nativeElement.querySelector('app-process-container');
      expect(processElem['isAddButtonDisabled']).toBe(true);
      expect(processElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const noteElem: Element = fixture.nativeElement.querySelector('app-note-container');
      expect(noteElem['isAddButtonDisabled']).toBe(true);
      expect(noteElem['noteType']).toMatch('master');
      expect(noteElem['notes']).toStrictEqual(_mockRecipeMasterActive.notes);
      const saveButton: Element = fixture.nativeElement.querySelector('ion-button');
      expect(saveButton.textContent).toMatch('SAVE');
    });

    test('should render the template as master update', (): void => {
      component.isLoaded = true;
      component.isGeneralFormComplete = true;
      component.formType = 'master';
      component.docMethod = 'update';
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      component.master = _mockRecipeMasterActive;
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      component.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      const genFormElem: Element = fixture.nativeElement.querySelector('app-general-form-button');
      expect(genFormElem['formType']).toMatch('master');
      expect(genFormElem['docMethod']).toMatch('update');
      expect(genFormElem['isGeneralFormComplete']).toBe(true);
      expect(genFormElem['master']).toStrictEqual(_mockRecipeMasterActive);
      expect(genFormElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const quickViewElem: Element = fixture.nativeElement.querySelector('app-recipe-quick-data');
      expect(quickViewElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const ingredientElem: Element = fixture.nativeElement.querySelector('app-ingredient-container');
      expect(ingredientElem).toBeNull();
      const processElem: Element = fixture.nativeElement.querySelector('app-process-container');
      expect(processElem).toBeNull();
      const noteElem: Element = fixture.nativeElement.querySelector('app-note-container');
      expect(noteElem['isAddButtonDisabled']).toBe(false);
      expect(noteElem['noteType']).toMatch('master');
      expect(noteElem['notes']).toStrictEqual(_mockRecipeMasterActive.notes);
      const saveButton: Element = fixture.nativeElement.querySelector('ion-button');
      expect(saveButton.textContent).toMatch('SAVE');
    });

    test('should render the template as new variant', (): void => {
      component.isLoaded = true;
      component.isGeneralFormComplete = true;
      component.formType = 'variant';
      component.docMethod = 'create';
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      component.master = _mockRecipeMasterActive;
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      component.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      const genFormElem: Element = fixture.nativeElement.querySelector('app-general-form-button');
      expect(genFormElem['formType']).toMatch('variant');
      expect(genFormElem['docMethod']).toMatch('create');
      expect(genFormElem['isGeneralFormComplete']).toBe(true);
      expect(genFormElem['master']).toStrictEqual(_mockRecipeMasterActive);
      expect(genFormElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const quickViewElem: Element = fixture.nativeElement.querySelector('app-recipe-quick-data');
      expect(quickViewElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const ingredientElem: Element = fixture.nativeElement.querySelector('app-ingredient-container');
      expect(ingredientElem['isAddButtonDisabled']).toBe(false);
      expect(ingredientElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const processElem: Element = fixture.nativeElement.querySelector('app-process-container');
      expect(processElem['isAddButtonDisabled']).toBe(false);
      expect(processElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const noteElem: Element = fixture.nativeElement.querySelector('app-note-container');
      expect(noteElem['isAddButtonDisabled']).toBe(false);
      expect(noteElem['noteType']).toMatch('variant');
      expect(noteElem['notes']).toStrictEqual(_mockRecipeVariantComplete.notes);
      const saveButton: Element = fixture.nativeElement.querySelector('ion-button');
      expect(saveButton.textContent).toMatch('SAVE');
    });

    test('should render the template as variant update', (): void => {
      component.isLoaded = true;
      component.isGeneralFormComplete = true;
      component.formType = 'variant';
      component.docMethod = 'update';
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      component.master = _mockRecipeMasterActive;
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      component.variant = _mockRecipeVariantComplete;

      fixture.detectChanges();

      const genFormElem: Element = fixture.nativeElement.querySelector('app-general-form-button');
      expect(genFormElem['formType']).toMatch('variant');
      expect(genFormElem['docMethod']).toMatch('update');
      expect(genFormElem['isGeneralFormComplete']).toBe(true);
      expect(genFormElem['master']).toStrictEqual(_mockRecipeMasterActive);
      expect(genFormElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const quickViewElem: Element = fixture.nativeElement.querySelector('app-recipe-quick-data');
      expect(quickViewElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const ingredientElem: Element = fixture.nativeElement.querySelector('app-ingredient-container');
      expect(ingredientElem['isAddButtonDisabled']).toBe(false);
      expect(ingredientElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const processElem: Element = fixture.nativeElement.querySelector('app-process-container');
      expect(processElem['isAddButtonDisabled']).toBe(false);
      expect(processElem['variant']).toStrictEqual(_mockRecipeVariantComplete);
      const noteElem: Element = fixture.nativeElement.querySelector('app-note-container');
      expect(noteElem['isAddButtonDisabled']).toBe(false);
      expect(noteElem['noteType']).toMatch('variant');
      expect(noteElem['notes']).toStrictEqual(_mockRecipeVariantComplete.notes);
      const saveButton: Element = fixture.nativeElement.querySelector('ion-button');
      expect(saveButton.textContent).toMatch('SAVE');
    });

  });

});
