/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockRecipeMasterActive, mockRecipeVariantComplete } from '@test/mock-models';
import { AnimationsServiceStub, ErrorReportingServiceStub, IdServiceStub, ModalServiceStub, RecipeServiceStub, ToastServiceStub, UtilityServiceStub } from '@test/service-stubs';
import { RoundPipeStub, TruncatePipeStub, UnitConversionPipeStub } from '@test/pipe-stubs';
import { ActivatedRouteStub, IonContentStub } from '@test/ionic-stubs';

/* Interface imports */
import { HopsSchedule, RecipeMaster, RecipeVariant } from '@shared/interfaces';

/* Service imports */
import { AnimationsService, ErrorReportingService, IdService, ModalService, RecipeService, ToastService, UtilityService } from '@services/public';

/* Component imports */
import { ConfirmationComponent } from '@components/shared/confirmation/confirmation.component';

/* Page imports */
import { RecipeDetailPage } from './recipe-detail.page';


describe('RecipeDetailPage', (): void => {
  let fixture: ComponentFixture<RecipeDetailPage>;
  let page: RecipeDetailPage;
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
        UnitConversionPipeStub
      ],
      imports: [
        IonicModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AnimationsService, useClass: AnimationsServiceStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ModalService, useClass: ModalServiceStub },
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
    page = fixture.componentInstance;
    originalOnInit = page.ngOnInit;
    originalOnDestroy = page.ngOnDestroy;
    page.ngOnInit = jest.fn();
    page.ngOnDestroy = jest.fn();
    page.toastService.presentToast = jest.fn();
    page.toastService.presentErrorToast = jest.fn();
    page.toastService.mediumDuration = 1500;
    page.errorReporter.handleUnhandledError = jest.fn();
    page.errorReporter.setErrorReport = jest.fn();
    page.errorReporter.createErrorReport = jest.fn();
    page.animationService.reportSlidingHintError = jest.fn();
    Object.assign(page.errorReporter, { moderateSeverity: 3 });
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(page).toBeTruthy();
    expect(page.recipeMasterId).toMatch('test-id');
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      page.ngOnInit = originalOnInit;
      page.recipeService.getRecipeMasterById = jest.fn()
        .mockReturnValue(_mockRecipeMasterActive$);
      page.mapVariantList = jest.fn();
      const mapSpy: jest.SpyInstance = jest.spyOn(page, 'mapVariantList');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(page.recipeMaster).toStrictEqual(_mockRecipeMasterActive);
        expect(mapSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle error on init', (): void => {
      const _mockError: Error = new Error('test-error');
      page.ngOnInit = originalOnInit;
      page.recipeService.getRecipeMasterById = jest.fn()
        .mockReturnValue(throwError(_mockError));
      page.navToRoot.bind = jest.fn()
        .mockImplementation((page: RecipeDetailPage): () => void => page.navToRoot);
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      expect(errorSpy).toHaveBeenCalledWith(_mockError);
    });

    test('should trigger gesture hint animation after view has entered', (): void => {
      page.animationService.shouldShowHint = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      page.runSlidingHints = jest.fn();
      const runSpy: jest.SpyInstance = jest.spyOn(page, 'runSlidingHints');

      fixture.detectChanges();

      page.ionViewDidEnter();
      expect(runSpy).not.toHaveBeenCalled();
      page.ionViewDidEnter();
      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle component destroy', (): void => {
      const nextSpy: jest.SpyInstance = jest.spyOn(page.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(page.destroy$, 'complete');
      page.ngOnDestroy = originalOnDestroy;

      fixture.detectChanges();

      page.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

    test('should handle leaving view', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeMaster = _mockRecipeMasterActive;
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      fixture.whenStable()
        .then((): void => {
          page.slidingItemsList.closeSlidingItems = jest.fn()
            .mockReturnValue(Promise.resolve());
          page.ionViewDidLeave();
          setTimeout((): void => {
            expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('sliding items closed');
            done();
          }, 10);
        });
    });

    test('should get error handling leaving view', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeMaster = _mockRecipeMasterActive;
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      fixture.whenStable()
        .then((): void => {
          page.slidingItemsList.closeSlidingItems = jest.fn()
            .mockReturnValue(Promise.reject('test-error'));
          page.ionViewDidLeave();
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
      page.recipeMasterId = _mockRecipeMasterActive._id;
      page.recipeMaster = _mockRecipeMasterActive;
      page.recipeService.isRecipeProcessPresent = jest.fn()
        .mockReturnValue(true);
      page.router.navigate = jest.fn();
      page.idService.getId = jest.fn()
        .mockReturnValueOnce(_mockRecipeVariantComplete._id)
        .mockReturnValueOnce(_mockRecipeMasterActive._id);
      const navSpy: jest.SpyInstance = jest.spyOn(page.router, 'navigate');

      fixture.detectChanges();

      page.navToBrewProcess(_mockRecipeVariantComplete);
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
      page.recipeService.isRecipeProcessPresent = jest.fn()
        .mockReturnValue(false);
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'createErrorReport');

      fixture.detectChanges();

      page.navToBrewProcess(null);
      expect(errorSpy).toHaveBeenCalledWith(
        'MissingError',
        'Recipe is missing a process guide',
        page.errorReporter.moderateSeverity,
        'Recipe is missing a process guide'
      );
    });

    test('should nav to recipe form to update master', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeMaster = _mockRecipeMasterActive;
      page.router.navigate = jest.fn();
      const navSpy: jest.SpyInstance = jest.spyOn(page.router, 'navigate');

      fixture.detectChanges();

      page.navToRecipeForm('master');
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
      page.recipeMaster = _mockRecipeMasterActive;
      page.router.navigate = jest.fn();
      page.idService.getId = jest.fn()
        .mockReturnValue('');
      page.idService.hasId = jest.fn()
        .mockReturnValue(true);
      const navSpy: jest.SpyInstance = jest.spyOn(page.router, 'navigate');

      fixture.detectChanges();

      page.navToRecipeForm('variant', _mockRecipeVariantComplete);
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
      page.recipeMaster = _mockRecipeMasterActive;
      page.router.navigate = jest.fn();
      const navSpy: jest.SpyInstance = jest.spyOn(page.router, 'navigate');

      fixture.detectChanges();

      page.navToRecipeForm('variant');
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
      page.router.navigate = jest.fn();
      const navSpy: jest.SpyInstance = jest.spyOn(page.router, 'navigate');

      fixture.detectChanges();

      page.navToRoot();
      expect(navSpy).toHaveBeenCalledWith(['tabs/recipe']);
    });

  });


  describe('Modals', (): void => {

    test('should open the confirmation modal and handle success', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.displayVariantList = _mockRecipeMasterActive.variants;
      page.modalService.openModal = jest.fn()
        .mockReturnValue(of(true));
      const modalSpy: jest.SpyInstance = jest.spyOn(page.modalService, 'openModal');
      page.deleteVariant = jest.fn();
      const deleteSpy: jest.SpyInstance = jest.spyOn(page, 'deleteVariant');

      fixture.detectChanges();

      page.confirmDelete(1);
      setTimeout((): void => {
        expect(modalSpy).toHaveBeenCalledWith(
          ConfirmationComponent,
          {
            message: `Confirm deletion of "${_mockRecipeMasterActive.variants[1].variantName}"`,
            subMessage: 'This action cannot be reversed'
          }
        );
        expect(deleteSpy).toHaveBeenCalledWith(1);
        done();
      }, 10);
    });

    test('should handle error from confirmation modal', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.displayVariantList = _mockRecipeMasterActive.variants;
      const _mockError: Error = new Error('test-error');
      page.modalService.openModal = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.confirmDelete(0);
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Notes', (): void => {

    test('should toggle notes', (): void => {
      page.recipeMaster = mockRecipeMasterActive();
      page.showNotes = false;
      page.getTotalOffsetTop = jest.fn()
        .mockReturnValue(0);

      fixture.detectChanges();

      fixture.whenStable()
        .then(() => {
          page.ionContent.scrollToPoint = jest.fn();
          const scrollSpy: jest.SpyInstance = jest.spyOn(page.ionContent, 'scrollToPoint');
          page.expandNote();
          expect(page.showNotes).toBe(true);
          expect(scrollSpy).toHaveBeenCalledWith(0, 0, 1000);
        });
    });

    test('should handle note update event', (done: jest.DoneCallback): void => {
      page.recipeMasterId = 'test-id'
      page.recipeService.updateRecipeMasterById = jest.fn()
        .mockReturnValue(of(null));
      const updateSpy: jest.SpyInstance = jest.spyOn(page.recipeService, 'updateRecipeMasterById');
      const _mockNotes: string[] = [ 'note1', 'note2', 'note3' ];

      fixture.detectChanges();

      page.noteUpdateEventHandler(_mockNotes);
      expect(updateSpy).toHaveBeenCalledWith('test-id', { notes: _mockNotes });
      done();
    });

    test('should handle error on note update event', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      page.recipeService.updateRecipeMasterById = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.noteUpdateEventHandler([]);
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Recipe', (): void => {

    test('should delete a recipe variant at given index', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeMaster = _mockRecipeMasterActive;
      page.displayVariantList = _mockRecipeMasterActive.variants;
      page.idService.getId = jest.fn()
        .mockReturnValue('test-id');
      const idSpy: jest.SpyInstance = jest.spyOn(page.idService, 'getId');
      page.recipeService.removeRecipeVariantById = jest.fn()
        .mockReturnValue(of(null));
      const toastSpy: jest.SpyInstance = jest.spyOn(page.toastService, 'presentToast');

      fixture.detectChanges();

      page.deleteVariant(1);
      setTimeout((): void => {
        expect(idSpy).toHaveBeenNthCalledWith(1, _mockRecipeMasterActive);
        expect(idSpy).toHaveBeenNthCalledWith(2, _mockRecipeMasterActive.variants[1]);
        expect(toastSpy).toHaveBeenCalledWith(
          'Variant deleted!',
          page.toastService.mediumDuration,
          'middle',
          'toast-bright'
        );
        done();
      }, 10);
    });

    test('should handle error deleting variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeMaster = _mockRecipeMasterActive;
      page.displayVariantList = _mockRecipeMasterActive.variants;
      const _mockError: Error = new Error('test-error');
      page.recipeService.removeRecipeVariantById = jest.fn()
        .mockReturnValue(throwError(_mockError));
      page.idService.getId = jest.fn()
        .mockReturnValue('test-id');
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.deleteVariant(1);
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should toggle recipe expansion', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.displayVariantList = _mockRecipeMasterActive.variants;
      page.recipeIndex = 0;
      page.getTotalOffsetTop = jest.fn()
        .mockReturnValue(0);

      fixture.detectChanges();

      fixture.whenStable()
        .then(() => {
          page.ionContent.scrollToPoint = jest.fn();
          const scrollSpy: jest.SpyInstance = jest.spyOn(page.ionContent, 'scrollToPoint');
          page.expandRecipe(0);
          expect(page.recipeIndex).toEqual(-1);
          page.expandRecipe(0);
          expect(page.recipeIndex).toEqual(0);
          expect(scrollSpy).toHaveBeenCalledWith(0, 0, 1000);
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
      const offset: number = page.getTotalOffsetTop(mockFirstElem);
      expect(offset).toEqual(75);
    });

    test('should catch an error getting offset top', (): void => {
      fixture.detectChanges();

      const mockElement: Element = global.document.createElement('p');
      const offset: number = page.getTotalOffsetTop(mockElement);
      expect(offset).toEqual(0);
    });

    test('should map variants to display array', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeMaster = _mockRecipeMasterActive;
      page.displayVariantList = [];
      page.utilService.clone = jest.fn()
        .mockImplementation((obj: any): any => obj);
      page.recipeService.getCombinedHopsSchedule = jest.fn()
        .mockImplementation((hops: HopsSchedule) => hops);

      fixture.detectChanges();

      page.mapVariantList();
      expect(page.displayVariantList).toStrictEqual(_mockRecipeMasterActive.variants);
    });

    test('should toggle variant as favorite', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariant: RecipeVariant = _mockRecipeMasterActive.variants[1];
      _mockRecipeVariant.isFavorite = true;
      page.recipeMaster = _mockRecipeMasterActive;
      page.recipeService.updateRecipeVariantById = jest.fn()
        .mockReturnValue(of(_mockRecipeVariant));
      page.idService.getId = jest.fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(_mockRecipeVariant._id);
      const updateSpy: jest.SpyInstance = jest.spyOn(page.recipeService, 'updateRecipeVariantById');
      const toastSpy: jest.SpyInstance = jest.spyOn(page.toastService, 'presentToast');

      fixture.detectChanges();

      page.toggleFavorite(_mockRecipeVariant);
      setTimeout((): void => {
        expect(updateSpy).toHaveBeenCalledWith(
          _mockRecipeMasterActive._id,
          _mockRecipeVariant._id,
          { isFavorite: false }
        );
        expect(toastSpy).toHaveBeenCalledWith(
          'Added to favorites',
          page.toastService.mediumDuration,
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
      page.recipeMaster = _mockRecipeMasterActive;
      page.recipeService.updateRecipeVariantById = jest.fn()
        .mockReturnValue(throwError(_mockError));
      page.idService.getId = jest.fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(_mockRecipeVariant._id);
      const updateSpy: jest.SpyInstance = jest.spyOn(page.recipeService, 'updateRecipeVariantById');
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.toggleFavorite(_mockRecipeVariant);
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


  describe('Animations', (): void => {

    test('should run sliding hints', (done: jest.DoneCallback): void => {
      const _stubIonContent: IonContentStub = new IonContentStub();
      const _mockElem: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_stubIonContent, 'el', { writable: false, value: _mockElem });
      page.recipeMaster = mockRecipeMasterActive();
      page.toggleSlidingItemClass = jest.fn();
      page.animationService.getEstimatedItemOptionWidth = jest.fn()
        .mockReturnValue(100);
      page.animationService.playCombinedSlidingHintAnimations = jest.fn()
        .mockReturnValue(of([]));
      page.animationService.setHintShownFlag = jest.fn();
      const toggleSpy: jest.SpyInstance = jest.spyOn(page, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(page.animationService, 'setHintShownFlag');

      fixture.detectChanges();

      page.ionContent = <any>_stubIonContent;
      page.slidingItemsListRef = <any>_mockElem;
      page.runSlidingHints();
      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).toHaveBeenCalledWith('sliding', 'recipeDetail');
        done();
      }, 10);
    });

    test('should get an error running sliding hints with missing content element', (): void => {
      const _stubIonContent: IonContentStub = new IonContentStub();
      _stubIonContent.el = null;
      const reportSpy: jest.SpyInstance = jest.spyOn(page.animationService, 'reportSlidingHintError');

      fixture.detectChanges();

      page.ionContent = <any>_stubIonContent;
      page.runSlidingHints();
      expect(reportSpy).toHaveBeenCalled();
    });

    test('should get an error running sliding hints with animation error', (done: jest.DoneCallback): void => {
      const _stubIonContent: IonContentStub = new IonContentStub();
      const _mockElem: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_stubIonContent, 'el', { writable: false, value: _mockElem });
      const _mockError: Error = new Error('test-error');
      page.recipeMaster = mockRecipeMasterActive();
      page.toggleSlidingItemClass = jest.fn();
      page.animationService.getEstimatedItemOptionWidth = jest.fn()
        .mockReturnValue(100);
      page.animationService.playCombinedSlidingHintAnimations = jest.fn()
        .mockReturnValue(throwError(_mockError));
      page.animationService.setHintShownFlag = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');
      const toggleSpy: jest.SpyInstance = jest.spyOn(page, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(page.animationService, 'setHintShownFlag');

      fixture.detectChanges();

      page.ionContent = <any>_stubIonContent;
      page.slidingItemsListRef = <any>_mockElem;
      page.runSlidingHints();
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should toggle sliding item class', (): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');
      page.animationService.toggleSlidingItemClass = jest.fn();
      const toggleSpy: jest.SpyInstance = jest.spyOn(page.animationService, 'toggleSlidingItemClass');

      fixture.detectChanges();

      page.slidingItemsListRef = <any>_mockElem;
      page.toggleSlidingItemClass(true);
      expect(toggleSpy).toHaveBeenCalledWith(
        page.slidingItemsListRef.nativeElement,
        true,
        page.renderer
      );
      page.toggleSlidingItemClass(false);
      expect(toggleSpy).toHaveBeenCalledWith(
        page.slidingItemsListRef.nativeElement,
        false,
        page.renderer
      );
    });

  });


  describe('Template Rendering', (): void => {

    test('should render recipe details', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.notes = ['test note 1', 'test note 2'];
      _mockRecipeMasterActive.variants[1].isFavorite = true;
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];
      page.recipeMaster = _mockRecipeMasterActive;
      page.displayVariantList = _mockRecipeMasterActive.variants;
      page.showNotes = true;
      UnitConversionPipeStub._returnValue = jest.fn()
        .mockImplementation((value: string): string => {
          return value;
        });
      TruncatePipeStub._returnValue = jest.fn()
        .mockImplementation((value: string): string => {
          return value;
        });
      RoundPipeStub._returnValue = jest.fn()
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
      expect(updateButton.textContent).toMatch('UPDATE SHARED VALUES');
      const addButton: Element = <Element>rows.item(3);
      expect(addButton.textContent).toMatch('ADD NEW VARIANT');
      const slidingItems: NodeList = fixture.nativeElement.querySelectorAll('.recipe-item-sliding');
      expect(slidingItems.length).toEqual(2);
      expect(slidingItems.item(0).childNodes[1].childNodes[0].childNodes[0].childNodes[1].textContent).toMatch('Delete');
      const variants: NodeList = fixture.nativeElement.querySelectorAll('.expand-button');
      const firstVariant: Element = <Element>variants.item(0);
      const firstHeader: Element = firstVariant.querySelector('.recipe-summary-header');
      expect(firstHeader.children[0].getAttribute('name')).toMatch('star');
      expect(firstHeader.children[1].textContent).toMatch('Complete');
      const firstSubHeader: Element = firstVariant.querySelector('p');
      expect(firstSubHeader.children[1].textContent).toMatch(_mockRecipeVariantComplete.batchVolume.toString());
      expect(firstSubHeader.children[3].textContent).toMatch(_mockRecipeVariantComplete.ABV.toString());
      expect(firstSubHeader.children[5].textContent).toMatch(_mockRecipeVariantComplete.IBU.toString());
      expect(firstSubHeader.children[7].textContent).toMatch(_mockRecipeVariantComplete.SRM.toString());
      expect(slidingItems.item(0).childNodes[3].childNodes[1].childNodes[0].childNodes[1].textContent).toMatch('Brew');
      expect(slidingItems.item(0).childNodes[3].childNodes[2].childNodes[0].childNodes[1].textContent).toMatch('Edit');
      const secondVariant: Element = <Element>variants.item(1);
      const secondHeader: Element = secondVariant.querySelector('.recipe-summary-header');
      expect(secondHeader.children[0].getAttribute('name')).toMatch('heart');
      expect(slidingItems.item(0).childNodes[3].childNodes[1].childNodes[0].childNodes[1].textContent).toMatch('Brew');
    });

  });

});
