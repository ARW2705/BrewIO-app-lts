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
import { mockRecipeMasterActive, mockRecipeVariantComplete, mockUser } from '../../../../test-config/mock-models';
import { AnimationsServiceStub, ErrorReportingServiceStub, IdServiceStub, RecipeServiceStub, ToastServiceStub, UserServiceStub, UtilityServiceStub } from '../../../../test-config/service-stubs';
import { AccordionComponentStub, ConfirmationPageStub, HeaderComponentStub, IngredientListComponentStub } from '../../../../test-config/component-stubs';
import { RoundPipeStub, TruncatePipeStub, UnitConversionPipeStub } from '../../../../test-config/pipe-stubs';
import { ActivatedRouteStub, ModalControllerStub, ModalStub, IonContentStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { RecipeMaster, RecipeVariant, User } from '../../shared/interfaces';

/* Service imports */
import { AnimationsService, ErrorReportingService, IdService, RecipeService, ToastService, UserService, UtilityService } from '../../services/services';

/* Page imports */
import { RecipePage } from './recipe.page';
import { ConfirmationPage } from '../confirmation/confirmation.page';


describe('RecipePage', (): void => {
  let fixture: ComponentFixture<RecipePage>;
  let recipePage: RecipePage;
  let originalOnInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    ActivatedRouteStub.getter = () => 'test-id';

    TestBed.configureTestingModule({
      declarations: [
        RecipePage,
        RoundPipeStub,
        TruncatePipeStub,
        UnitConversionPipeStub,
        AccordionComponentStub,
        HeaderComponentStub,
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
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: AnimationsService, useClass: AnimationsServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: RecipeService, useClass: RecipeServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UserService, useClass: UserServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(RecipePage);
    recipePage = fixture.componentInstance;
    originalOnInit = recipePage.ngOnInit;
    originalOnDestroy = recipePage.ngOnDestroy;
    recipePage.ngOnInit = jest
      .fn();
    recipePage.ngOnDestroy = jest
      .fn();
    recipePage.toastService.presentToast = jest
      .fn();
    recipePage.toastService.presentErrorToast = jest
      .fn();
    recipePage.errorReporter.handleUnhandledError = jest
      .fn();
    recipePage.masterList = [];
    recipePage.variantList = [];
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(recipePage).toBeTruthy();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (): void => {
      recipePage.ngOnInit = originalOnInit;

      recipePage.listenForUser = jest
        .fn();

      recipePage.listenForRecipes = jest
        .fn();

      const listenSpies: jest.SpyInstance[] = [
        jest.spyOn(recipePage, 'listenForUser'),
        jest.spyOn(recipePage, 'listenForRecipes')
      ];

      fixture.detectChanges();

      listenSpies.forEach((spy: jest.SpyInstance): void => {
        expect(spy).toHaveBeenCalled();
      });
    });

    test('should refresh pipes on view enter', (): void => {
      fixture.detectChanges();

      expect(recipePage.refreshPipes).toBe(false);

      recipePage.ionViewWillEnter();

      expect(recipePage.refreshPipes).toBe(true);
    });

    test('should trigger gesture hint animation after view has entered', (): void => {
      recipePage.animationService.shouldShowHint = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      recipePage.runSlidingHints = jest
        .fn();

      const runSpy: jest.SpyInstance = jest.spyOn(recipePage, 'runSlidingHints');

      fixture.detectChanges();

      recipePage.ionViewDidEnter();

      expect(runSpy).not.toHaveBeenCalled();

      recipePage.ionViewDidEnter();

      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    test('should close sliding items on view leave', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      recipePage.masterList = [ _mockRecipeMasterActive ];
      recipePage.variantList = [ _mockRecipeVariantComplete ];

      fixture.detectChanges();

      fixture.whenStable()
        .then((): void => {
          recipePage.slidingItemsList.closeSlidingItems = jest
            .fn()
            .mockReturnValue(Promise.resolve());

          const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

          recipePage.ionViewDidLeave();

          setTimeout((): void => {
            expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('sliding items closed');
            done();
          }, 10);
        });
    });

    test('should handle error closing sliding items on view leave', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      recipePage.masterList = [ _mockRecipeMasterActive ];
      recipePage.variantList = [ _mockRecipeVariantComplete ];

      fixture.detectChanges();

      fixture.whenStable()
        .then((): void => {
          recipePage.slidingItemsList.closeSlidingItems = jest
            .fn()
            .mockReturnValue(Promise.reject());

          const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

          recipePage.ionViewDidLeave();

          setTimeout((): void => {
            expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('error closing sliding items');
            done();
          }, 10);
        });
    });

    test('should catch error closing sliding items on view leave', (done: jest.DoneCallback): void => {
      fixture.detectChanges();

      fixture.whenStable()
        .then((): void => {
          const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

          recipePage.ionViewDidLeave();

          setTimeout((): void => {
            expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Unable to close sliding items');
            done();
          }, 10);
        });
    });

    test('should handle destroying the component', (): void => {
      const nextSpy: jest.SpyInstance = jest.spyOn(recipePage.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(recipePage.destroy$, 'complete');

      recipePage.ngOnDestroy = originalOnDestroy;

      fixture.detectChanges();

      recipePage.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

  });


  describe('Listeners', (): void => {

    test('should listen for recipes', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockMasterList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([_mockRecipeMasterActive$]);

      recipePage.recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(_mockMasterList$);

      recipePage.mapMasterRecipes = jest
        .fn();

      fixture.detectChanges();

      recipePage.listenForRecipes();

      setTimeout((): void => {
        expect(recipePage.masterList).toStrictEqual([_mockRecipeMasterActive]);
        done();
      }, 10);
    });

    test('should get error listening for recipe changes', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      recipePage.recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      recipePage.mapMasterRecipes = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(recipePage.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      recipePage.listenForRecipes();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should listen for user changes', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);

      recipePage.userService.getUser = jest
        .fn()
        .mockReturnValue(_mockUser$);

      recipePage.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(true);

      fixture.detectChanges();

      expect(recipePage.isLoggedIn).toBe(false);

      recipePage.listenForUser();

      setTimeout((): void => {
        expect(recipePage.isLoggedIn).toBe(true);
        done();
      }, 10);
    });

    test('should handle error listening for user changes', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      recipePage.isLoggedIn = true;

      recipePage.userService.getUser = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      const errorSpy: jest.SpyInstance = jest.spyOn(recipePage.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      expect(recipePage.isLoggedIn).toBe(true);

      recipePage.listenForUser();

      setTimeout((): void => {
        expect(recipePage.isLoggedIn).toBe(false);
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Navigation', (): void => {

    test('should nav to brew process', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipePage.recipeService.isRecipeProcessPresent = jest
        .fn()
        .mockReturnValue(true);

      recipePage.router.navigate = jest
        .fn();

      recipePage.idService.hasId = jest
        .fn()
        .mockReturnValue(true);

      recipePage.idService.getId = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive._id);

      const navSpy: jest.SpyInstance = jest.spyOn(recipePage.router, 'navigate');

      fixture.detectChanges();

      recipePage.navToBrewProcess(_mockRecipeMasterActive);

      expect(navSpy).toHaveBeenCalledWith(
        ['tabs/process'],
        {
          state: {
            recipeMasterId: _mockRecipeMasterActive._id,
            recipeVariantId: _mockRecipeMasterActive.master,
            requestedUserId: _mockRecipeMasterActive.owner,
            rootURL: 'tabs/recipe'
          }
        }
      );
    });

    test('should get an error navigating to a missing brew process', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipePage.recipeService.isRecipeProcessPresent = jest
        .fn()
        .mockReturnValue(false);

      recipePage.errorReporter.setErrorReport = jest
        .fn();

      recipePage.errorReporter.createErrorReport = jest
        .fn();

      recipePage.idService.hasId = jest
        .fn()
        .mockReturnValue(true);

      const errorSpy: jest.SpyInstance = jest.spyOn(recipePage.errorReporter, 'createErrorReport');

      fixture.detectChanges();

      recipePage.navToBrewProcess(_mockRecipeMasterActive);

      expect(errorSpy).toHaveBeenCalledWith(
        'MissingError',
        'Recipe is missing a process guide',
        3,
        'Recipe is missing a process guide'
      );
    });

    test('should nav to recipe details', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipePage.masterList = [ _mockRecipeMasterActive ];
      recipePage.variantList = _mockRecipeMasterActive.variants;

      recipePage.router.navigate = jest
        .fn();

      recipePage.idService.getId = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive._id);

      const navSpy: jest.SpyInstance = jest.spyOn(recipePage.router, 'navigate');

      fixture.detectChanges();

      recipePage.navToDetails(0);

      expect(navSpy).toHaveBeenCalledWith([`tabs/recipe/${_mockRecipeMasterActive._id}`]);
    });

    test('should handle an error naving to recipe details', (): void => {
      const _mockError: Error = new Error('test-error');
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipePage.masterList = [ _mockRecipeMasterActive ];
      recipePage.variantList = _mockRecipeMasterActive.variants;

      recipePage.router.navigate = jest
        .fn()
        .mockImplementation(() => { throw Error('test-error'); });

      recipePage.errorReporter.setErrorReport = jest
        .fn();

      recipePage.errorReporter.createErrorReport = jest
        .fn()
        .mockReturnValue(_mockError);

      const errorSpy: jest.SpyInstance = jest.spyOn(recipePage.errorReporter, 'createErrorReport');

      fixture.detectChanges();

      recipePage.navToDetails(0);

      expect(errorSpy).toHaveBeenCalledWith(
        'MissingError',
        `Recipe details not found: list index 0, present list [${_mockRecipeMasterActive._id},]`,
        3,
        'Recipe details not found'
      );
    });

    test('should nav to recipe form', (): void => {
      recipePage.router.navigate = jest
        .fn();

      const navSpy: jest.SpyInstance = jest.spyOn(recipePage.router, 'navigate');

      fixture.detectChanges();

      recipePage.navToRecipeForm();

      expect(navSpy).toHaveBeenCalledWith(
        ['tabs/recipe-form'],
        {
          state: {
            formType: 'master',
            docMethod: 'create'
          }
        }
      );
    });

  });


  describe('Modals', (): void => {

    test('should handle confirmation modal success', (): void => {
      recipePage.deleteMaster = jest
        .fn();

      const delSpy: jest.SpyInstance = jest.spyOn(recipePage, 'deleteMaster');

      fixture.detectChanges();

      const successHandler: (data: object) => void = recipePage.onConfirmDeleteSuccess(0);
      successHandler({ data: true });

      expect(delSpy).toHaveBeenCalledWith(0);

      const noConfirmHandler: (data: object) => void = recipePage.onConfirmDeleteSuccess(0);
      noConfirmHandler({});

      expect(delSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle confirmation modal error', (): void => {
      // const toastSpy: jest.SpyInstance = jest.spyOn(recipePage.toastService, 'presentErrorToast');

      const _mockError: Error = new Error('test-error');

      recipePage.errorReporter.handleModalError = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(recipePage.errorReporter, 'handleModalError');

      fixture.detectChanges();

      const errorHandler: (error: string) => void = recipePage.onConfirmDeleteError();
      errorHandler(_mockError.message);

      expect(errorSpy).toHaveBeenCalledWith(
        _mockError.message,
        'An internal error occurred trying to delete the recipe'
      );

      // expect(toastSpy).toHaveBeenCalledWith('Unable to delete recipe master');
    });

    test('should open confirmation modal on success', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _stubModal: ModalStub = new ModalStub();

      recipePage.masterList = [ _mockRecipeMasterActive ];
      recipePage.variantList = _mockRecipeMasterActive.variants;

      recipePage.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: true }));

      recipePage.onConfirmDeleteSuccess = jest
        .fn()
        .mockReturnValue((): void => {});

      const successSpy: jest.SpyInstance = jest.spyOn(recipePage, 'onConfirmDeleteSuccess');
      const createSpy: jest.SpyInstance = jest.spyOn(recipePage.modalCtrl, 'create');

      fixture.detectChanges();

      recipePage.confirmDelete(0);

      expect(createSpy).toHaveBeenCalledWith({
        component: ConfirmationPage,
        componentProps: {
          message: `Confirm deletion of "${_mockRecipeMasterActive.name}" and its variants`,
          subMessage: 'This action cannot be reversed'
        }
      });

      setTimeout((): void => {
        expect(successSpy).toHaveBeenCalledWith(0);
        done();
      }, 10);
    });

    test('should open confirmation modal on error', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _stubModal: ModalStub = new ModalStub();

      recipePage.masterList = [ _mockRecipeMasterActive ];
      recipePage.variantList = _mockRecipeMasterActive.variants;

      recipePage.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.reject());

      recipePage.onConfirmDeleteError = jest
        .fn()
        .mockReturnValue((): void => {});

      const errorSpy: jest.SpyInstance = jest.spyOn(recipePage, 'onConfirmDeleteError');
      const createSpy: jest.SpyInstance = jest.spyOn(recipePage.modalCtrl, 'create');

      fixture.detectChanges();

      recipePage.confirmDelete(0);

      expect(createSpy).toHaveBeenCalledWith({
        component: ConfirmationPage,
        componentProps: {
          message: `Confirm deletion of "${_mockRecipeMasterActive.name}" and its variants`,
          subMessage: 'This action cannot be reversed'
        }
      });

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

  });


  describe('Other', (): void => {

    test('should delete a recipe master', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipePage.masterList = [ _mockRecipeMasterActive ];
      recipePage.variantList = _mockRecipeMasterActive.variants;

      const toastSpy: jest.SpyInstance = jest.spyOn(recipePage.toastService, 'presentToast');

      recipePage.recipeService.removeRecipeMasterById = jest
        .fn()
        .mockReturnValue(of(true));

      recipePage.idService.getId = jest
        .fn()
        .mockReturnValue('');

      fixture.detectChanges();

      recipePage.deleteMaster(0);

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'Deleted Recipe',
          1000,
          'middle',
          'toast-bright'
        );
        done();
      }, 10);
    });

    test('should get an error deleting a recipe master', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockError: Error = new Error('test-error');

      recipePage.masterList = [ _mockRecipeMasterActive ];
      recipePage.variantList = _mockRecipeMasterActive.variants;

      recipePage.recipeService.removeRecipeMasterById = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      recipePage.idService.getId = jest
        .fn()
        .mockReturnValue('');

      const errorSpy: jest.SpyInstance = jest.spyOn(recipePage.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      recipePage.deleteMaster(0);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should handle expanding or collapsing a recipe master', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockElement: Element = global.document.createElement('div');
      Object.defineProperty(_mockElement, 'offsetTop', { writable: false, value: 10 });

      recipePage.masterList = [ _mockRecipeMasterActive ];
      recipePage.variantList = _mockRecipeMasterActive.variants;

      global.document.querySelector = jest
        .fn()
        .mockReturnValue(_mockElement);

      fixture.detectChanges();

      recipePage.ionContent.scrollToPoint = jest
        .fn();

      const scrollSpy: jest.SpyInstance = jest.spyOn(recipePage.ionContent, 'scrollToPoint');

      expect(recipePage.masterIndex).toEqual(-1);

      recipePage.expandMaster(0);

      expect(scrollSpy).toHaveBeenCalledWith(0, 10, 1000);
      expect(recipePage.masterIndex).toEqual(0);

      recipePage.expandMaster(0);

      expect(recipePage.masterIndex).toEqual(-1);
    });

    test('should map recipe subjects with combined hops', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipePage.masterList = [ _mockRecipeMasterActive, _mockRecipeMasterActive ];

      recipePage.recipeService.getCombinedHopsSchedule = jest
        .fn()
        .mockImplementation((value: any) => value);

      recipePage.utilService.clone = jest
        .fn()
        .mockImplementation((recipe: any): any => _mockRecipeMasterActive.variants[0]);

      recipePage.idService.hasId = jest
        .fn()
        .mockReturnValue(true);

      recipePage.mapMasterRecipes();

      fixture.detectChanges();

      expect(recipePage.variantList.length).toEqual(2);
    });

    test('should get an error mapping recipe subjects with combined hops', (): void => {
      recipePage.masterList.map = jest
        .fn()
        .mockImplementation(() => { throw new Error('tets-error'); });

      const toastSpy: jest.SpyInstance = jest.spyOn(recipePage.toastService, 'presentErrorToast');

      recipePage.mapMasterRecipes();

      fixture.detectChanges();

      expect(toastSpy).toHaveBeenCalledWith('Error generating recipe list');
    });

  });


  describe('Template Render', (): void => {

    test('should render the template with no recipes', (): void => {
      recipePage.listenForRecipes = jest
        .fn();

      recipePage.listenForUser = jest
        .fn();

      recipePage.ngOnInit = originalOnInit;
      recipePage.masterList = [];
      recipePage.variantList = [];
      recipePage.isLoggedIn = true;

      fixture.detectChanges();

      const noneRow: HTMLElement = fixture.nativeElement.querySelector('.no-recipes');
      expect(noneRow.textContent).toMatch('No Recipes Yet');
    });

    test('should render the template with a list of recipes', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = _mockRecipeMasterActive.variants[0];

      RoundPipeStub._returnValue = (value: string): number => {
        return parseFloat(value);
      };

      TruncatePipeStub._returnValue = (value: string): string => {
        return value;
      };

      UnitConversionPipeStub._returnValue = (value: string): string => {
        return value;
      };

      recipePage.listenForRecipes = jest
        .fn();

      recipePage.listenForUser = jest
        .fn();

      recipePage.ngOnInit = originalOnInit;
      recipePage.masterList = [ _mockRecipeMasterActive ];
      recipePage.variantList = _mockRecipeMasterActive.variants;
      recipePage.isLoggedIn = true;
      recipePage.masterIndex = 0;

      fixture.detectChanges();

      const summaryHeader: HTMLElement = fixture.nativeElement.querySelector('.master-summary-header');
      const masterNameElem: Element = summaryHeader.children[0].children[0];
      expect(masterNameElem.textContent).toMatch('Active');
      const styleNameElem: Element = summaryHeader.children[1].children[0];
      expect(styleNameElem.textContent).toMatch(_mockRecipeMasterActive.style.name);

      const summarySubHeader: HTMLElement = fixture.nativeElement.querySelector('.master-summary-subheader');
      const subheaderSpans: NodeList = summarySubHeader.querySelectorAll('span');
      expect(subheaderSpans.item(1).textContent).toMatch(_mockRecipeVariantComplete.batchVolume.toString());
      expect(subheaderSpans.item(3).textContent).toMatch(_mockRecipeVariantComplete.ABV.toString());
      expect(subheaderSpans.item(5).textContent).toMatch(_mockRecipeVariantComplete.IBU.toString());
      expect(subheaderSpans.item(7).textContent).toMatch(_mockRecipeVariantComplete.SRM.toString());
    });

  });


  describe('Animations', (): void => {

    test('should run sliding hints', (done: jest.DoneCallback): void => {
      const _stubIonContent: IonContentStub = new IonContentStub();
      const _mockElem: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_stubIonContent, 'el', { writable: false, value: _mockElem });

      recipePage.toggleSlidingItemClass = jest
        .fn();

      recipePage.animationService.getEstimatedItemOptionWidth = jest
        .fn()
        .mockReturnValue(100);

      recipePage.animationService.playCombinedSlidingHintAnimations = jest
        .fn()
        .mockReturnValue(of([]));

      recipePage.animationService.setHintShownFlag = jest
        .fn();

      const toggleSpy: jest.SpyInstance = jest.spyOn(recipePage, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(recipePage.animationService, 'setHintShownFlag');

      fixture.detectChanges();

      recipePage.ionContent = <any>_stubIonContent;

      recipePage.runSlidingHints();

      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).toHaveBeenCalledWith('sliding', 'recipe');
        done();
      }, 10);
    });

    test('should get an error running sliding hints with missing content element', (): void => {
      const _stubIonContent: IonContentStub = new IonContentStub();

      fixture.detectChanges();

      recipePage.ionContent = <any>_stubIonContent;

      expect((): void => {
        recipePage.runSlidingHints();
      }).toThrowError('Animation error: cannot find content container');
    });

    test('should get an error running sliding hints with animation error', (done: jest.DoneCallback): void => {
      const _stubIonContent: IonContentStub = new IonContentStub();
      const _mockElem: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_stubIonContent, 'el', { writable: false, value: _mockElem });
      const _mockError: Error = new Error('test-error');

      recipePage.toggleSlidingItemClass = jest
        .fn();

      recipePage.animationService.getEstimatedItemOptionWidth = jest
        .fn()
        .mockReturnValue(100);

      recipePage.animationService.playCombinedSlidingHintAnimations = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      recipePage.animationService.setHintShownFlag = jest
        .fn();

      // const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const toggleSpy: jest.SpyInstance = jest.spyOn(recipePage, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(recipePage.animationService, 'setHintShownFlag');
      const errorSpy: jest.SpyInstance = jest.spyOn(recipePage.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      recipePage.ionContent = <any>_stubIonContent;

      recipePage.runSlidingHints();

      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        // const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        // expect(consoleCalls[0]).toMatch('Animation error');
        // expect(consoleCalls[1]).toMatch('test-error');
        done();
      }, 10);
    });

    test('should toggle sliding item class', (): void => {
      recipePage.animationService.toggleSlidingItemClass = jest
        .fn();

      const toggleSpy: jest.SpyInstance = jest.spyOn(recipePage.animationService, 'toggleSlidingItemClass');

      fixture.detectChanges();

      recipePage.toggleSlidingItemClass(true);

      expect(toggleSpy).toHaveBeenCalledWith(
        recipePage.slidingItemsListRef.nativeElement,
        true,
        recipePage.renderer
      );

      recipePage.toggleSlidingItemClass(false);

      expect(toggleSpy).toHaveBeenCalledWith(
        recipePage.slidingItemsListRef.nativeElement,
        false,
        recipePage.renderer
      );
    });

  });

});
