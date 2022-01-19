/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockAuthor, mockGrainBill, mockHopsSchedule, mockOtherIngredients, mockProcessSchedule, mockRecipeMasterActive, mockRecipeMasterInactive, mockRecipeVariantComplete, mockRecipeVariantIncomplete, mockUser, mockYeastBatch } from '@test/mock-models';
import { ErrorReportingServiceStub, EventServiceStub, IdServiceStub, RecipeHttpServiceStub, RecipeImageServiceStub, RecipeStateServiceStub, RecipeTypeGuardServiceStub, UserServiceStub } from '@test/service-stubs';

/* Interface imports */
import { Author, GrainBill, HopsSchedule, Image, OtherIngredients, Process, RecipeMaster, RecipeVariant, User, YeastBatch, } from '@shared/interfaces';

/* Default imports */
import { defaultImage } from '@shared/defaults';

/* Service imports */
import { ErrorReportingService, EventService, IdService, UserService } from '@services/public';
import { RecipeHttpService } from '@services/recipe/http/recipe-http.service';
import { RecipeImageService } from '@services/recipe/image/recipe-image.service';
import { RecipeStateService } from '@services/recipe/state/recipe-state.service';
import { RecipeTypeGuardService } from '@services/recipe/type-guard/recipe-type-guard.service';
import { RecipeService } from './recipe.service';


describe('RecipeService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: RecipeService;
  let originalRegister: () => void;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        RecipeService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: EventService, useClass: EventServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: RecipeHttpService, useClass: RecipeHttpServiceStub },
        { provide: RecipeImageService, useClass: RecipeImageServiceStub },
        { provide: RecipeStateService, useClass: RecipeStateServiceStub },
        { provide: RecipeTypeGuardService, useClass: RecipeTypeGuardServiceStub },
        { provide: UserService, useClass: UserServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(RecipeService);
    originalRegister = service.registerEvents;
    service.registerEvents = jest.fn();
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  describe('Public API', (): void => {

    test('should fetch public author by id', (done: jest.DoneCallback): void => {
      const _mockAuthor: Author = mockAuthor();
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.recipeStateService.getRecipeById = jest.fn().mockReturnValue(_mockRecipeMasterActive);
      service.userService.getUser = jest.fn().mockReturnValue(_mockUser$);
      service.idService.hasId = jest.fn().mockReturnValue(false);
      service.idService.hasDefaultIdType = jest.fn().mockReturnValue(true);
      service.recipeHttpService.fetchPublicAuthorByRecipeId = jest.fn().mockReturnValue(of(_mockAuthor));

      service.getPublicAuthorByRecipeId('0123456789012')
        .subscribe(
          (author: Author): void => {
            expect(author).toStrictEqual(_mockAuthor);
            done();
          },
          (error: any): void => {
            console.log('Error in: should fetch public author by id', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get default author when fetching public author by id returns no result', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.recipeStateService.getRecipeById = jest.fn().mockReturnValue(_mockRecipeMasterActive);
      service.userService.getUser = jest.fn().mockReturnValue(_mockUser$);
      service.idService.hasId = jest.fn().mockReturnValue(false);
      service.idService.hasDefaultIdType = jest.fn().mockReturnValue(true);
      service.recipeHttpService.fetchPublicAuthorByRecipeId = jest.fn().mockReturnValue(of(null));
      const _defaultImage: Image = defaultImage();

      service.getPublicAuthorByRecipeId('0123456789012')
        .subscribe(
          (author: Author): void => {
            expect(author).toStrictEqual({
              username: 'Not Found',
              userImage: _defaultImage,
              breweryLabelImage: _defaultImage
            });
            done();
          },
          (error: any): void => {
            console.log('Error in: should fetch public author by id', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get default author when missing valid server id', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive._id = undefined;
      service.recipeStateService.getRecipeById = jest.fn().mockReturnValue(_mockRecipeMasterActive);
      service.userService.getUser = jest.fn().mockReturnValue(_mockUser$);
      service.idService.hasId = jest.fn().mockReturnValue(false);
      service.idService.hasDefaultIdType = jest.fn().mockReturnValue(true);
      const _defaultImage: Image = defaultImage();

      service.getPublicAuthorByRecipeId('0123456789012')
        .subscribe(
          (author: Author): void => {
            expect(author).toStrictEqual({
              username: 'Not Found',
              userImage: _defaultImage,
              breweryLabelImage: _defaultImage
            });
            done();
          },
          (error: any): void => {
            console.log('Error in: should fetch public author by id', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get user as author is the user owns the recipe', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive._id = undefined;
      service.recipeStateService.getRecipeById = jest.fn().mockReturnValue(_mockRecipeMasterActive);
      service.userService.getUser = jest.fn().mockReturnValue(_mockUser$);
      service.idService.hasId = jest.fn().mockReturnValue(true);

      service.getPublicAuthorByRecipeId('0123456789012')
        .subscribe(
          (author: Author): void => {
            expect(author).toStrictEqual({
              username: _mockUser.username,
              userImage: _mockUser.userImage,
              breweryLabelImage: _mockUser.breweryLabelImage
            });
            done();
          },
          (error: any): void => {
            console.log('Error in: should get user as author is the user owns the recipe', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get default author when recipe not found', (done: jest.DoneCallback): void => {
      service.recipeStateService.getRecipeById = jest.fn().mockReturnValue(undefined);
      const _defaultImage: Image = defaultImage();

      service.getPublicAuthorByRecipeId('0123456789012')
        .subscribe(
          (author: Author): void => {
            expect(author).toStrictEqual({
              username: 'Not Found',
              userImage: _defaultImage,
              breweryLabelImage: _defaultImage
            });
            done();
          },
          (error: any): void => {
            console.log('Error in: should get default author when recipe not found', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should fetch public recipe', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.recipeHttpService.fetchPublicRecipeById = jest.fn()
        .mockReturnValue(of(_mockRecipeMasterActive));
      const fetchSpy: jest.SpyInstance = jest.spyOn(service.recipeHttpService, 'fetchPublicRecipeById');

      service.getPublicRecipe('test-id')
        .subscribe(
          (recipe: RecipeMaster): void => {
            expect(recipe).toStrictEqual(_mockRecipeMasterActive);
            expect(fetchSpy).toHaveBeenCalledWith('test-id');
            done();
          },
          (error: Error): void => {
            console.log('Error in: should fetch public recipe', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should fetch public recipe list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      service.recipeHttpService.fetchPublicRecipeListByUser = jest.fn()
        .mockReturnValue(of([ _mockRecipeMasterActive, _mockRecipeMasterInactive ]));
      const fetchSpy: jest.SpyInstance = jest.spyOn(service.recipeHttpService, 'fetchPublicRecipeListByUser');

      service.getPublicRecipeListByUser('test-id')
        .subscribe(
          (recipes: RecipeMaster[]): void => {
            expect(recipes.length).toEqual(2);
            expect(recipes[0]).toStrictEqual(_mockRecipeMasterActive);
            expect(recipes[1]).toStrictEqual(_mockRecipeMasterInactive);
            expect(fetchSpy).toHaveBeenCalledWith('test-id');
            done();
          },
          (error: Error): void => {
            console.log('Error in: should fetch public recipe list', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should fetch public recipe variant', (done: jest.DoneCallback): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      service.recipeHttpService.fetchPublicVariantById = jest.fn()
        .mockReturnValue(of(_mockRecipeVariantComplete));
      const fetchSpy: jest.SpyInstance = jest.spyOn(service.recipeHttpService, 'fetchPublicVariantById');

      service.getPublicRecipeVariantById('recipe-id', 'variant-id')
        .subscribe(
          (variant: RecipeVariant): void => {
            expect(variant).toStrictEqual(_mockRecipeVariantComplete);
            expect(fetchSpy).toHaveBeenCalledWith('recipe-id', 'variant-id');
            done();
          },
          (error: Error): void => {
            console.log('Error in: should fetch public recipe variant', error);
            expect(true).toBe(false);
          }
        );
    });

  });


  describe('Private API', (): void => {

    test('should add a variant to recipe in list', (done: jest.DoneCallback): void => {
      service.recipeStateService.addVariantToRecipeInList = jest.fn().mockReturnValue(of(null));
      const addSpy: jest.SpyInstance = jest.spyOn(service.recipeStateService, 'addVariantToRecipeInList');
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      service.addVariantToRecipeInList('recipe-id', _mockRecipeVariantComplete)
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(addSpy).toHaveBeenCalledWith('recipe-id', _mockRecipeVariantComplete);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should add a variant to recipe in list', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should create new recipe', (done: jest.DoneCallback): void => {
      service.recipeStateService.createNewRecipe = jest.fn().mockReturnValue(of(null));
      const addSpy: jest.SpyInstance = jest.spyOn(service.recipeStateService, 'createNewRecipe');
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      service.createNewRecipe( _mockRecipeMasterActive)
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(addSpy).toHaveBeenCalledWith(_mockRecipeMasterActive);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should create new recipe', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should remove recipe from list', (done: jest.DoneCallback): void => {
      service.recipeStateService.removeRecipeFromList = jest.fn().mockReturnValue(of(null));
      const addSpy: jest.SpyInstance = jest.spyOn(service.recipeStateService, 'removeRecipeFromList');

      service.removeRecipeFromList('test-id')
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(addSpy).toHaveBeenCalledWith('test-id');
            done();
          },
          (error: Error): void => {
            console.log('Error in: should remove recipe from list', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should remove variant from recipe', (done: jest.DoneCallback): void => {
      service.recipeStateService.removeVariantFromRecipeInList = jest.fn().mockReturnValue(of(null));
      const addSpy: jest.SpyInstance = jest.spyOn(service.recipeStateService, 'removeVariantFromRecipeInList');

      service.removeVariantFromRecipeInList('recipe-id', 'variant-id')
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(addSpy).toHaveBeenCalledWith('recipe-id', 'variant-id');
            done();
          },
          (error: Error): void => {
            console.log('Error in: should remove variant from recipe', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should update recipe in list', (done: jest.DoneCallback): void => {
      service.recipeStateService.updateRecipeInList = jest.fn().mockReturnValue(of(null));
      const addSpy: jest.SpyInstance = jest.spyOn(service.recipeStateService, 'updateRecipeInList');

      service.updateRecipeInList('recipe-id', { update: true })
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(addSpy).toHaveBeenCalledWith('recipe-id', { update: true });
            done();
          },
          (error: Error): void => {
            console.log('Error in: should update recipe in list', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should update variant in recipe', (done: jest.DoneCallback): void => {
      service.recipeStateService.updateVariantOfRecipeInList = jest.fn().mockReturnValue(of(null));
      const addSpy: jest.SpyInstance = jest.spyOn(service.recipeStateService, 'updateVariantOfRecipeInList');

      service.updateVariantOfRecipeInList('recipe-id', 'variant-id', { update: true })
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(addSpy).toHaveBeenCalledWith('recipe-id', 'variant-id', { update: true });
            done();
          },
          (error: Error): void => {
            console.log('Error in: should update variant in recipe', error);
            expect(true).toBe(false);
          }
        );
    });

  });


  describe('Public Helper Methods', (): void => {

    test('should get combined hops schedule', (): void => {
      const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
      expect(_mockHopsSchedule.length).toEqual(4);
      expect(_mockHopsSchedule[0].quantity).toEqual(1);

      const combined: HopsSchedule[] = service.getCombinedHopsSchedule(_mockHopsSchedule);

      expect(combined.length).toEqual(3);
      expect(_mockHopsSchedule[0].quantity).toEqual(2);
    });

    test('should get undefined if combining a hops schedule that is undefined', (): void => {
      expect(service.getCombinedHopsSchedule(undefined)).toBeUndefined();
    });

    test('should get recipe list', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const _mockRecipeList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive),
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive)
      ]);
      service.recipeStateService.getRecipeList = jest.fn().mockReturnValue(_mockRecipeList$);
      const getSpy: jest.SpyInstance = jest.spyOn(service.recipeStateService, 'getRecipeList');

      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = service.getRecipeList();
      expect(list$).toStrictEqual(list$);
      expect(getSpy).toHaveBeenCalled();
    });

    test('should get recipe subject', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      service.recipeStateService.getRecipeSubjectById = jest.fn()
        .mockReturnValue(_mockRecipeMasterActive$);
      const getSpy: jest.SpyInstance = jest.spyOn(service.recipeStateService, 'getRecipeSubjectById');

      const recipe: BehaviorSubject<RecipeMaster> = service.getRecipeSubjectById('test-id');
      expect(recipe).toStrictEqual(_mockRecipeMasterActive$);
      expect(getSpy).toHaveBeenCalledWith('test-id');
    });

    test('should check if a recipe has a process', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();

      expect(service.isRecipeProcessPresent(_mockRecipeVariantComplete)).toBe(true);
      expect(service.isRecipeProcessPresent(_mockRecipeVariantIncomplete)).toBe(false);
    });

    test('should check if array of grain bills are type safe', (): void => {
      const _mockGrainBill: GrainBill[] = mockGrainBill();
      let failFlag: boolean = false;
      service.recipeTypeGuardService.isSafeGrainBillCollection = jest.fn()
        .mockImplementation((): boolean => !failFlag);

      expect(service.isSafeGrainBillCollection(_mockGrainBill)).toBe(true);
      failFlag = true;
      expect(service.isSafeGrainBillCollection(_mockGrainBill)).toBe(false);
    });

    test('should check if array of hops schedules are type safe', (): void => {
      const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
      let failFlag: boolean = false;
      service.recipeTypeGuardService.isSafeHopsScheduleCollection = jest.fn()
        .mockImplementation((): boolean => !failFlag);

      expect(service.isSafeHopsScheduleCollection(_mockHopsSchedule)).toBe(true);
      failFlag = true;
      expect(service.isSafeHopsScheduleCollection(_mockHopsSchedule)).toBe(false);
    });

    test('should check if array of other ingredients are type safe', (): void => {
      const _mockOtherIngredients: OtherIngredients[] = mockOtherIngredients();
      let failFlag: boolean = false;
      service.recipeTypeGuardService.isSafeOtherIngredientsCollection = jest.fn()
        .mockImplementation((): boolean => !failFlag);

      expect(service.isSafeOtherIngredientsCollection(_mockOtherIngredients)).toBe(true);
      failFlag = true;
      expect(service.isSafeOtherIngredientsCollection(_mockOtherIngredients)).toBe(false);
    });

    test('should check if process schedule items are type safe', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      let failFlag: boolean = false;
      service.recipeTypeGuardService.isSafeProcessSchedule = jest.fn()
        .mockImplementation((): boolean => !failFlag);

      expect(service.isSafeProcessSchedule(_mockProcessSchedule)).toBe(true);
      failFlag = true;
      expect(service.isSafeProcessSchedule(_mockProcessSchedule)).toBe(false);
    });

    test('should check if array of yeast batches are type safe', (): void => {
      const _mockYeastBatch: YeastBatch[] = mockYeastBatch();
      let failFlag: boolean = false;
      service.recipeTypeGuardService.isSafeYeastBatchCollection = jest.fn()
        .mockImplementation((): boolean => !failFlag);

      expect(service.isSafeYeastBatchCollection(_mockYeastBatch)).toBe(true);
      failFlag = true;
      expect(service.isSafeYeastBatchCollection(_mockYeastBatch)).toBe(false);
    });

    test('should register events', (done: jest.DoneCallback): void => {
      service.registerEvents = originalRegister;
      const mockSubjects: Subject<object>[] = Array.from(Array(4), (): Subject<object> => {
        return new Subject<object>();
      });
      let counter = 0;
      service.event.register = jest.fn().mockImplementation((): any => mockSubjects[counter++]);
      service.recipeStateService.initRecipeList = jest.fn().mockReturnValue(of(null));
      service.recipeStateService.clearRecipes = jest.fn();
      service.recipeStateService.syncOnSignup = jest.fn();
      service.recipeStateService.syncOnConnection = jest.fn().mockReturnValue(of(null));
      const spies: jest.SpyInstance[] = [
        jest.spyOn(service.recipeStateService, 'initRecipeList'),
        jest.spyOn(service.recipeStateService, 'clearRecipes'),
        jest.spyOn(service.recipeStateService, 'syncOnSignup'),
        jest.spyOn(service.recipeStateService, 'syncOnConnection')
      ];
      const eventSpy: jest.SpyInstance = jest.spyOn(service.event, 'register');
      service.event.emit = jest.fn();
      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');

      service.registerEvents();

      setTimeout((): void => {
        const calls: any[] = eventSpy.mock.calls;
        expect(calls[0][0]).toMatch('init-recipes');
        expect(calls[1][0]).toMatch('clear-data');
        expect(calls[2][0]).toMatch('sync-recipes-on-signup');
        expect(calls[3][0]).toMatch('connected');
        mockSubjects.forEach((mockSubject: Subject<object>, index: number): void => {
          mockSubject.next({});
          expect(spies[index]).toHaveBeenCalled();
          mockSubject.complete();
        });
        expect(emitSpy).toHaveBeenCalledWith('init-batches');
        done();
      }, 10);
    });

    test('should catch error on init recipes event error', (done: jest.DoneCallback): void => {
      service.registerEvents = originalRegister;
      const mockSubjects: Subject<object>[] = Array.from(Array(4), (): Subject<object> => {
        return new Subject<object>();
      });
      let counter = 0;
      service.event.register = jest.fn().mockImplementation((): any => mockSubjects[counter++]);
      const _mockError: Error = new Error('test-error');
      service.errorReporter.handleUnhandledError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');
      service.recipeStateService.initRecipeList = jest.fn().mockReturnValue(throwError(_mockError));
      service.event.emit = jest.fn();
      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');

      service.registerEvents();

      setTimeout((): void => {
        mockSubjects[0].next({});
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        expect(emitSpy).toHaveBeenCalledWith('init-batches');
        done();
      }, 10);
    });

    test('should catch error on sync on connection event error', (done: jest.DoneCallback): void => {
      service.registerEvents = originalRegister;
      const mockSubjects: Subject<object>[] = Array.from(Array(4), (): Subject<object> => {
        return new Subject<object>();
      });
      let counter = 0;
      service.event.register = jest.fn().mockImplementation((): any => mockSubjects[counter++]);
      const _mockError: Error = new Error('test-error');
      service.errorReporter.handleUnhandledError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');
      service.recipeStateService.syncOnConnection = jest.fn().mockReturnValue(throwError(_mockError));

      service.registerEvents();

      setTimeout((): void => {
        mockSubjects[3].next({});
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });

});
