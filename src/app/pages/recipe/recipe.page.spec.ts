/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockRecipeMasterActive, mockRecipeVariantComplete, mockUser } from '../../../../test-config/mock-models';
import { AnimationsServiceStub, ErrorReportingServiceStub, IdServiceStub, ModalServiceStub, RecipeServiceStub, ToastServiceStub, UserServiceStub, UtilityServiceStub } from '../../../../test-config/service-stubs';
import { RoundPipeStub, TruncatePipeStub, UnitConversionPipeStub } from '../../../../test-config/pipe-stubs';
import { ActivatedRouteStub, IonContentStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { RecipeMaster, RecipeVariant, User } from '../../shared/interfaces';

/* Service imports */
import { AnimationsService, ErrorReportingService, IdService, ModalService, RecipeService, ToastService, UserService, UtilityService } from '../../services/services';

/* Component imports */
import { ConfirmationComponent } from '../../components/shared/public';

/* Page imports */
import { RecipePage } from './recipe.page';


describe('RecipePage', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<RecipePage>;
  let page: RecipePage;
  let originalOnInit: any;
  let originalOnDestroy: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    ActivatedRouteStub.getter = () => 'test-id';

    TestBed.configureTestingModule({
      declarations: [
        RecipePage,
        RoundPipeStub,
        TruncatePipeStub,
        UnitConversionPipeStub
      ],
      imports: [
        IonicModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: AnimationsService, useClass: AnimationsServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ModalService, useClass: ModalServiceStub },
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
    page = fixture.componentInstance;
    originalOnInit = page.ngOnInit;
    originalOnDestroy = page.ngOnDestroy;
    page.ngOnInit = jest.fn();
    page.ngOnDestroy = jest.fn();
    page.toastService.presentToast = jest.fn();
    page.toastService.presentErrorToast = jest.fn();
    page.toastService.shortDuration = 1000;
    page.errorReporter.handleUnhandledError = jest.fn();
    Object.assign(page.errorReporter, { moderateSeverity: 3 });
    page.animationService.reportSlidingHintError = jest.fn();
    page.recipeList = [];
    page.variantList = [];
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(page).toBeTruthy();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (): void => {
      page.ngOnInit = originalOnInit;
      page.listenForUser = jest.fn();
      page.listenForRecipes = jest.fn();
      const listenSpies: jest.SpyInstance[] = [
        jest.spyOn(page, 'listenForUser'),
        jest.spyOn(page, 'listenForRecipes')
      ];

      fixture.detectChanges();

      listenSpies.forEach((spy: jest.SpyInstance): void => {
        expect(spy).toHaveBeenCalled();
      });
    });

    test('should refresh pipes on view enter', (): void => {
      fixture.detectChanges();

      const _mockSlider: any = {
        mock:{
          element: {
            nativeElement: {
              firstChild: {
                clientHeight: 10
              }
            }
          }
        },
        toArray: function() { return [this.mock]; },
        length: 1
      };
      page.recipeSliderComponents = <any>_mockSlider;
      page.sliderHeight = 0;
      const _mockButton: any = {
        nativeElement: {
          clientHeight: 20
        }
      };
      page.createButtonContainer = <any>_mockButton;
      page.createButtonHeight = 0;
      expect(page.refreshPipes).toBe(false);
      page.ionViewWillEnter();
      expect(page.refreshPipes).toBe(true);
      expect(page.sliderHeight).toEqual(10);
      expect(page.createButtonHeight).toEqual(20);
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

    test('should close sliding items on view leave', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      page.recipeList = [ _mockRecipeMasterActive ];
      page.variantList = [ _mockRecipeVariantComplete ];

      fixture.detectChanges();

      fixture.whenStable()
        .then((): void => {
          page.slidingItemsList.closeSlidingItems = jest.fn()
            .mockReturnValue(Promise.resolve());
          const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
          page.ionViewDidLeave();
          setTimeout((): void => {
            expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('sliding items closed');
            done();
          }, 10);
        });
    });

    test('should handle error closing sliding items on view leave', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      page.recipeList = [ _mockRecipeMasterActive ];
      page.variantList = [ _mockRecipeVariantComplete ];

      fixture.detectChanges();

      fixture.whenStable()
        .then((): void => {
          page.slidingItemsList = null;
          const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
          page.ionViewDidLeave();
          setTimeout((): void => {
            expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Unable to close sliding items');
            done();
          }, 10);
        });
    });

    test('should catch error closing sliding items on view leave', (done: jest.DoneCallback): void => {
      fixture.detectChanges();

      fixture.whenStable()
        .then((): void => {
          const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
          page.ionViewDidLeave();
          setTimeout((): void => {
            expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Unable to close sliding items');
            done();
          }, 10);
        });
    });

    test('should handle destroying the component', (): void => {
      const nextSpy: jest.SpyInstance = jest.spyOn(page.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(page.destroy$, 'complete');
      page.ngOnDestroy = originalOnDestroy;

      fixture.detectChanges();

      page.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

  });


  describe('Listeners', (): void => {

    test('should listen for recipes', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockMasterList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([_mockRecipeMasterActive$]);
      page.recipeService.getMasterList = jest.fn()
        .mockReturnValue(_mockMasterList$);
      page.mapMasterRecipes = jest.fn();

      fixture.detectChanges();

      page.listenForRecipes();
      setTimeout((): void => {
        expect(page.recipeList).toStrictEqual([_mockRecipeMasterActive]);
        done();
      }, 10);
    });

    test('should get error listening for recipe changes', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      page.recipeService.getMasterList = jest.fn()
        .mockReturnValue(throwError(_mockError));
      page.mapMasterRecipes = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.listenForRecipes();
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should listen for user changes', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
      page.userService.getUser = jest.fn()
        .mockReturnValue(_mockUser$);
      page.userService.isLoggedIn = jest.fn()
        .mockReturnValue(true);

      fixture.detectChanges();

      expect(page.isLoggedIn).toBe(false);
      page.listenForUser();
      setTimeout((): void => {
        expect(page.isLoggedIn).toBe(true);
        done();
      }, 10);
    });

    test('should handle error listening for user changes', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      page.isLoggedIn = true;
      page.userService.getUser = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      expect(page.isLoggedIn).toBe(true);
      page.listenForUser();
      setTimeout((): void => {
        expect(page.isLoggedIn).toBe(false);
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Navigation', (): void => {

    test('should nav to brew process', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeService.isRecipeProcessPresent = jest.fn()
        .mockReturnValue(true);
      page.router.navigate = jest.fn();
      page.idService.hasId = jest.fn()
        .mockReturnValue(true);
      page.idService.getId = jest.fn()
        .mockReturnValue(_mockRecipeMasterActive._id);
      const navSpy: jest.SpyInstance = jest.spyOn(page.router, 'navigate');

      fixture.detectChanges();

      page.navToBrewProcess(_mockRecipeMasterActive);
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
      page.recipeService.isRecipeProcessPresent = jest.fn()
        .mockReturnValue(false);
      page.errorReporter.setErrorReport = jest.fn();
      page.errorReporter.createErrorReport = jest.fn();
      page.idService.hasId = jest.fn()
        .mockReturnValue(true);
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'createErrorReport');

      fixture.detectChanges();

      page.navToBrewProcess(_mockRecipeMasterActive);
      expect(errorSpy).toHaveBeenCalledWith(
        'MissingError',
        'Recipe is missing a process guide',
        3,
        'Recipe is missing a process guide'
      );
    });

    test('should nav to recipe details', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeList = [ _mockRecipeMasterActive ];
      page.variantList = _mockRecipeMasterActive.variants;
      page.router.navigate = jest.fn();
      page.idService.getId = jest.fn()
        .mockReturnValue(_mockRecipeMasterActive._id);
      const navSpy: jest.SpyInstance = jest.spyOn(page.router, 'navigate');

      fixture.detectChanges();

      page.navToDetails(0);
      expect(navSpy).toHaveBeenCalledWith([`tabs/recipe/${_mockRecipeMasterActive._id}`]);
    });

    test('should handle an error naving to recipe details', (): void => {
      const _mockError: Error = new Error('test-error');
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeList = [ _mockRecipeMasterActive ];
      page.variantList = _mockRecipeMasterActive.variants;
      page.router.navigate = jest.fn()
        .mockImplementation(() => { throw Error('test-error'); });
      page.errorReporter.setErrorReport = jest.fn();
      page.errorReporter.createErrorReport = jest.fn()
        .mockReturnValue(_mockError);
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'createErrorReport');

      fixture.detectChanges();

      page.navToDetails(0);
      expect(errorSpy).toHaveBeenCalledWith(
        'MissingError',
        `Recipe details not found: list index 0, present list [${_mockRecipeMasterActive._id},]`,
        3,
        'Recipe details not found'
      );
    });

    test('should nav to recipe form', (): void => {
      page.router.navigate = jest.fn();
      const navSpy: jest.SpyInstance = jest.spyOn(page.router, 'navigate');

      fixture.detectChanges();

      page.navToRecipeForm();
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

    test('should open the confirmation modal and handle success', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeList = [ _mockRecipeMasterActive, _mockRecipeMasterActive ];
      page.modalService.openModal = jest.fn()
        .mockReturnValue(of(true));
      const modalSpy: jest.SpyInstance = jest.spyOn(page.modalService, 'openModal');
      page.deleteRecipe = jest.fn();
      const deleteSpy: jest.SpyInstance = jest.spyOn(page, 'deleteRecipe');

      fixture.detectChanges();

      page.confirmDelete(1);
      setTimeout((): void => {
        expect(modalSpy).toHaveBeenCalledWith(
          ConfirmationComponent,
          {
            message: `Confirm deletion of "${_mockRecipeMasterActive.name}" and its variants`,
            subMessage: 'This action cannot be reversed'
          }
        );
        expect(deleteSpy).toHaveBeenCalledWith(1);
        done();
      }, 10);
    });

    test('should handle error from confirmation modal', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeList = [_mockRecipeMasterActive];
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


  describe('Other', (): void => {

    test('should delete a recipe master', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeList = [ _mockRecipeMasterActive ];
      page.variantList = _mockRecipeMasterActive.variants;
      const toastSpy: jest.SpyInstance = jest.spyOn(page.toastService, 'presentToast');
      page.recipeService.removeRecipeMasterById = jest.fn()
        .mockReturnValue(of(true));
      page.idService.getId = jest.fn()
        .mockReturnValue('');

      fixture.detectChanges();

      page.deleteRecipe(0);
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
      page.recipeList = [ _mockRecipeMasterActive ];
      page.variantList = _mockRecipeMasterActive.variants;
      page.recipeService.removeRecipeMasterById = jest.fn()
        .mockReturnValue(throwError(_mockError));
      page.idService.getId = jest.fn()
        .mockReturnValue('');
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.deleteRecipe(0);
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should handle expanding or collapsing a ingredient list', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockElement: Element = global.document.createElement('div');
      Object.defineProperty(_mockElement, 'offsetTop', { writable: false, value: 10 });
      page.recipeList = [ _mockRecipeMasterActive ];
      page.variantList = _mockRecipeMasterActive.variants;
      global.document.querySelector = jest.fn()
        .mockReturnValue(_mockElement);
      page.createButtonHeight = 10;
      page.scrollOffsetHeight = 20;

      fixture.detectChanges();

      page.ionContent.scrollToPoint = jest.fn();
      const scrollSpy: jest.SpyInstance = jest.spyOn(page.ionContent, 'scrollToPoint');
      expect(page.recipeIndex).toEqual(-1);
      page.expandIngredientList(0);
      expect(scrollSpy).toHaveBeenCalledWith(0, 30, 1000);
      expect(page.recipeIndex).toEqual(0);
      page.expandIngredientList(0);
      expect(page.recipeIndex).toEqual(-1);
    });

    test('should map recipe subjects with combined hops', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      page.recipeList = [ _mockRecipeMasterActive, _mockRecipeMasterActive ];
      page.recipeService.getCombinedHopsSchedule = jest.fn()
        .mockImplementation((value: any) => value);
      page.utilService.clone = jest.fn()
        .mockImplementation((recipe: any): any => _mockRecipeMasterActive.variants[0]);
      page.idService.hasId = jest.fn()
        .mockReturnValue(true);
      page.mapMasterRecipes();

      fixture.detectChanges();

      expect(page.variantList.length).toEqual(2);
    });

    test('should get an error mapping recipe subjects with combined hops', (): void => {
      page.recipeList.map = jest.fn()
        .mockImplementation(() => { throw new Error('tets-error'); });
      const toastSpy: jest.SpyInstance = jest.spyOn(page.toastService, 'presentErrorToast');
      page.mapMasterRecipes();

      fixture.detectChanges();

      expect(toastSpy).toHaveBeenCalledWith('Error generating recipe list');
    });

  });


  describe('Animations', (): void => {

    test('should run sliding hints', (done: jest.DoneCallback): void => {
      const _stubIonContent: IonContentStub = new IonContentStub();
      const _mockElem: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_stubIonContent, 'el', { writable: false, value: _mockElem });
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
      page.runSlidingHints();
      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).toHaveBeenCalledWith('sliding', 'recipe');
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
      page.toggleSlidingItemClass = jest.fn();
      page.animationService.getEstimatedItemOptionWidth = jest.fn()
        .mockReturnValue(100);
      page.animationService.playCombinedSlidingHintAnimations = jest.fn()
        .mockReturnValue(throwError(_mockError));
      page.animationService.setHintShownFlag = jest.fn();
      const toggleSpy: jest.SpyInstance = jest.spyOn(page, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(page.animationService, 'setHintShownFlag');
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.ionContent = <any>_stubIonContent;
      page.runSlidingHints();
      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should toggle sliding item class', (): void => {
      page.animationService.toggleSlidingItemClass = jest.fn();
      const toggleSpy: jest.SpyInstance = jest.spyOn(page.animationService, 'toggleSlidingItemClass');

      fixture.detectChanges();

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


  describe('Template Render', (): void => {

    test('should render the template with loading spinner', (): void => {
      page.listenForRecipes = jest.fn();
      page.listenForUser = jest.fn();
      page.ngOnInit = originalOnInit;
      page.recipeList = null;
      page.isLoggedIn = true;

      fixture.detectChanges();

      const spinner: HTMLElement = fixture.nativeElement.querySelector('app-loading-spinner');
      expect(spinner.getAttribute('loadingMessage')).toMatch('loading recipes');
    });

    test('should render the template with no recipes', (): void => {
      page.listenForRecipes = jest.fn();
      page.listenForUser = jest.fn();
      page.ngOnInit = originalOnInit;
      page.recipeList = [];
      page.variantList = [];
      page.isLoggedIn = true;

      fixture.detectChanges();

      const noneRow: HTMLElement = fixture.nativeElement.querySelector('.no-recipes');
      expect(noneRow.textContent).toMatch('No Recipes Yet');
    });

    test('should render the template with a list of recipes', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      RoundPipeStub._returnValue = (value: string): number => parseFloat(value);
      TruncatePipeStub._returnValue = (value: string): string => value;
      UnitConversionPipeStub._returnValue = (value: string): string => value;
      page.listenForRecipes = jest.fn();
      page.listenForUser = jest.fn();
      page.ngOnInit = originalOnInit;
      page.recipeList = [ _mockRecipeMasterActive ];
      page.variantList = [_mockRecipeMasterActive.variants[0]];
      page.isLoggedIn = true;
      page.recipeIndex = 0;

      fixture.detectChanges();

      const createButton: HTMLElement = fixture.nativeElement.querySelector('ion-button');
      expect(createButton.textContent).toMatch('CREATE NEW RECIPE');
      const sliders: NodeList = fixture.nativeElement.querySelectorAll('app-recipe-slider');
      expect(sliders.length).toEqual(1);
      const slider: HTMLElement = <HTMLElement>sliders.item(0);
      expect(slider['recipe']).toStrictEqual(_mockRecipeMasterActive);
      expect(slider['variant']).toStrictEqual(_mockRecipeMasterActive.variants[0]);
      const accordions: NodeList = fixture.nativeElement.querySelectorAll('app-accordion');
      expect(accordions.length).toEqual(1);
    });

  });

});
