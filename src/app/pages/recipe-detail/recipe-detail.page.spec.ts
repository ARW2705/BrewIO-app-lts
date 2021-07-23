/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockErrorReport, mockRecipeMasterActive, mockRecipeVariantComplete } from '../../../../test-config/mock-models';
import { AnimationsServiceStub, ErrorReportingServiceStub, IdServiceStub, RecipeServiceStub, ToastServiceStub, UtilityServiceStub } from '../../../../test-config/service-stubs';
import { AccordionComponentStub, ConfirmationPageStub, HeaderComponentStub, IngredientListComponentStub, NoteListComponentStub } from '../../../../test-config/component-stubs';
import { RoundPipeStub, TruncatePipeStub, UnitConversionPipeStub } from '../../../../test-config/pipe-stubs';
import { ActivatedRouteStub, ModalControllerStub, ModalStub, IonContentStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { ErrorReport, HopsSchedule, RecipeMaster, RecipeVariant } from '../../shared/interfaces';

/* Service imports */
import { AnimationsService, ErrorReportingService, IdService, RecipeService, ToastService, UtilityService } from '../../services/services';

/* Page imports */
import { ConfirmationPage } from '../confirmation/confirmation.page';
import { RecipeDetailPage } from './recipe-detail.page';


describe('RecipeDetailPage', (): void => {
  let fixture: ComponentFixture<RecipeDetailPage>;
  let detailPage: RecipeDetailPage;
  let originalOnInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    ActivatedRouteStub.getter = () => 'test-id';

    TestBed.configureTestingModule({
      declarations: [
        RecipeDetailPage,
        RoundPipeStub,
        TruncatePipeStub,
        UnitConversionPipeStub,
        AccordionComponentStub,
        HeaderComponentStub,
        NoteListComponentStub,
        IngredientListComponentStub,
        ConfirmationPageStub
      ],
      imports: [
        IonicModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: AnimationsService, useClass: AnimationsServiceStub },
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
    fixture = TestBed.createComponent(RecipeDetailPage);
    detailPage = fixture.componentInstance;
    originalOnInit = detailPage.ngOnInit;
    originalOnDestroy = detailPage.ngOnDestroy;
    detailPage.ngOnInit = jest
      .fn();
    detailPage.ngOnDestroy = jest
      .fn();
    detailPage.toastService.presentToast = jest
      .fn();
    detailPage.toastService.presentErrorToast = jest
      .fn();
    detailPage.errorReporter.handleUnhandledError = jest
      .fn();
    detailPage.errorReporter.setErrorReport = jest
      .fn();
    detailPage.errorReporter.createErrorReport = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(detailPage).toBeDefined();
    expect(detailPage.recipeMasterId).toMatch('test-id');
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);

      detailPage.ngOnInit = originalOnInit;

      detailPage.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      detailPage.mapVariantList = jest
        .fn();

      const mapSpy: jest.SpyInstance = jest.spyOn(detailPage, 'mapVariantList');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(detailPage.recipeMaster).toStrictEqual(_mockRecipeMasterActive);
        expect(mapSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle error on init', (): void => {
      const _mockError: Error = new Error('test-error');

      detailPage.ngOnInit = originalOnInit;

      detailPage.recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      detailPage.navToRoot.bind = jest
        .fn()
        .mockImplementation((page: RecipeDetailPage): () => void => {
          return page.navToRoot;
        });

      const errorSpy: jest.SpyInstance = jest.spyOn(detailPage.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      expect(errorSpy).toHaveBeenCalledWith(_mockError);
    });

    test('should trigger gesture hint animation after view has entered', (): void => {
      detailPage.animationService.shouldShowHint = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      detailPage.runSlidingHints = jest
        .fn();

      const runSpy: jest.SpyInstance = jest.spyOn(detailPage, 'runSlidingHints');

      fixture.detectChanges();

      detailPage.ionViewDidEnter();

      expect(runSpy).not.toHaveBeenCalled();

      detailPage.ionViewDidEnter();

      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle component destroy', (): void => {
      const nextSpy: jest.SpyInstance = jest.spyOn(detailPage.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(detailPage.destroy$, 'complete');

      detailPage.ngOnDestroy = originalOnDestroy;

      fixture.detectChanges();

      detailPage.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

    test('should handle leaving view', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      detailPage.recipeMaster = _mockRecipeMasterActive;

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      fixture.whenStable()
        .then((): void => {
          detailPage.slidingItemsList.closeSlidingItems = jest
            .fn()
            .mockReturnValue(Promise.resolve());

          detailPage.ionViewDidLeave();

          setTimeout((): void => {
            expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('sliding items closed');
            done();
          }, 10);
        });
    });

    test('should get error handling leaving view', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      detailPage.recipeMaster = _mockRecipeMasterActive;

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      fixture.whenStable()
        .then((): void => {
          detailPage.slidingItemsList.closeSlidingItems = jest
            .fn()
            .mockReturnValue(Promise.reject('test-error'));

          detailPage.ionViewDidLeave();

          setTimeout((): void => {
            const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
            expect(consoleCalls[0]).toMatch('error closing sliding items');
            expect(consoleCalls[1]).toMatch('test-error');
            done();
          }, 10);
        });
    });

  });


  describe('Navigation', (): void => {

    test('should nav to a brew process', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      detailPage.recipeMasterId = _mockRecipeMasterActive._id;
      detailPage.recipeMaster = _mockRecipeMasterActive;

      detailPage.recipeService.isRecipeProcessPresent = jest
        .fn()
        .mockReturnValue(true);

      detailPage.router.navigate = jest
        .fn();

      detailPage.idService.getId = jest
        .fn()
        .mockReturnValueOnce(_mockRecipeVariantComplete._id)
        .mockReturnValueOnce(_mockRecipeMasterActive._id);

      const navSpy: jest.SpyInstance = jest.spyOn(detailPage.router, 'navigate');

      fixture.detectChanges();

      detailPage.navToBrewProcess(_mockRecipeVariantComplete);

      expect(navSpy).toHaveBeenCalledWith(
        ['tabs/process'],
        {
          state: {
            recipeMasterId: _mockRecipeMasterActive._id,
            recipeVariantId: _mockRecipeVariantComplete._id,
            requestedUserId: _mockRecipeMasterActive.owner,
            rootURL: `tabs/recipe/${_mockRecipeMasterActive._id}`
          }
        }
      );
    });

    test('should get error navigating to brew process', (): void => {
      detailPage.recipeService.isRecipeProcessPresent = jest
        .fn()
        .mockReturnValue(false);

      const errorSpy: jest.SpyInstance = jest.spyOn(detailPage.errorReporter, 'createErrorReport');

      fixture.detectChanges();

      detailPage.navToBrewProcess(null);

      expect(errorSpy).toHaveBeenCalledWith(
        'MissingError',
        'Recipe is missing a process guide',
        3,
        'Recipe is missing a process guide'
      );
    });

    test('should nav to recipe form to update master', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      detailPage.recipeMaster = _mockRecipeMasterActive;

      detailPage.router.navigate = jest
        .fn();

      const navSpy: jest.SpyInstance = jest.spyOn(detailPage.router, 'navigate');

      fixture.detectChanges();

      detailPage.navToRecipeForm('master');

      expect(navSpy).toHaveBeenCalledWith(
        ['tabs/recipe-form'],
        {
          state: {
            docMethod: 'update',
            formType: 'master',
            masterData: _mockRecipeMasterActive
          }
        }
      );
    });

    test('should nav to recipe form to update variant', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      detailPage.recipeMaster = _mockRecipeMasterActive;

      detailPage.router.navigate = jest
        .fn();

      detailPage.idService.getId = jest
        .fn()
        .mockReturnValue('');
      detailPage.idService.hasId = jest
        .fn()
        .mockReturnValue(true);

      const navSpy: jest.SpyInstance = jest.spyOn(detailPage.router, 'navigate');

      fixture.detectChanges();

      detailPage.navToRecipeForm('variant', _mockRecipeVariantComplete);

      expect(navSpy).toHaveBeenCalledWith(
        ['tabs/recipe-form'],
        {
          state: {
            docMethod: 'update',
            formType: 'variant',
            masterData: _mockRecipeMasterActive,
            variantData: _mockRecipeVariantComplete
          }
        }
      );
    });

    test('should nav to recipe form to create a variant', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      detailPage.recipeMaster = _mockRecipeMasterActive;

      detailPage.router.navigate = jest
        .fn();

      const navSpy: jest.SpyInstance = jest.spyOn(detailPage.router, 'navigate');

      fixture.detectChanges();

      detailPage.navToRecipeForm('variant');

      expect(navSpy).toHaveBeenCalledWith(
        ['tabs/recipe-form'],
        {
          state: {
            docMethod: 'create',
            formType: 'variant',
            masterData: _mockRecipeMasterActive
          }
        }
      );
    });

    test('should nav to root tab', (): void => {
      detailPage.router.navigate = jest
        .fn();

      const navSpy: jest.SpyInstance = jest.spyOn(detailPage.router, 'navigate');

      fixture.detectChanges();

      detailPage.navToRoot();

      expect(navSpy).toHaveBeenCalledWith(['tabs/recipe']);
    });

  });


  describe('Modals', (): void => {

    test('should open confirmation modal and receive success', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      detailPage.displayVariantList = [ _mockRecipeVariantComplete ];

      detailPage.modalCtrl.create = jest
        .fn()
        .mockReturnValue(_stubModal);

      detailPage.onConfirmDeleteModalSuccessDismiss = jest
        .fn()
        .mockReturnValue(() => {});

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve());

      const createSpy: jest.SpyInstance = jest.spyOn(detailPage.modalCtrl, 'create');
      const dismissSpy: jest.SpyInstance = jest.spyOn(detailPage, 'onConfirmDeleteModalSuccessDismiss');

      fixture.detectChanges();

      detailPage.confirmDelete(0);

      expect(createSpy).toHaveBeenCalledWith({
        component: ConfirmationPage,
        componentProps: {
          message: `Confirm deletion of "${_mockRecipeVariantComplete.variantName}"`,
          subMessage: 'This action cannot be reversed'
        }
      });

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(dismissSpy).toHaveBeenCalledWith(0);
        done();
      }, 10);
    });

    test('should open confirmation modal and receive error', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      detailPage.displayVariantList = [ _mockRecipeVariantComplete ];

      detailPage.modalCtrl.create = jest
        .fn()
        .mockReturnValue(_stubModal);

      detailPage.onConfirmDeleteModalErrorDismiss = jest
        .fn()
        .mockReturnValue(() => {});

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.reject());

      const createSpy: jest.SpyInstance = jest.spyOn(detailPage.modalCtrl, 'create');
      const dismissSpy: jest.SpyInstance = jest.spyOn(detailPage, 'onConfirmDeleteModalErrorDismiss');

      fixture.detectChanges();

      detailPage.confirmDelete(0);

      expect(createSpy).toHaveBeenCalledWith({
        component: ConfirmationPage,
        componentProps: {
          message: `Confirm deletion of "${_mockRecipeVariantComplete.variantName}"`,
          subMessage: 'This action cannot be reversed'
        }
      });

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(dismissSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle confirm deletion modal error', (): void => {
      const errMsg: string = 'test-error';

      const errorSpy: jest.SpyInstance = jest.spyOn(detailPage.errorReporter, 'createErrorReport');

      fixture.detectChanges();

      const errorHandler: (error: string) => void = detailPage.onConfirmDeleteModalErrorDismiss();
      errorHandler(errMsg);

      expect(errorSpy).toHaveBeenCalledWith(
        'ModalError',
        errMsg,
        3,
        errMsg
      );
    });

    test('should handle confirm deletion modal success with confirmation', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      detailPage.recipeMaster = _mockRecipeMasterActive;
      detailPage.displayVariantList = [ _mockRecipeVariantComplete ];

      detailPage.recipeService.removeRecipeVariantById = jest
        .fn()
        .mockReturnValue(of({}));

      detailPage.idService.getId = jest
        .fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(_mockRecipeVariantComplete._id);

      const toastSpy: jest.SpyInstance = jest.spyOn(detailPage.toastService, 'presentToast');

      fixture.detectChanges();

      const successHandler: (data: object) => void = detailPage.onConfirmDeleteModalSuccessDismiss(0);
      successHandler({ data: true });

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Variant deleted!', 1500, 'middle');
        done();
      }, 10);
    });

    test('should handle confirm deletion modal success without confirmation', (done: jest.DoneCallback): void => {
      const removeSpy: jest.SpyInstance = jest.spyOn(detailPage.recipeService, 'removeRecipeVariantById');

      fixture.detectChanges();

      const successHandler: (data: object) => void = detailPage.onConfirmDeleteModalSuccessDismiss(0);
      successHandler({ data: false });

      setTimeout((): void => {
        expect(removeSpy).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle confirm deletion modal success, but get service error', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockError: Error = new Error('test-error');

      detailPage.recipeMaster = _mockRecipeMasterActive;
      detailPage.displayVariantList = [ _mockRecipeVariantComplete ];

      detailPage.recipeService.removeRecipeVariantById = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      detailPage.idService.getId = jest
        .fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(_mockRecipeVariantComplete._id);

      const errorSpy: jest.SpyInstance = jest.spyOn(detailPage.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      const successHandler: (data: object) => void = detailPage.onConfirmDeleteModalSuccessDismiss(0);
      successHandler({ data: true });

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Notes', (): void => {

    test('should toggle notes', (): void => {
      detailPage.recipeMaster = mockRecipeMasterActive();
      detailPage.showNotes = false;

      detailPage.getTotalOffsetTop = jest
        .fn()
        .mockReturnValue(0);

      fixture.detectChanges();

      fixture.whenStable()
        .then(() => {
          detailPage.ionContent.scrollToPoint = jest
            .fn();

          const scrollSpy: jest.SpyInstance = jest.spyOn(detailPage.ionContent, 'scrollToPoint');

          detailPage.expandNote();

          expect(detailPage.showNotes).toBe(true);
          expect(scrollSpy).toHaveBeenCalledWith(
            0,
            0,
            1000
          );
        });
    });

  });


  describe('Recipe', (): void => {

    test('should toggle recipe expansion', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      detailPage.displayVariantList = _mockRecipeMasterActive.variants;
      detailPage.recipeIndex = 0;

      detailPage.getTotalOffsetTop = jest
        .fn()
        .mockReturnValue(0);

      fixture.detectChanges();

      fixture.whenStable()
        .then(() => {
          detailPage.ionContent.scrollToPoint = jest
            .fn();

          const scrollSpy: jest.SpyInstance = jest.spyOn(detailPage.ionContent, 'scrollToPoint');

          detailPage.expandRecipe(0);

          expect(detailPage.recipeIndex).toEqual(-1);

          detailPage.expandRecipe(0);

          expect(detailPage.recipeIndex).toEqual(0);
          expect(scrollSpy).toHaveBeenCalledWith(
            0,
            0,
            1000
          );
        });
    });

    test('should get offset top', (): void => {
      fixture.detectChanges();

      const mockFirstElem: Element = global.document.createElement('p');
      Object.defineProperty(mockFirstElem, 'offsetTop', { writable: false, value: 25 });

      const mockMidElem: Element = global.document.createElement('section');
      Object.defineProperty(mockMidElem, 'offsetTop', { writable: false, value: 50 });

      Object.defineProperty(mockFirstElem, 'offsetParent', { writable: false, value: mockMidElem});

      const mockTarget: Element = global.document.createElement('div');
      Object.defineProperty(mockTarget, 'offsetTop', { writable: false, value: 100 });

      Object.defineProperty(mockMidElem, 'offsetParent', { writable: false, value: mockTarget });

      const mockTop: Element = global.document.createElement('ion-content');

      Object.defineProperty(mockTarget, 'offsetParent', { writable: false, value: mockTop });

      const offset: number = detailPage.getTotalOffsetTop(mockFirstElem);
      expect(offset).toEqual(75);
    });

    test('should catch an error getting offset top', (): void => {
      fixture.detectChanges();

      const mockElement: Element = global.document.createElement('p');

      const offset: number = detailPage.getTotalOffsetTop(mockElement);
      expect(offset).toEqual(0);
    });

    test('should map variants to display array', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      detailPage.recipeMaster = _mockRecipeMasterActive;
      detailPage.displayVariantList = [];
      detailPage.utilService.clone = jest
        .fn()
        .mockImplementation((obj: any): any => obj);

      detailPage.recipeService.getCombinedHopsSchedule = jest
        .fn()
        .mockImplementation((hops: HopsSchedule) => hops);

      fixture.detectChanges();

      detailPage.mapVariantList();

      expect(detailPage.displayVariantList).toStrictEqual(_mockRecipeMasterActive.variants);
    });

    test('should toggle variant as favorite', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariant: RecipeVariant = _mockRecipeMasterActive.variants[1];
      _mockRecipeVariant.isFavorite = true;

      detailPage.recipeMaster = _mockRecipeMasterActive;

      detailPage.recipeService.updateRecipeVariantById = jest
        .fn()
        .mockReturnValue(of(_mockRecipeVariant));

      detailPage.idService.getId = jest
        .fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(_mockRecipeVariant._id);

      const updateSpy: jest.SpyInstance = jest.spyOn(detailPage.recipeService, 'updateRecipeVariantById');
      const toastSpy: jest.SpyInstance = jest.spyOn(detailPage.toastService, 'presentToast');

      fixture.detectChanges();

      detailPage.toggleFavorite(_mockRecipeVariant);

      setTimeout((): void => {
        expect(updateSpy).toHaveBeenCalledWith(
          _mockRecipeMasterActive._id,
          _mockRecipeVariant._id,
          { isFavorite: false }
        );
        expect(toastSpy).toHaveBeenCalledWith(
          'Added to favorites',
          1500,
          'bottom',
          'toast-fav'
        );
        done();
      }, 10);
    });

    test('should get an error toggling a variant as favorite', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariant: RecipeVariant = _mockRecipeMasterActive.variants[1];
      _mockRecipeVariant.isFavorite = true;
      const _mockError: Error = new Error('test-error');

      detailPage.recipeMaster = _mockRecipeMasterActive;

      detailPage.recipeService.updateRecipeVariantById = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      detailPage.idService.getId = jest
        .fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(_mockRecipeVariant._id);

      const updateSpy: jest.SpyInstance = jest.spyOn(detailPage.recipeService, 'updateRecipeVariantById');
      const errorSpy: jest.SpyInstance = jest.spyOn(detailPage.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      detailPage.toggleFavorite(_mockRecipeVariant);

      setTimeout((): void => {
        expect(updateSpy).toHaveBeenCalledWith(
          _mockRecipeMasterActive._id,
          _mockRecipeVariant._id,
          { isFavorite: false }
        );
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Rendering', (): void => {

    test('should render recipe details', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.notes = ['test note 1', 'test note 2'];
      _mockRecipeMasterActive.variants[1].isFavorite = true;

      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];

      detailPage.recipeMaster = _mockRecipeMasterActive;
      detailPage.displayVariantList = _mockRecipeMasterActive.variants;
      detailPage.showNotes = true;

      UnitConversionPipeStub._returnValue = jest
        .fn()
        .mockImplementation((value: string): string => {
          return value;
        });

      TruncatePipeStub._returnValue = jest
        .fn()
        .mockImplementation((value: string): string => {
          return value;
        });

      RoundPipeStub._returnValue = jest
        .fn()
        .mockImplementation((value: string): string => {
          return value;
        });

      fixture.detectChanges();

      const masterNameElem: HTMLElement = fixture.nativeElement.querySelector('#recipe-name');
      expect(masterNameElem.textContent).toMatch('Active');

      const styleNameElem: HTMLElement = fixture.nativeElement.querySelector('#style-name');
      expect(styleNameElem.textContent).toMatch('American IPA');

      const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');

      const updateButton: Element = <Element>rows.item(2);
      expect(updateButton.textContent).toMatch('Update Shared Values');

      const addButton: Element = <Element>rows.item(3);
      expect(addButton.textContent).toMatch('Add New Variant');

      const slidingItems: NodeList = fixture.nativeElement.querySelectorAll('.recipe-item-sliding');
      expect(slidingItems.length).toEqual(2);
      expect(slidingItems.item(0).childNodes[1].childNodes[0].childNodes[0].childNodes[1].textContent).toMatch('Delete');

      const variants: NodeList = fixture.nativeElement.querySelectorAll('.expand-button');

      const firstVariant: Element = <Element>variants.item(0);

      const firstHeader: Element = firstVariant.querySelector('.recipe-summary-header');

      expect(firstHeader.children[0].children[0].getAttribute('name')).toMatch('star');
      expect(firstHeader.children[0].children[1].textContent).toMatch('Complete');

      const firstSubHeader: Element = firstVariant.querySelector('p');

      expect(firstSubHeader.children[1].textContent).toMatch(_mockRecipeVariantComplete.batchVolume.toString());
      expect(firstSubHeader.children[3].textContent).toMatch(_mockRecipeVariantComplete.ABV.toString());
      expect(firstSubHeader.children[5].textContent).toMatch(_mockRecipeVariantComplete.IBU.toString());
      expect(firstSubHeader.children[7].textContent).toMatch(_mockRecipeVariantComplete.SRM.toString());

      expect(slidingItems.item(0).childNodes[3].childNodes[1].childNodes[0].childNodes[1].textContent).toMatch('Brew');
      expect(slidingItems.item(0).childNodes[3].childNodes[2].childNodes[0].childNodes[1].textContent).toMatch('Edit');

      const secondVariant: Element = <Element>variants.item(1);

      const secondHeader: Element = secondVariant.querySelector('.recipe-summary-header');

      expect(secondHeader.children[0].children[0].getAttribute('name')).toMatch('heart');

      expect(slidingItems.item(0).childNodes[3].childNodes[1].childNodes[0].childNodes[1].textContent).toMatch('Brew');
    });

  });


  describe('Animations', (): void => {

    test('should run sliding hints', (done: jest.DoneCallback): void => {
      const _stubIonContent: IonContentStub = new IonContentStub();
      const _mockElem: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_stubIonContent, 'el', { writable: false, value: _mockElem });

      detailPage.recipeMaster = mockRecipeMasterActive();

      detailPage.toggleSlidingItemClass = jest
        .fn();

      detailPage.animationService.getEstimatedItemOptionWidth = jest
        .fn()
        .mockReturnValue(100);

      detailPage.animationService.playCombinedSlidingHintAnimations = jest
        .fn()
        .mockReturnValue(of([]));

      detailPage.animationService.setHintShownFlag = jest
        .fn();

      const toggleSpy: jest.SpyInstance = jest.spyOn(detailPage, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(detailPage.animationService, 'setHintShownFlag');

      fixture.detectChanges();

      detailPage.ionContent = <any>_stubIonContent;
      detailPage.slidingItemsListRef = <any>_mockElem;

      detailPage.runSlidingHints();

      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).toHaveBeenCalledWith('sliding', 'recipeDetail');
        done();
      }, 10);
    });

    test('should get an error running sliding hints with missing content element', (): void => {
      const _stubIonContent: IonContentStub = new IonContentStub();
      const _mockErrorReport: ErrorReport = mockErrorReport();

      detailPage.errorReporter.setErrorReport = jest.fn();
      detailPage.errorReporter.getCustomReportFromError = jest
        .fn()
        .mockReturnValue(_mockErrorReport);

      const setSpy: jest.SpyInstance = jest.spyOn(detailPage.errorReporter, 'setErrorReport');
      const getSpy: jest.SpyInstance = jest.spyOn(detailPage.errorReporter, 'getCustomReportFromError');

      fixture.detectChanges();

      detailPage.ionContent = <any>_stubIonContent;

      detailPage.runSlidingHints();

      expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
      expect(getSpy.mock.calls[0][0]['name']).toMatch('AnimationError');
    });

    test('should get an error running sliding hints with animation error', (done: jest.DoneCallback): void => {
      const _stubIonContent: IonContentStub = new IonContentStub();
      const _mockElem: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_stubIonContent, 'el', { writable: false, value: _mockElem });
      const _mockError: Error = new Error('test-error');

      detailPage.recipeMaster = mockRecipeMasterActive();

      detailPage.toggleSlidingItemClass = jest
        .fn();

      detailPage.animationService.getEstimatedItemOptionWidth = jest
        .fn()
        .mockReturnValue(100);

      detailPage.animationService.playCombinedSlidingHintAnimations = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      detailPage.animationService.setHintShownFlag = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(detailPage.errorReporter, 'handleUnhandledError');
      const toggleSpy: jest.SpyInstance = jest.spyOn(detailPage, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(detailPage.animationService, 'setHintShownFlag');

      fixture.detectChanges();

      detailPage.ionContent = <any>_stubIonContent;
      detailPage.slidingItemsListRef = <any>_mockElem;

      detailPage.runSlidingHints();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should toggle sliding item class', (): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');
      detailPage.animationService.toggleSlidingItemClass = jest
        .fn();

      const toggleSpy: jest.SpyInstance = jest.spyOn(detailPage.animationService, 'toggleSlidingItemClass');

      fixture.detectChanges();

      detailPage.slidingItemsListRef = <any>_mockElem;

      detailPage.toggleSlidingItemClass(true);

      expect(toggleSpy).toHaveBeenCalledWith(
        detailPage.slidingItemsListRef.nativeElement,
        true,
        detailPage.renderer
      );

      detailPage.toggleSlidingItemClass(false);

      expect(toggleSpy).toHaveBeenCalledWith(
        detailPage.slidingItemsListRef.nativeElement,
        false,
        detailPage.renderer
      );
    });

  });

});
