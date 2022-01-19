/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockImage, mockOtherIngredients, mockProcessSchedule, mockRecipeMasterActive, mockRecipeMasterInactive, mockRecipeVariantComplete, mockRecipeVariantIncomplete, mockStyles, mockUser } from '@test/mock-models';
import { ErrorReportingServiceStub, IdServiceStub, RecipeHttpServiceStub, RecipeImageServiceStub, RecipeSyncServiceStub, RecipeTypeGuardServiceStub, StorageServiceStub, UserServiceStub, UtilityServiceStub } from '@test/service-stubs';

/* Default imports */
import { defaultImage } from '@shared/defaults';

/* Interface imports */
import { Image, OtherIngredients, Process, RecipeMaster, RecipeVariant, Style, User } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ErrorReportingService, IdService, StorageService, UserService, UtilityService } from '@services/public';
import { RecipeHttpService } from '@services/recipe/http/recipe-http.service';
import { RecipeImageService } from '@services/recipe/image/recipe-image.service';
import { RecipeSyncService } from '@services/recipe/sync/recipe-sync.service';
import { RecipeTypeGuardService } from '@services/recipe/type-guard/recipe-type-guard.service';
import { RecipeStateService } from './recipe-state.service';


describe('RecipeStateService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: RecipeStateService;
  let originalCustomError: any;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        RecipeStateService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: RecipeHttpService, useClass: RecipeHttpServiceStub },
        { provide: RecipeImageService, useClass: RecipeImageServiceStub },
        { provide: RecipeSyncService, useClass: RecipeSyncServiceStub },
        { provide: RecipeTypeGuardService, useClass: RecipeTypeGuardServiceStub },
        { provide: StorageService, useClass: StorageServiceStub },
        { provide: UserService, useClass: UserServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ]
    });
    injector = getTestBed();
    service = injector.get(RecipeStateService);
    originalCustomError = service.getCustomError;
    service.getCustomError = jest.fn()
      .mockImplementation((message: string, additional: string): Error => {
        return new Error(`${message} ${additional}`);
      });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(RecipeStateService);
    service.recipeTypeGuardService.checkTypeSafety = jest.fn();
    service.errorReporter.handleUnhandledError = jest.fn();
    service.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: Error) => Observable<never> => {
        return (error: Error): Observable<never> => throwError(error);
      });
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  describe('Initializations', (): void => {

    test('should init list from server', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const list: RecipeMaster[] = [_mockRecipeMasterActive, _mockRecipeMasterActive];
      service.syncOnConnection = jest.fn().mockReturnValue(of(null));
      service.recipeHttpService.fetchPrivateRecipeList = jest.fn().mockReturnValue(of(list));
      service.mapRecipeListToSubjectList = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.utilService.canSendRequest = jest.fn().mockReturnValue(true);
      const fetchSpy: jest.SpyInstance = jest.spyOn(service.recipeHttpService, 'fetchPrivateRecipeList');
      const mapSpy: jest.SpyInstance = jest.spyOn(service, 'mapRecipeListToSubjectList');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateRecipeStorage');

      service.initFromServer()
        .subscribe(
          (expectNull: null): void => {
            expect(expectNull).toBeNull();
            expect(fetchSpy).toHaveBeenCalled();
            expect(mapSpy).toHaveBeenCalledWith(list);
            expect(updateSpy).toHaveBeenCalled();
            done();
          },
          (error: Error): void => {
            console.log('Error in: should init list from server', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should return null on init from server if cannot send request', (done: jest.DoneCallback): void => {
      service.utilService.canSendRequest = jest.fn().mockReturnValue(false);
      service.recipeHttpService.fetchPrivateRecipeList = jest.fn().mockReturnValue(of([]));
      service.mapRecipeListToSubjectList = jest.fn();
      service.updateRecipeStorage = jest.fn();
      const fetchSpy: jest.SpyInstance = jest.spyOn(service.recipeHttpService, 'fetchPrivateRecipeList');
      const mapSpy: jest.SpyInstance = jest.spyOn(service, 'mapRecipeListToSubjectList');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateRecipeStorage');

      service.initFromServer()
        .subscribe(
          (expectNull: null): void => {
            expect(expectNull).toBeNull();
            expect(fetchSpy).not.toHaveBeenCalled();
            expect(mapSpy).not.toHaveBeenCalled();
            expect(updateSpy).not.toHaveBeenCalled();
            done();
          },
          (error: Error): void => {
            console.log('Error in: should return null on init from server if cannot send request', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should init from storage', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const list: RecipeMaster[] = [_mockRecipeMasterActive, _mockRecipeMasterActive];
      service.storageService.getRecipes = jest.fn().mockReturnValue(of(list));
      service.mapRecipeListToSubjectList = jest.fn();
      const mapSpy: jest.SpyInstance = jest.spyOn(service, 'mapRecipeListToSubjectList');

      service.initFromStorage()
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(mapSpy).toHaveBeenCalledWith(list);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should init from storage', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should init recipe list', (done: jest.DoneCallback): void => {
      service.initFromStorage = jest.fn().mockReturnValue(of(null));
      service.initFromServer = jest.fn().mockReturnValue(of(null));
      const storageSpy: jest.SpyInstance = jest.spyOn(service, 'initFromStorage');
      const serverSpy: jest.SpyInstance = jest.spyOn(service, 'initFromServer');

      service.initRecipeList()
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(storageSpy).toHaveBeenCalled();
            expect(serverSpy).toHaveBeenCalled();
            done();
          },
          (error: Error): void => {
            console.log('Error in: should init recipe list', error);
            expect(true).toBe(false);
          }
        );
    });

  });


  describe('Sync Calls', (): void => {

    test('should handle sync response', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const currentList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);
      service.getRecipeList = jest.fn().mockReturnValue(currentList$);
      const inputList: BehaviorSubject<RecipeMaster>[] = [_mockRecipeMasterActive$, _mockRecipeMasterActive$];

      service.handleSyncResponse(inputList);
      expect(currentList$.value.length).toEqual(2);
      expect(currentList$.value[0].value).toStrictEqual(_mockRecipeMasterActive);
    });

    test('should sync on signup', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const list: BehaviorSubject<RecipeMaster>[] = [_mockRecipeMasterActive$];
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>(list);
      service.getRecipeList = jest.fn().mockReturnValue(list$);
      service.recipeSyncService.syncOnSignup = jest.fn().mockReturnValue(of(list));
      service.handleSyncResponse = jest.fn();
      const handleSpy: jest.SpyInstance = jest.spyOn(service, 'handleSyncResponse');

      service.syncOnSignup();

      setTimeout((): void => {
        expect(handleSpy).toHaveBeenCalledWith(list);
        done();
      }, 10);
    });

    test('should catch error from sync on signup', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const list: BehaviorSubject<RecipeMaster>[] = [_mockRecipeMasterActive$];
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>(list);
      service.getRecipeList = jest.fn().mockReturnValue(list$);
      const _mockError: Error = new Error('test-error');
      service.recipeSyncService.syncOnSignup = jest.fn().mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.syncOnSignup();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should sync on connection', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const list: BehaviorSubject<RecipeMaster>[] = [_mockRecipeMasterActive$];
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>(list);
      service.getRecipeList = jest.fn().mockReturnValue(list$);
      service.recipeSyncService.syncOnConnection = jest.fn().mockReturnValue(of(list));
      service.handleSyncResponse = jest.fn();
      const handleSpy: jest.SpyInstance = jest.spyOn(service, 'handleSyncResponse');

      service.syncOnConnection(true)
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(handleSpy).toHaveBeenCalledWith(list);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should sync on connection', error);
            expect(true).toBe(false);
          }
        );
    });

  });


  describe('State Handlers', (): void => {

    test('should add a recipe to list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);
      service.getRecipeList = jest.fn().mockReturnValue(list$);
      service.updateRecipeStorage = jest.fn();
      service.sendBackgroundRequest = jest.fn();
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateRecipeStorage');
      const sendSpy: jest.SpyInstance = jest.spyOn(service, 'sendBackgroundRequest');

      service.addRecipeToList(_mockRecipeMasterActive)
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(list$.value.length).toEqual(1);
            expect(list$.value[0].value).toStrictEqual(_mockRecipeMasterActive);
            expect(updateSpy).toHaveBeenCalled();
            expect(sendSpy).toHaveBeenCalledWith('post', _mockRecipeMasterActive);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should add a recipe master to list', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should add a recipe variant to a master in list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();
      _mockRecipeVariantIncomplete.isMaster = true;
      service.getRecipeSubjectById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.setRecipeAsMaster = jest.fn();
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.sendBackgroundRequest = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setRecipeAsMaster');
      const sendSpy: jest.SpyInstance = jest.spyOn(service, 'sendBackgroundRequest');
      expect(_mockRecipeMasterActive$.value.variants.length).toEqual(2);

      service.addVariantToRecipeInList(_mockRecipeMasterActive.cid, _mockRecipeVariantIncomplete)
        .subscribe(
          (): void => {
            expect(_mockRecipeMasterActive$.value.variants.length).toEqual(3);
            expect(setSpy).toHaveBeenCalledWith(_mockRecipeMasterActive, _mockRecipeMasterActive.variants.length - 1);
            expect(sendSpy).toHaveBeenCalledWith('post', _mockRecipeMasterActive, _mockRecipeVariantIncomplete);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should add a recipe variant to a master in list'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error adding a recipe variant to missing master', (done: jest.DoneCallback): void => {
      service.getRecipeSubjectById = jest.fn().mockReturnValue(undefined);
      const _mockError: Error = new Error('test-error');
      service.getCustomError = jest.fn().mockReturnValue(_mockError);
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');

      service.addVariantToRecipeInList('recipe-id', null)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(errorSpy).toHaveBeenCalledWith(
              'An error occurred trying to add a new variant to a recipe: recipe not found',
              'recipe-id'
            );
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

    test('should clear recipes', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const list: BehaviorSubject<RecipeMaster>[] = [_mockRecipeMasterActive$];
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>(list);
      service.getRecipeList = jest.fn().mockReturnValue(list$);
      service.storageService.removeRecipes = jest.fn();
      const removeSpy: jest.SpyInstance = jest.spyOn(service.storageService, 'removeRecipes');

      service.clearRecipes();

      expect(list$.value.length).toEqual(0);
      expect(removeSpy).toHaveBeenCalled();
    });

    test('should update list subject', (): void => {
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);
      service.getRecipeList = jest.fn().mockReturnValue(list$);
      const nextSpy: jest.SpyInstance = jest.spyOn(list$, 'next');

      service.emitListUpdate();

      expect(nextSpy).toHaveBeenCalled();
    });

    test('should remove a recipe variant from a master in list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      service.getRecipeSubjectById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.removeRecipeAsMaster = jest.fn();
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.idService.getIndexById = jest.fn().mockReturnValue(0);
      service.sendBackgroundRequest = jest.fn();
      const removeSpy: jest.SpyInstance = jest.spyOn(service, 'removeRecipeAsMaster');
      const sendSpy: jest.SpyInstance = jest.spyOn(service, 'sendBackgroundRequest');
      expect(_mockRecipeMasterActive.variants.length).toEqual(2);
      expect(_mockRecipeMasterActive.variants.find((variant: RecipeVariant): boolean => variant.cid === _mockRecipeVariantComplete.cid)).toBeDefined();

      service.removeVariantFromRecipeInList(_mockRecipeMasterActive.cid, _mockRecipeVariantComplete.cid)
        .subscribe(
          (): void => {
            expect(_mockRecipeMasterActive.variants.length).toEqual(1);
            expect(
              _mockRecipeMasterActive.variants.find((variant: RecipeVariant): boolean => {
                return variant.cid === _mockRecipeVariantComplete.cid;
              })
            ).toBeUndefined();
            expect(removeSpy).toHaveBeenCalledWith(_mockRecipeMasterActive, 0);
            expect(sendSpy).toHaveBeenCalledWith(
              'delete',
              _mockRecipeMasterActive,
              _mockRecipeVariantComplete
            );
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should remove a recipe variant from a master in list'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get null when trying to remove a variant that does not exist', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      service.getRecipeSubjectById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.idService.getIndexById = jest.fn().mockReturnValue(-1);

      service.removeVariantFromRecipeInList('master-id', 'variant-id')
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            done();
          },
          (error: Error): void => {
            console.log('Error in: should get null when trying to remove a variant that does not exist', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get error when trying to remove a variant from a recipe that does not exist', (done: jest.DoneCallback): void => {
      service.getRecipeSubjectById = jest.fn().mockReturnValue(undefined);
      const _mockError: Error = new Error('test-error');
      service.getCustomError = jest.fn().mockReturnValue(_mockError);
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');

      service.removeVariantFromRecipeInList('recipe-id', 'variant-id')
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(errorSpy).toHaveBeenCalledWith(
              'An error occurred trying to remove variant from recipe: missing parent recipe',
              'recipe-id'
            );
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

    test('should remove a recipe from list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive),
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive)
      ]);
      service.getRecipeList = jest.fn().mockReturnValue(list$);
      service.utilService.getArrayFromBehaviorSubjects = jest.fn().mockReturnValue([]);
      service.recipeImageService.deleteImage = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.sendBackgroundRequest = jest.fn();
      service.idService.getIndexById = jest.fn().mockReturnValue(1);
      const getSpy: jest.SpyInstance = jest.spyOn(service.utilService, 'getArrayFromBehaviorSubjects');
      const deleteSpy: jest.SpyInstance = jest.spyOn(service.recipeImageService, 'deleteImage');
      const sendSpy: jest.SpyInstance = jest.spyOn(service, 'sendBackgroundRequest');

      service.removeRecipeFromList(_mockRecipeMasterInactive.cid)
        .subscribe(
          (expectedNull: null): void => {
            const newList: BehaviorSubject<RecipeMaster>[] = list$.value;
            expect(newList.length).toEqual(1);
            expect(newList.find((_master$: BehaviorSubject<RecipeMaster>): boolean => _master$.value.cid === _mockRecipeMasterInactive.cid)).toBeUndefined();
            expect(expectedNull).toBeNull();
            expect(getSpy).toHaveBeenCalledWith(list$.value);
            expect(deleteSpy).toHaveBeenCalledWith(_mockRecipeMasterInactive.labelImage);
            expect(sendSpy).toHaveBeenCalledWith('delete', _mockRecipeMasterInactive);
            done();
          },
          (error: any): void => {
            console.log('Error in: should remove a recipe master from list', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get null when trying to remove a recipe that does not exist', (done: jest.DoneCallback): void => {
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);
      service.getRecipeList = jest.fn().mockReturnValue(list$);
      service.utilService.getArrayFromBehaviorSubjects = jest.fn().mockReturnValue([]);
      service.idService.getIndexById = jest.fn().mockReturnValue(-1);

      service.removeRecipeFromList('recipe-id')
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            done();
          },
          (error: Error): void => {
            console.log('Error in: should get null when trying to remove a recipe that does not exist', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should remove a recipe as the master', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      _mockRecipeVariantComplete.isMaster = false;
      _mockRecipeMasterActive.variants.push(_mockRecipeVariantComplete);

      service.removeRecipeAsMaster(_mockRecipeMasterActive, 0);

      expect(_mockRecipeMasterActive.variants.findIndex((variant: RecipeVariant): boolean => variant.isMaster)).toEqual(1);

      service.removeRecipeAsMaster(_mockRecipeMasterActive, 1);

      expect(_mockRecipeMasterActive.variants.findIndex((variant: RecipeVariant): boolean => variant.isMaster)).toEqual(0);

      _mockRecipeMasterActive.variants[0].isMaster = false;
      _mockRecipeMasterActive.variants[2].isMaster = true;
      service.removeRecipeAsMaster(_mockRecipeMasterActive, 2);

      expect(_mockRecipeMasterActive.variants.findIndex((variant: RecipeVariant): boolean => variant.isMaster)).toEqual(0);

      _mockRecipeMasterActive.variants.pop();
      _mockRecipeMasterActive.variants.pop();

      service.removeRecipeAsMaster(_mockRecipeMasterActive, 0);

      expect(_mockRecipeMasterActive.variants[0].isMaster).toBe(true);
    });

    test('should set a recipe as master', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      expect(_mockRecipeMasterActive.variants[0].isMaster).toBe(true);
      expect(_mockRecipeMasterActive.variants[1].isMaster).toBe(false);

      service.setRecipeAsMaster(_mockRecipeMasterActive, 1);

      expect(_mockRecipeMasterActive.variants[1].isMaster).toBe(true);
      expect(_mockRecipeMasterActive.variants[0].isMaster).toBe(false);
    });

    test('should update recipe storage', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive),
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive)
      ]);
      service.storageService.setRecipes = jest.fn().mockReturnValue(of({}));
      service.getRecipeList = jest.fn().mockReturnValue(list$);
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storageService, 'setRecipes');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.updateRecipeStorage();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith([_mockRecipeMasterActive, _mockRecipeMasterInactive]);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('stored recipes');
        done();
      }, 10);
    });

    test('should get an error trying to update recipe storage', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.storageService.setRecipes = jest.fn().mockReturnValue(throwError(_mockError));
      service.getRecipeList = jest.fn().mockReturnValue(new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]));
      service.errorReporter.handleUnhandledError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.updateRecipeStorage();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should update a recipe in list also with an image change', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const _mockCurrentImage: Image = mockImage();
      _mockCurrentImage.cid += '1';
      _mockRecipeMasterInactive.labelImage = _mockCurrentImage;
      const _mockRecipeMasterInactive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive);
      const _mockUpdate: RecipeMaster = mockRecipeMasterInactive();
      _mockUpdate.name = 'updated';
      const _mockUpdateImage: Image = mockImage();
      _mockUpdateImage.cid += '11';
      _mockUpdateImage.hasPending = true;
      _mockUpdate.labelImage = _mockUpdateImage;
      service.getRecipeSubjectById = jest.fn().mockReturnValue(_mockRecipeMasterInactive$);
      service.recipeImageService.isTempImage = jest.fn().mockReturnValue(false);
      const _mockStoredImage: Image = mockImage();
      _mockStoredImage.cid += '111';
      service.recipeImageService.storeImageToLocalDir = jest.fn().mockReturnValue(of(_mockStoredImage));
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.sendBackgroundRequest = jest.fn();

      service.updateRecipeInList(_mockRecipeMasterInactive.cid, _mockUpdate)
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(_mockRecipeMasterInactive$.value.name).toMatch('updated');
            expect(_mockRecipeMasterInactive$.value.labelImage).toStrictEqual(_mockStoredImage);
            done();
          },
          (error: any): void => {
            console.log('Error in: should update a recipe in list also with an image change', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should update a recipe in list also without an image change', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const _mockCurrentImage: Image = mockImage();
      _mockCurrentImage.cid += '1';
      _mockRecipeMasterInactive.labelImage = _mockCurrentImage;
      const _mockRecipeMasterInactive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive);
      const _mockUpdate: RecipeMaster = mockRecipeMasterInactive();
      _mockUpdate.name = 'updated';
      const _mockUpdateImage: Image = mockImage();
      _mockUpdateImage.cid += '11';
      _mockUpdateImage.hasPending = false;
      _mockUpdate.labelImage = _mockUpdateImage;
      service.getRecipeSubjectById = jest.fn().mockReturnValue(_mockRecipeMasterInactive$);
      service.recipeImageService.isTempImage = jest.fn().mockReturnValue(false);
      const _mockStoredImage: Image = mockImage();
      _mockStoredImage.cid += '111';
      service.recipeImageService.storeImageToLocalDir = jest.fn().mockReturnValue(of(_mockStoredImage));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.recipeImageService, 'storeImageToLocalDir');
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.sendBackgroundRequest = jest.fn();

      service.updateRecipeInList(_mockRecipeMasterInactive.cid, _mockUpdate)
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(_mockRecipeMasterInactive$.value.name).toMatch('updated');
            expect(storeSpy).not.toHaveBeenCalled();
            done();
          },
          (error: any): void => {
            console.log('Error in: should update a recipe in list also without an image change', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error trying to update a recipe in list that is missing', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.getCustomError = jest.fn().mockReturnValue(_mockError);
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');

      service.updateRecipeInList('missing-id', {})
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error).toStrictEqual(_mockError);
            expect(errorSpy).toHaveBeenCalledWith(
              'An error occurred trying to update recipe: recipe not found',
              'missing-id'
            );
            done();
          }
        );
    });

    test('should update a variant in a recipe and set as master', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      service.getRecipeSubjectById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      const updateIndex: number = _mockRecipeMasterActive.variants.length / 2;
      service.idService.getIndexById = jest.fn().mockReturnValue(updateIndex);
      const _mockUpdate: object = {
        isMaster: true,
        variantName: 'updated test name'
      };
      service.setRecipeAsMaster = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setRecipeAsMaster');
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.sendBackgroundRequest = jest.fn();
      const sendSpy: jest.SpyInstance = jest.spyOn(service, 'sendBackgroundRequest');

      service.updateVariantOfRecipeInList('recipe-id', 'variant-id', _mockUpdate)
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(setSpy).toHaveBeenCalledWith(_mockRecipeMasterActive, updateIndex);
            expect(sendSpy).toHaveBeenCalledWith('patch', _mockRecipeMasterActive, _mockRecipeMasterActive.variants[updateIndex]);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should update a variant in a recipe and set as master', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should update a variant in a recipe and remove as master', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      service.getRecipeSubjectById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      const updateIndex: number = _mockRecipeMasterActive.variants.length / 2;
      _mockRecipeMasterActive.variants[updateIndex].isMaster = true;
      service.idService.getIndexById = jest.fn().mockReturnValue(updateIndex);
      const _mockUpdate: object = {
        isMaster: false,
        variantName: 'updated test name'
      };
      service.removeRecipeAsMaster = jest.fn();
      const removeSpy: jest.SpyInstance = jest.spyOn(service, 'removeRecipeAsMaster');
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.sendBackgroundRequest = jest.fn();
      const sendSpy: jest.SpyInstance = jest.spyOn(service, 'sendBackgroundRequest');

      service.updateVariantOfRecipeInList('recipe-id', 'variant-id', _mockUpdate)
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(removeSpy).toHaveBeenCalledWith(_mockRecipeMasterActive, updateIndex);
            expect(sendSpy).toHaveBeenCalledWith('patch', _mockRecipeMasterActive, _mockRecipeMasterActive.variants[updateIndex]);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should update a variant in a recipe and set as master', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error trying to update a variant with a missing parent recipe', (done: jest.DoneCallback): void => {
      service.getRecipeSubjectById = jest.fn().mockReturnValue(undefined);
      const _mockError: Error = new Error('test-error');
      service.getCustomError = jest.fn().mockReturnValue(_mockError);
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');

      service.updateVariantOfRecipeInList('recipe-id', 'variant-id', {})
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error).toStrictEqual(_mockError);
            expect(errorSpy).toHaveBeenCalledWith(
              'An error occurred trying to update variant in recipe: parent recipe not found',
              'recipe-id'
            );
            done();
          }
        );
    });

    test('should get an error trying to update a variant with a missing variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      service.getRecipeSubjectById = jest.fn().mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive));
      service.idService.getIndexById = jest.fn().mockReturnValue(-1);
      const _mockError: Error = new Error('test-error');
      service.getCustomError = jest.fn().mockReturnValue(_mockError);
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');

      service.updateVariantOfRecipeInList('recipe-id', 'variant-id', {})
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error).toStrictEqual(_mockError);
            expect(errorSpy).toHaveBeenCalledWith(
              'An error occurred trying to update variant in recipe: variant not found',
              'recipe: recipe-id, variant: variant-id'
            );
            done();
          }
        );
    });

  });


  describe('Helper Methods', (): void => {

    test('should create a base recipe with default image', (): void => {
      const _mockUser: User = mockUser();
      service.userService.getUser = jest.fn().mockReturnValue(new BehaviorSubject<User>(_mockUser));
      service.idService.getId = jest.fn().mockReturnValue(_mockUser._id);
      service.idService.getNewId = jest.fn().mockReturnValue('new-id');
      service.setRecipeIds = jest.fn();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockStyle: Style = mockStyles()[0];
      const _defaultImage: Image = defaultImage();

      const recipe: RecipeMaster = service.createBaseRecipe({
        master: {
          name: 'new name',
          style: _mockStyle,
          notes: []
        },
        variant: _mockRecipeVariantComplete
      });
      expect(recipe).toStrictEqual({
        cid: 'new-id',
        name: 'new name',
        style: _mockStyle,
        notes: [],
        master: _mockRecipeVariantComplete.cid,
        owner: _mockUser._id,
        isPublic: false,
        isFriendsOnly: false,
        variants: [_mockRecipeVariantComplete],
        labelImage: _defaultImage
      });
    });

    test('should create a base recipe with given image', (): void => {
      const _mockUser: User = mockUser();
      service.userService.getUser = jest.fn().mockReturnValue(new BehaviorSubject<User>(_mockUser));
      service.idService.getId = jest.fn().mockReturnValue(_mockUser._id);
      service.idService.getNewId = jest.fn().mockReturnValue('new-id');
      service.setRecipeIds = jest.fn();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockStyle: Style = mockStyles()[0];
      const _mockImage: Image = mockImage();

      const recipe: RecipeMaster = service.createBaseRecipe({
        master: {
          name: 'new name',
          style: _mockStyle,
          notes: [],
          labelImage: _mockImage
        },
        variant: _mockRecipeVariantComplete
      });
      expect(recipe).toStrictEqual({
        cid: 'new-id',
        name: 'new name',
        style: _mockStyle,
        notes: [],
        master: _mockRecipeVariantComplete.cid,
        owner: _mockUser._id,
        isPublic: false,
        isFriendsOnly: false,
        variants: [_mockRecipeVariantComplete],
        labelImage: _mockImage
      });
    });

    test('should get an error creating a base recipe with missing user', (): void => {
      const _mockUser: User = mockUser();
      service.userService.getUser = jest.fn().mockReturnValue(new BehaviorSubject<User>(_mockUser));
      service.idService.getId = jest.fn().mockReturnValue(undefined);
      const _mockError: Error = new Error('test-error');
      service.getCustomError = jest.fn().mockReturnValue(_mockError);
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');

      expect((): void => {
        service.createBaseRecipe({});
      }).toThrowError(_mockError);
      expect(errorSpy).toHaveBeenCalledWith('Client Validation Error: missing user id');
    });

    test('should create a new recipe', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockTempImage: Image = mockImage();
      _mockTempImage.cid += '1';
      _mockRecipeMasterActive.labelImage = _mockTempImage;
      const _mockStoredImage: Image = mockImage();
      _mockStoredImage.cid += '2';
      service.createBaseRecipe = jest.fn().mockReturnValue(_mockRecipeMasterActive);
      service.recipeImageService.storeNewImage = jest.fn().mockReturnValue(of(_mockStoredImage));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.recipeImageService, 'storeNewImage');
      service.addRecipeToList = jest.fn().mockReturnValue(of(null));
      const addSpy: jest.SpyInstance = jest.spyOn(service, 'addRecipeToList');

      service.createNewRecipe({})
        .subscribe(
          (expectedNull: null): void => {
            expect(expectedNull).toBeNull();
            expect(storeSpy).toHaveBeenCalledWith(_mockTempImage);
            expect(addSpy.mock.calls[0][0]['labelImage']).toStrictEqual(_mockStoredImage);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should create a new recipe', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get a custom error', (): void => {
      service.getCustomError = originalCustomError;
      const userMessage: string = 'test user message';
      const additionalMessage: string = 'test additional message';
      const error: CustomError = service.getCustomError(userMessage, additionalMessage);
      expect(error.name).toMatch('RecipeError');
      expect(error.message).toMatch(`${userMessage} ${additionalMessage}`);
      expect(error.severity).toEqual(2);
      expect(error.userMessage).toMatch(userMessage);
    });

    test('should get a recipe by its id', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      service.getRecipeSubjectById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getRecipeSubjectById');

      expect(service.getRecipeById('recipe-id')).toStrictEqual(_mockRecipeMasterActive);
      expect(getSpy).toHaveBeenCalledWith('recipe-id');
    });

    test('should get undefined getting recipe by id that is not found', (): void => {
      service.getRecipeSubjectById = jest.fn().mockReturnValue(undefined);

      expect(service.getRecipeById('recipd-id')).toBeUndefined();
    });

    test('should get the recipe list', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        _mockRecipeMasterActive$,
        _mockRecipeMasterActive$
      ]);
      service.recipeList$ = list$;

      expect(service.getRecipeList()).toStrictEqual(list$);
    });

    test('should get recipe subject by its id', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const _mockRecipeMasterInactive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive);
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        _mockRecipeMasterActive$,
        _mockRecipeMasterInactive$
      ]);
      service.getRecipeList = jest.fn().mockReturnValue(list$);
      service.idService.hasId = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      expect(service.getRecipeSubjectById('recipe-id')).toStrictEqual(_mockRecipeMasterInactive$);
    });

    test('should map list of recipes into a behavior subject of list of behavior subjects of recipes', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const _mockRecipeMasterInactive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive);
      const initialList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);
      const newList: BehaviorSubject<RecipeMaster>[] = [
        _mockRecipeMasterActive$,
        _mockRecipeMasterInactive$
      ];
      service.getRecipeList = jest.fn().mockReturnValue(initialList$);
      service.utilService.toBehaviorSubjectArray = jest.fn().mockReturnValue(newList);

      service.mapRecipeListToSubjectList([_mockRecipeMasterActive, _mockRecipeMasterInactive]);

      expect(initialList$.value.length).toEqual(2);
      expect(initialList$.value).toStrictEqual(newList);
    });

    test('should set all recipe ids', (): void => {
      const _mockOtherIngredients: OtherIngredients[] = mockOtherIngredients();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      _mockRecipeVariantComplete.cid = '';
      _mockRecipeVariantComplete.otherIngredients = _mockOtherIngredients;
      service.idService.getNewId = jest.fn().mockReturnValue('0000000000000');
      service.setRecipeNestedIds = jest.fn();
      const nestSpy: jest.SpyInstance = jest.spyOn(service, 'setRecipeNestedIds');

      service.setRecipeIds(_mockRecipeVariantComplete);

      expect(_mockRecipeVariantComplete.cid).toMatch('0000000000000');
      const spyCalls: any[] = nestSpy.mock.calls;
      expect(spyCalls[0][0]).toStrictEqual(_mockRecipeVariantComplete.grains);
      expect(spyCalls[1][0]).toStrictEqual(_mockRecipeVariantComplete.hops);
      expect(spyCalls[2][0]).toStrictEqual(_mockRecipeVariantComplete.yeast);
      expect(spyCalls[3][0]).toStrictEqual(_mockRecipeVariantComplete.otherIngredients);
      expect(spyCalls[4][0]).toStrictEqual(_mockRecipeVariantComplete.processSchedule);
    });

    test('should set nested ids', (): void => {
      const _mockProcessSchedule: Process[] = mockProcessSchedule();
      _mockProcessSchedule.forEach((process: Process): void => { process.cid = ''; });
      let id: number = 0;
      service.idService.getNewId = jest.fn()
        .mockImplementation((): string => `${id++}`);

      service.setRecipeNestedIds<Process>(_mockProcessSchedule);

      _mockProcessSchedule.forEach((process: Process, index: number): void => {
        expect(process.cid).toMatch(`${index}`);
      });
    });

  });


  describe('Background Requests', (): void => {

    test('should handle background update recipe response', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      service.getRecipeSubjectById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      const _mockRecipeResponse: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeResponse.cid += '1';

      service.handleBackgroundUpdateResponse('recipe-id', null, _mockRecipeResponse, false);

      expect(_mockRecipeMasterActive$.value).toStrictEqual(_mockRecipeResponse);
    });

    test('should handle background update variant response', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.variants = [_mockRecipeVariantIncomplete, _mockRecipeVariantComplete];
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      service.getRecipeSubjectById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      const _mockRecipeResponse: RecipeVariant = mockRecipeVariantComplete();
      _mockRecipeResponse.cid += '1';
      service.idService.hasId = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();
      const emitSpy: jest.SpyInstance = jest.spyOn(service, 'emitListUpdate');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateRecipeStorage');

      service.handleBackgroundUpdateResponse('recipe-id', 'variant-id', _mockRecipeResponse, false);

      expect(emitSpy).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
      expect(_mockRecipeMasterActive$.value.variants[1]).toStrictEqual(_mockRecipeResponse);
    });

    test('should get an error handling background request that is missing the recipe and not a deletion', (): void => {
      const _mockRecipeResponse: RecipeMaster = mockRecipeMasterActive();
      service.idService.getId = jest.fn().mockReturnValue(_mockRecipeResponse.cid);
      const _mockError: Error = new Error('test-error');
      service.getCustomError = jest.fn().mockReturnValue(_mockError);
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');

      expect((): void => {
        service.handleBackgroundUpdateResponse('recipe-id', null, _mockRecipeResponse, false);
      }).toThrowError(_mockError);
      expect(errorSpy).toHaveBeenCalledWith(
        'Error processing background update response: recipe not found',
        _mockRecipeResponse.cid
      );
    });

    test('should send a background recipe post request', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.idService.getId = jest.fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(undefined);
      service.utilService.canSendRequest = jest.fn().mockReturnValue(true);
      const idSpy: jest.SpyInstance = jest.spyOn(service.utilService, 'canSendRequest');
      const guardSpy: jest.SpyInstance = jest.spyOn(service.recipeTypeGuardService, 'checkTypeSafety');
      const _mockRecipeResponse: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeResponse.cid += '1';
      service.recipeHttpService.requestInBackground = jest.fn().mockReturnValue(of(_mockRecipeResponse));
      const reqSpy: jest.SpyInstance = jest.spyOn(service.recipeHttpService, 'requestInBackground');
      service.handleBackgroundUpdateResponse = jest.fn();
      const handleSpy: jest.SpyInstance = jest.spyOn(service, 'handleBackgroundUpdateResponse');

      service.sendBackgroundRequest('post', _mockRecipeMasterActive);

      setTimeout((): void => {
        expect(idSpy).toHaveBeenCalledWith([]);
        expect(guardSpy).toHaveBeenCalledWith(_mockRecipeMasterActive);
        expect(reqSpy).toHaveBeenCalledWith('post', _mockRecipeMasterActive, undefined);
        expect(handleSpy).toHaveBeenCalledWith(_mockRecipeMasterActive._id, undefined, _mockRecipeResponse, false);
        done();
      }, 10);
    });

    test('should send a background variant patch request', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      service.idService.getId = jest.fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(_mockRecipeVariantComplete._id);
      service.utilService.canSendRequest = jest.fn().mockReturnValue(true);
      const idSpy: jest.SpyInstance = jest.spyOn(service.utilService, 'canSendRequest');
      const guardSpy: jest.SpyInstance = jest.spyOn(service.recipeTypeGuardService, 'checkTypeSafety');
      const _mockRecipeResponse: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeResponse.cid += '1';
      service.recipeHttpService.requestInBackground = jest.fn().mockReturnValue(of(_mockRecipeResponse));
      const reqSpy: jest.SpyInstance = jest.spyOn(service.recipeHttpService, 'requestInBackground');
      service.handleBackgroundUpdateResponse = jest.fn();
      const handleSpy: jest.SpyInstance = jest.spyOn(service, 'handleBackgroundUpdateResponse');

      service.sendBackgroundRequest('patch', _mockRecipeMasterActive, _mockRecipeVariantComplete);

      setTimeout((): void => {
        expect(idSpy).toHaveBeenCalledWith([_mockRecipeMasterActive._id, _mockRecipeVariantComplete._id]);
        expect(guardSpy).toHaveBeenCalledWith(_mockRecipeVariantComplete);
        expect(reqSpy).toHaveBeenCalledWith('patch', _mockRecipeMasterActive, _mockRecipeVariantComplete);
        expect(handleSpy).toHaveBeenCalledWith(_mockRecipeMasterActive._id, _mockRecipeVariantComplete._id, _mockRecipeResponse, false);
        done();
      }, 10);
    });

    test('should catch an error from request in background', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.idService.getId = jest.fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(undefined);
      service.utilService.canSendRequest = jest.fn().mockReturnValue(true);
      const idSpy: jest.SpyInstance = jest.spyOn(service.utilService, 'canSendRequest');
      const guardSpy: jest.SpyInstance = jest.spyOn(service.recipeTypeGuardService, 'checkTypeSafety');
      const _mockRecipeResponse: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeResponse.cid += '1';
      const _mockError: Error = new Error('test-error');
      service.recipeHttpService.requestInBackground = jest.fn().mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.sendBackgroundRequest('post', _mockRecipeMasterActive);

      setTimeout((): void => {
        expect(idSpy).toHaveBeenCalledWith([]);
        expect(guardSpy).toHaveBeenCalledWith(_mockRecipeMasterActive);
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should add a sync flag when trying to send a background request and cannot send', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.idService.getId = jest.fn()
        .mockReturnValueOnce(_mockRecipeMasterActive._id)
        .mockReturnValueOnce(undefined);
      service.utilService.canSendRequest = jest.fn().mockReturnValue(false);
      service.recipeSyncService.addSyncFlag = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(service.recipeSyncService, 'addSyncFlag');
      service.recipeSyncService.convertRequestMethodToSyncMethod = jest.fn().mockReturnValue('create');
      const convertSpy: jest.SpyInstance = jest.spyOn(service.recipeSyncService, 'convertRequestMethodToSyncMethod');

      service.sendBackgroundRequest('post', _mockRecipeMasterActive);

      expect(addSpy).toHaveBeenCalledWith('create', _mockRecipeMasterActive._id);
      expect(convertSpy).toHaveBeenCalledWith('post');
    });

  });

});
