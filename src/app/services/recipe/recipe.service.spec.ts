/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, forkJoin, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockAuthor, mockOtherIngredients, mockGrainBill, mockHopsSchedule, mockImage, mockImageRequestMetadata, mockRecipeMasterActive, mockRecipeMasterInactive, mockRecipeVariantComplete, mockRecipeVariantIncomplete, mockErrorResponse, mockProcessSchedule, mockStyles, mockUser, mockSyncError, mockSyncMetadata, mockSyncResponse, mockYeastBatch } from '@test/mock-models';
import { IdServiceStub, ConnectionServiceStub, ErrorReportingServiceStub, EventServiceStub, HttpErrorServiceStub, ImageServiceStub, LibraryServiceStub, StorageServiceStub, SyncServiceStub, ToastServiceStub, TypeGuardServiceStub, UserServiceStub, UtilityServiceStub } from '@test/service-stubs';

/* Constants imports */
import { API_VERSION, BASE_URL } from '@shared/constants';

/* Interface imports */
import { Author, GrainBill, HopsSchedule, Image, ImageRequestMetadata, OtherIngredients, Process, RecipeMaster, RecipeVariant, Style, SyncData, SyncError, SyncRequests, SyncResponse, User, YeastBatch, } from '@shared/interfaces';

/* Type guard imports */
import { ProcessGuardMetadata, CalendarProcessGuardMetadata, ManualProcessGuardMetadata, TimerProcessGuardMetadata, GrainBillGuardMetadata, GrainsGuardMetadata, HopsScheduleGuardMetadata, HopsGuardMetadata, YeastBatchGuardMetadata, YeastGuardMetadata, OtherIngredientsGuardMetadata } from '@shared/type-guard-metadata';

/* Type imports */
import { CustomError } from '@shared/types';

/* Default imports */
import { defaultImage } from '@shared/defaults';

/* Service imports */
import { ConnectionService, ErrorReportingService, EventService, HttpErrorService, IdService, ImageService, LibraryService, StorageService, SyncService, ToastService, TypeGuardService, UserService, UtilityService } from '@services/public';
import { RecipeService } from './recipe.service';


describe('RecipeService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: RecipeService;
  let httpMock: HttpTestingController;
  let originalRegister: any;
  let originalRequest: any;
  let originalSync: any;
  let originalCan: any;
  let originalMissingError: any;
  let originalCheck: any;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        RecipeService,
        { provide: IdService, useClass: IdServiceStub },
        { provide: ConnectionService, useClass: ConnectionServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: EventService, useClass: EventServiceStub },
        { provide: HttpErrorService, useClass: HttpErrorServiceStub },
        { provide: ImageService, useClass: ImageServiceStub },
        { provide: LibraryService, useClass: LibraryServiceStub },
        { provide: StorageService, useClass: StorageServiceStub },
        { provide: SyncService, useClass: SyncServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: TypeGuardService, useClass: TypeGuardServiceStub },
        { provide: UserService, useClass: UserServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ]
    });
    injector = getTestBed();
    service = injector.get(RecipeService);
    originalRegister = service.registerEvents;
    originalRequest = service.requestInBackground;
    originalSync = service.addSyncFlag;
    originalCan = service.canSendRequest;
    originalMissingError = service.getMissingError;
    service.getMissingError = jest.fn()
      .mockImplementation((message: string, additional: string): Error => {
        return new Error(`${message} ${additional}`);
      });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(RecipeService);
    service.registerEvents = jest.fn();
    service.httpError.handleError = jest.fn()
      .mockImplementation((error: HttpErrorResponse): Observable<never> => {
        return throwError(`<${error.status}> ${error.statusText}`);
      });
    originalCheck = service.checkTypeSafety;
    service.checkTypeSafety = jest.fn().mockReturnValue(true);
    service.errorReporter.handleUnhandledError = jest.fn();
    service.requestInBackground = jest.fn();
    service.addSyncFlag = jest.fn();
    service.canSendRequest = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    httpMock = injector.get(HttpTestingController);
    Object.assign(service.errorReporter, { highSeverity: 2 });
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });


  describe('Initializations', (): void => {

    test('should initialize from server', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.syncOnConnection = jest.fn().mockReturnValue(of(true));
      service.mapRecipeMasterArrayToSubjects = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.event.emit = jest.fn();
      service.errorReporter.handleGenericCatchError = jest.fn();
      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');
      const mapSpy: jest.SpyInstance = jest.spyOn(service, 'mapRecipeMasterArrayToSubjects');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateRecipeStorage');

      service.initFromServer();

      setTimeout((): void => {
        expect(emitSpy).toHaveBeenCalledWith('init-batches');
        expect(mapSpy).toHaveBeenCalledWith([_mockRecipeMasterActive]);
        expect(updateSpy).toHaveBeenCalled();
        done();
      }, 10);
      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/private`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush([_mockRecipeMasterActive]);
    });

    test('should get an error trying to init from server', (done: jest.DoneCallback): void => {
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'not found');
      service.syncOnConnection = jest.fn().mockReturnValue(of(true));
      service.event.emit = jest.fn();
      service.errorReporter.handleGenericCatchError = jest.fn()
        .mockReturnValue((error: any): Observable<never> => throwError(null));
      service.errorReporter.handleUnhandledError = jest.fn();
      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleGenericCatchError');
      const customSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.initFromServer();

      setTimeout((): void => {
        expect(emitSpy).toHaveBeenCalledWith('init-batches');
        expect(errorSpy).toHaveBeenCalled();
        expect(customSpy).toHaveBeenCalledWith(null);
        done();
      }, 10);
      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/private`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, _mockHttpError);
    });

    test('should init from storage', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActiveList: RecipeMaster[] = [mockRecipeMasterActive()];
      service.storageService.getRecipes = jest.fn().mockReturnValue(of(_mockRecipeMasterActiveList));
      service.mapRecipeMasterArrayToSubjects = jest.fn();
      const mapSpy: jest.SpyInstance = jest.spyOn(service, 'mapRecipeMasterArrayToSubjects');

      service.initFromStorage();

      setTimeout((): void => {
        expect(mapSpy).toHaveBeenCalledWith(_mockRecipeMasterActiveList);
        done();
      }, 10);
    });

    test('should get an error trying to init from storage', (): void => {
      const _mockError: Error = new Error('test-error');
      const _mockSubject: Subject<any> = new Subject<any>();
      service.storageService.getRecipes = jest.fn().mockReturnValue(_mockSubject);
      const customSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.initFromStorage();

      _mockSubject.error(_mockError);

      expect(customSpy).toHaveBeenCalledWith(_mockError);
    });

    test('should initialize recipe list', (): void => {
      service.initFromStorage = jest.fn();
      service.initFromServer = jest.fn();
      service.event.emit = jest.fn();
      const storeSpy: jest.SpyInstance = jest.spyOn(service, 'initFromStorage');
      const serverSpy: jest.SpyInstance = jest.spyOn(service, 'initFromServer');
      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');

      service.initializeRecipeMasterList();

      expect(storeSpy).toHaveBeenCalled();
      expect(serverSpy).toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalled();

      service.initializeRecipeMasterList();

      expect(serverSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalled();
    });

    test('should register events', (): void => {
      const mockSubjects: Subject<object>[] = Array.from(Array(4), () => new Subject<object>());
      let counter = 0;
      service.event.register = jest.fn().mockImplementation(() => mockSubjects[counter++]);
      service.initializeRecipeMasterList = jest.fn();
      service.clearRecipes = jest.fn();
      service.syncOnSignup = jest.fn();
      service.syncOnReconnect = jest.fn();
      const spies: jest.SpyInstance[] = [
        jest.spyOn(service, 'initializeRecipeMasterList'),
        jest.spyOn(service, 'clearRecipes'),
        jest.spyOn(service, 'syncOnSignup'),
        jest.spyOn(service, 'syncOnReconnect')
      ];
      const eventSpy: jest.SpyInstance = jest.spyOn(service.event, 'register');
      service.registerEvents = originalRegister;

      service.registerEvents();

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
    });

  });


  describe('Public API', (): void => {

    test('should get public author by id', (done: jest.DoneCallback): void => {
      const _mockAuthor: Author = mockAuthor();
      const _mockUser: User = mockUser();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.owner = 'other';
      service.getRecipeMasterById = jest.fn()
        .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));
      service.userService.getUser = jest.fn()
        .mockReturnValue(new BehaviorSubject<User>(_mockUser));
      service.idService.hasId = jest.fn().mockReturnValue(false);
      service.idService.hasDefaultIdType = jest.fn().mockReturnValue(true);

      service.getPublicAuthorByRecipeId('0123456789012')
        .subscribe(
          (author: Author): void => {
            expect(author).toStrictEqual(_mockAuthor);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get public author by id'`, error);
            expect(true).toBe(false);
          }
        );
      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/public/master/${_mockRecipeMasterActive._id}/author`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(_mockAuthor);
    });

    test('should get a default author if recipe master not found', (done: jest.DoneCallback): void => {
      const _defaultImage: Image = defaultImage();
      service.getRecipeMasterById = jest.fn().mockReturnValue(undefined);

      service.getPublicAuthorByRecipeId('')
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
            console.log(`Error in `, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get user as author if user is recipe master\'s owner', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.owner = _mockUser._id;
      service.getRecipeMasterById = jest.fn()
        .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));
      service.userService.getUser = jest.fn()
        .mockReturnValue(new BehaviorSubject<User>(_mockUser));
      service.idService.hasId = jest.fn().mockReturnValue(true);

      service.getPublicAuthorByRecipeId('')
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
            console.log(`Error in 'should get user as author if user is recipe master\'s owner'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get missing author is recipe master does not have a server id', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.owner = 'other';
      delete _mockRecipeMasterActive._id;
      const _defaultImage: Image = defaultImage();
      service.getRecipeMasterById = jest.fn()
        .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));
      service.userService.getUser = jest.fn()
        .mockReturnValue(new BehaviorSubject<User>(_mockUser));
      service.idService.hasId = jest.fn().mockReturnValue(false);
      service.idService.hasDefaultIdType = jest.fn().mockReturnValue(true);

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
            console.log('Error in: should get missing author is recipe master does not have a server id', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get default author on http request error response', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.owner = 'other';
      const _defaultImage: Image = defaultImage();
      service.getRecipeMasterById = jest.fn()
        .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));
      service.userService.getUser = jest.fn()
        .mockReturnValue(new BehaviorSubject<User>(_mockUser));
      service.idService.hasId = jest.fn().mockReturnValue(false);
      service.idService.hasDefaultIdType = jest.fn().mockReturnValue(true);

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
            console.log(`Error in 'should get default author on http request error response'`, error);
            expect(true).toBe(false);
          }
        );
      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/public/master/${_mockRecipeMasterActive._id}/author`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, mockErrorResponse(404, 'not found'));
    });

    test('should get default author on any error not already covered', (done: jest.DoneCallback): void => {
      const _defaultImage: Image = defaultImage();
      service.getRecipeMasterById = jest.fn()
        .mockImplementation(() => { throw new Error('unknown error'); });

      service.getPublicAuthorByRecipeId('')
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
            console.log(`Error in 'should get default author on any error not already covered'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should fetch public recipe master', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.errorReporter.handleGenericCatchError = jest.fn();

      service.getPublicRecipeMasterById(_mockRecipeMasterActive._id)
        .subscribe(
          (recipeMaster: RecipeMaster): void => {
            expect(recipeMaster).toStrictEqual(_mockRecipeMasterActive);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should fetch public recipe master'`, error);
            expect(true).toBe(false);
          }
        );
      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/public/master/${_mockRecipeMasterActive._id}`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(_mockRecipeMasterActive);
    });

    test('should get an error fetching public recipe master', (done: jest.DoneCallback): void => {
      let handledError: boolean = false;
      service.errorReporter.handleGenericCatchError = jest.fn()
        .mockReturnValue((): Observable<never> => {
          handledError = true;
          return throwError(null);
        });

      service.getPublicRecipeMasterById('test-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toBeNull();
            expect(handledError).toBe(true);
            done();
          }
        );
      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/public/master/test-id`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, mockErrorResponse(404, 'not found'));
    });

    test('should fetch a list of public recipe masters by user', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list: RecipeMaster[] = [ _mockRecipeMasterActive, _mockRecipeMasterInactive ];
      service.errorReporter.handleGenericCatchError = jest.fn();

      service.getPublicRecipeMasterListByUser('user-id')
        .subscribe(
          (recipeList: RecipeMaster[]): void => {
            expect(recipeList).toStrictEqual(list);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should fetch a list of public recipe masters by user'`, error);
            expect(true).toBe(false);
          }
        );
      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/public/user-id`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(list);
    });

    test('should get an error trying to get a list of public recipe masters by user', (done: jest.DoneCallback): void => {
      let handledError: boolean = false;
      service.errorReporter.handleGenericCatchError = jest.fn()
        .mockReturnValue((): Observable<never> => {
          handledError = true;
          return throwError(null);
        });

      service.getPublicRecipeMasterListByUser('user-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toBeNull();
            expect(handledError).toBe(true);
            done();
          }
        );
      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/public/user-id`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, mockErrorResponse(404, 'not found'));
    });

    test('should fetch a public recipe variant', (done: jest.DoneCallback): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      service.errorReporter.handleGenericCatchError = jest.fn();

      service.getPublicRecipeVariantById('master-id', 'variant-id')
        .subscribe(
          (recipeVariant: RecipeVariant): void => {
            expect(recipeVariant).toStrictEqual(_mockRecipeVariantComplete);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should fetch a public recipe variant'`, error);
            expect(true).toBe(false);
          }
        );

      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/public/master/master-id/variant/variant-id`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(_mockRecipeVariantComplete);
    });

    test('should get an error trying to fetch a public recipe variant', (done: jest.DoneCallback): void => {
      let handledError: boolean = false;
      service.errorReporter.handleGenericCatchError = jest.fn()
        .mockReturnValue((): Observable<never> => {
          handledError = true;
          return throwError(null);
        });

      service.getPublicRecipeVariantById('master-id', 'variant-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toBeNull();
            expect(handledError).toBe(true);
            done();
          }
        );
      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/public/master/master-id/variant/variant-id`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, mockErrorResponse(404, 'not found'));
    });

  });


  describe('Private API', (): void => {

    test('should create a new recipe master', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockImage: Image = mockImage();
      service.formatNewRecipeMaster = jest.fn().mockReturnValue(_mockRecipeMasterActive);
      service.imageService.storeImageToLocalDir = jest.fn().mockReturnValue(of(_mockImage));
      service.addRecipeMasterToList = jest.fn().mockReturnValue(of(_mockRecipeMasterActive));
      service.errorReporter.handleGenericCatchError = jest.fn();
      const requestSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');

      service.createRecipeMaster({})
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should create a new recipe master'`, error);
            expect(true).toBe(false);
          }
        );

      service.createRecipeMaster({})
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should create a new recipe master'`, error);
            expect(true).toBe(false);
          }
        );

      setTimeout((): void => {
        expect(requestSpy).toHaveBeenCalledWith('post', _mockRecipeMasterActive);
        expect(syncSpy).toHaveBeenCalledWith('create', _mockRecipeMasterActive.cid);
        done();
      }, 10);
    });

    test('should get an error trying to create a recipe master', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      let handledError: boolean = false;
      service.formatNewRecipeMaster = jest.fn()
        .mockImplementation((): Error => {
          throw _mockError;
        });
      service.errorReporter.handleGenericCatchError = jest.fn()
        .mockReturnValue((): Observable<never> => {
          handledError = true;
          return throwError(null);
        });

      service.createRecipeMaster({})
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toBeNull();
            expect(handledError).toBe(true);
            done();
          }
        );
    });

    test('should create a recipe variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();
      service.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.setRecipeIds = jest.fn();
      service.addRecipeVariantToMasterInList = jest.fn()
        .mockReturnValue(of(_mockRecipeVariantIncomplete));
      service.errorReporter.handleGenericCatchError = jest.fn();
      const requestSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');

      service.createRecipeVariant('master-id', _mockRecipeVariantIncomplete)
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should create a recipe variant'`, error);
            expect(true).toBe(false);
          }
        );

      service.createRecipeVariant('master-id', _mockRecipeVariantIncomplete)
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should create a recipe variant'`, error);
            expect(true).toBe(false);
          }
        );

      setTimeout((): void => {
        expect(requestSpy).toHaveBeenCalledWith('post', _mockRecipeMasterActive, _mockRecipeVariantIncomplete);
        expect(syncSpy).toHaveBeenCalledWith('update', 'master-id');
        done();
      }, 10);
    });

    test('should get an error creating a recipe variant if recipe master not found', (done: jest.DoneCallback): void => {
      service.getRecipeMasterById = jest.fn().mockReturnValue(undefined);

      service.createRecipeVariant('master-id', null)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch('An error occurred trying to create new variant: missing source recipe Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should remove recipe master', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      service.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.removeRecipeMasterFromList = jest.fn().mockReturnValue(of(true));
      service.imageService.hasDefaultImage = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      service.imageService.deleteLocalImage = jest.fn().mockReturnValue(of(null));
      service.canSendRequest = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      service.requestInBackground = jest.fn();
      service.addSyncFlag = jest.fn();
      service.errorReporter.handleGenericCatchError = jest.fn();
      const requestSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');

      service.removeRecipeMasterById('master-id')
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should remove recipe master'`, error);
            expect(true).toBe(false);
          }
        );

      service.removeRecipeMasterById('master-id')
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should remove recipe master'`, error);
            expect(true).toBe(false);
          }
        );

      setTimeout((): void => {
        expect(requestSpy).toHaveBeenCalledWith('delete', _mockRecipeMasterActive);
        expect(syncSpy).toHaveBeenCalledWith('delete', 'master-id');
        done();
      }, 10);
    });

    test('should get an error removing a recipe master that is missing', (done: jest.DoneCallback): void => {
      service.getRecipeMasterById = jest.fn().mockReturnValue(undefined);

      service.removeRecipeMasterById('master-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch('An error occurred trying to remove recipe master: missing recipe Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should remove a recipe variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();
      service.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.removeRecipeFromMasterInList = jest.fn().mockReturnValue(of(true));
      service.idService.hasId = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);
      service.errorReporter.handleGenericCatchError = jest.fn();
      const requestSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');

      service.removeRecipeVariantById('master-id', _mockRecipeVariantIncomplete._id)
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should remove a recipe variant'`, error);
            expect(true).toBe(false);
          }
        );

      service.removeRecipeVariantById('master-id', _mockRecipeVariantIncomplete._id)
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should remove a recipe variant'`, error);
            expect(true).toBe(false);
          }
        );

      setTimeout((): void => {
        expect(requestSpy).toHaveBeenCalledWith('delete', _mockRecipeMasterActive, _mockRecipeVariantIncomplete);
        expect(syncSpy).toHaveBeenCalledWith('update', 'master-id');
        done();
      }, 10);
    });

    test('should get an error trying to remove a recipe variant with a missing master', (done: jest.DoneCallback): void => {
      service.getRecipeMasterById = jest.fn().mockReturnValue(undefined);

      service.removeRecipeVariantById('master-id', 'variant-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch('An error occurred trying to remove variant: missing source recipe Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should get an error trying to remove a recipe variant with a missing variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const _mockRecipeMasterInactive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive);
      service.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterInactive$);

      service.removeRecipeVariantById('master-id', 'variant-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch('An error occurred trying to remove variant: missing variant Recipe variant with id variant-id not found');
            done();
          }
        );
    });

    test('should update a recipe master', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.labelImage.hasPending = true;
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockUpdatedRecipe: RecipeMaster = mockRecipeMasterActive();
      _mockUpdatedRecipe.name = 'updated name';
      const _mockUpdatedRecipe$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockUpdatedRecipe);
      const _mockImage: Image = mockImage();
      service.getRecipeMasterById = jest.fn()
        .mockReturnValueOnce(_mockRecipeMasterActive$)
        .mockReturnValueOnce(_mockUpdatedRecipe$);
      service.imageService.isTempImage = jest.fn().mockReturnValue(false);
      service.imageService.storeImageToLocalDir = jest.fn().mockReturnValue(of(_mockImage));
      service.updateRecipeMasterInList = jest.fn().mockReturnValue(of(_mockUpdatedRecipe));
      service.errorReporter.handleGenericCatchError = jest.fn();
      const requestSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');
      const storeSpy: jest.SpyInstance = jest.spyOn(service.imageService, 'storeImageToLocalDir');

      service.updateRecipeMasterById('master-id', { labelImage: _mockRecipeMasterActive.labelImage })
        .subscribe(
          (updated1: RecipeMaster): void => {
            expect(storeSpy).toHaveBeenCalledWith(_mockRecipeMasterActive.labelImage, _mockRecipeMasterActive.labelImage.filePath);
            expect(updated1).toStrictEqual(_mockUpdatedRecipe);
          },
          (error: any): void => {
            console.log(`Error in 'should update a recipe master'`, error);
            expect(true).toBe(false);
          }
        );

      service.updateRecipeMasterById('master-id', { name: 'updated name' })
        .subscribe(
          (updated2: RecipeMaster): void => {
            expect(updated2).toStrictEqual(_mockUpdatedRecipe);
          },
          (error: any): void => {
            console.log(`Error in 'should update a recipe master'`, error);
            expect(true).toBe(false);
          }
        );

      setTimeout((): void => {
        expect(requestSpy).toHaveBeenCalledWith('patch', _mockRecipeMasterActive);
        expect(syncSpy).toHaveBeenCalledWith('update', 'master-id');
        done();
      }, 10);
    });

    test('should get an error trying to update a recipe master', (done: jest.DoneCallback): void => {
      service.getRecipeMasterById = jest.fn().mockReturnValue(undefined);

      service.updateRecipeMasterById('master-id', {})
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch('An error occurred trying to update recipe: missing recipe master Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should update a recipe variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();
      service.updateRecipeVariantOfMasterInList = jest.fn()
        .mockReturnValue(of(_mockRecipeVariantIncomplete));
      service.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.errorReporter.handleGenericCatchError = jest.fn();
      const requestSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');

      service.updateRecipeVariantById('master-id', 'variant-id', {})
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should update a recipe variant'`, error);
            expect(true).toBe(false);
          }
        );

      service.updateRecipeVariantById('master-id', 'variant-id', {})
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should update a recipe variant'`, error);
            expect(true).toBe(false);
          }
        );

      setTimeout((): void => {
        expect(requestSpy).toHaveBeenCalledWith('patch', _mockRecipeMasterActive, _mockRecipeVariantIncomplete);
        expect(syncSpy).toHaveBeenCalledWith('update', 'master-id');
        done();
      }, 10);
    });

    test('should get an error after updating variant but before updating server due to missing master', (done: jest.DoneCallback): void => {
      service.getRecipeMasterById = jest.fn().mockReturnValue(undefined);
      service.errorReporter.handleGenericCatchError = jest.fn()
        .mockReturnValue((error: any): Observable<never> => throwError(error));
      service.updateRecipeVariantOfMasterInList = jest.fn().mockReturnValue(of(null));

      service.updateRecipeVariantById('master-id', 'variant-id', {})
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error.message).toMatch('An error occurred trying to update variant: missing recipe master Recipe master with id master-id not found');
            done();
          }
        );
    });

  });


  describe('Background Server Update Methods', (): void => {

    test('should handle errors when configuring a background request', (done: jest.DoneCallback): void => {
      service.getBackgroundRequest = jest.fn()
        .mockReturnValue(throwError(mockErrorResponse(404, 'not found')));
      service.errorReporter.handleGenericCatchError = jest.fn()
        .mockReturnValue((): Observable<never> => {
          return throwError(null);
        });
      let checkCount = 0;

      service.configureBackgroundRequest<RecipeMaster>('method', false, null, null)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toBeNull();
            checkCount++;
          }
        );

      service.configureBackgroundRequest<RecipeVariant>('method', true, null, null)
        .subscribe(
          (resolvedError: HttpErrorResponse): void => {
            expect(resolvedError.status).toEqual(404);
            expect(resolvedError.statusText).toMatch('not found');
            checkCount++;
          },
          (error: any): void => {
            console.log(`Error in 'should handle errors when configuring a background request'`, error);
            expect(true).toBe(false);
          }
        );

      setTimeout((): void => {
        expect(checkCount).toEqual(2);
        done();
      }, 10);
    });

    test('should get a background post request', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.labelImage.hasPending = true;
      const _mockImageRequestMetadata: ImageRequestMetadata = mockImageRequestMetadata({
        name: 'label-image'
      });
      service.imageService.blobbifyImages = jest.fn().mockReturnValue(of([_mockImageRequestMetadata]));
      const blobSpy: jest.SpyInstance = jest.spyOn(service.imageService, 'blobbifyImages');

      service.getBackgroundRequest<RecipeMaster>('post', _mockRecipeMasterActive)
        .subscribe(
          (response: RecipeMaster): void => {
            expect(response).toStrictEqual(_mockRecipeMasterActive);
            expect(blobSpy).toHaveBeenCalledWith([{
              image: _mockRecipeMasterActive.labelImage,
              name: 'labelImage'
            }]);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get a background post request'`, error);
            expect(true).toBe(false);
          }
        );

      const postReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/private`);
      expect(postReq.request.method).toMatch('POST');
      expect(postReq.request.body instanceof FormData);
      expect(postReq.request.body.has('recipeMaster')).toBe(true);
      expect(postReq.request.body.has('label-image')).toBe(true);
      postReq.flush(_mockRecipeMasterActive);
    });

    test('should get a background patch request', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      service.imageService.blobbifyImages = jest.fn().mockReturnValue(of([]));
      const blobSpy: jest.SpyInstance = jest.spyOn(service.imageService, 'blobbifyImages');

      service.getBackgroundRequest<RecipeVariant>('patch', _mockRecipeMasterActive, _mockRecipeVariantComplete)
        .subscribe(
          (response: RecipeVariant): void => {
            expect(response).toStrictEqual(_mockRecipeVariantComplete);
            expect(blobSpy).toHaveBeenCalledWith([]);
            done();
          },
          (error: any): void => {
            console.log(`Error in `, error);
            expect(true).toBe(false);
          }
        );

      const patchReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/private/master/${_mockRecipeMasterActive._id}/variant/${_mockRecipeVariantComplete._id}`);
      expect(patchReq.request.method).toMatch('PATCH');
      expect(patchReq.request.body instanceof FormData);
      expect(patchReq.request.body.has('recipeVariant')).toBe(true);
      expect(patchReq.request.body.has('label-image')).not.toBe(true);
      patchReq.flush(_mockRecipeVariantComplete);
    });

    test('should get a background delete request', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      forkJoin(
        service.getBackgroundRequest<RecipeMaster>('delete', _mockRecipeMasterActive),
        service.getBackgroundRequest<RecipeVariant>('delete', _mockRecipeMasterActive, _mockRecipeVariantComplete),
        service.getBackgroundRequest<RecipeVariant>('delete', null, null, 'delete-id')
      )
      .subscribe(
        ([ resMaster, resVariant, resId ]: [ RecipeMaster, RecipeVariant, any ]): void => {
          expect(resMaster).toStrictEqual(_mockRecipeMasterActive);
          expect(resVariant).toStrictEqual(_mockRecipeVariantComplete);
          expect(resId).toBeNull();
          done();
        },
        (error: any): void => {
          console.log(`Error in (master)'should get a background delete request'`, error);
          expect(true).toBe(false);
        }
      );
      const masterReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/private/master/${_mockRecipeMasterActive._id}`);
      expect(masterReq.request.method).toMatch('DELETE');
      masterReq.flush(_mockRecipeMasterActive);
      const variantReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/private/master/${_mockRecipeMasterActive._id}/variant/${_mockRecipeVariantComplete._id}`);
      expect(variantReq.request.method).toMatch('DELETE');
      variantReq.flush(_mockRecipeVariantComplete);
      const idReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/private/master/delete-id`);
      expect(idReq.request.method).toMatch('DELETE');
      idReq.flush(null);
    });

    test('should get an error trying to get a background request with invalid method', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      service.getBackgroundRequest<RecipeVariant>('invalid', _mockRecipeMasterActive)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.name).toMatch('HttpRequestError');
            expect(error.message).toMatch('Invalid http method: invalid');
            expect(error.severity).toEqual(2);
            expect(error.message).toMatch('Invalid http method: invalid');
            done();
          }
        );
    });

    test('should handle a background update response', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      service.updateRecipeMasterInList = jest.fn().mockReturnValue(of(_mockRecipeMasterActive));
      service.updateRecipeVariantOfMasterInList = jest.fn()
        .mockReturnValue(of(_mockRecipeVariantComplete));
      const masterSpy: jest.SpyInstance = jest.spyOn(service, 'updateRecipeMasterInList');
      const variantSpy: jest.SpyInstance = jest.spyOn(service, 'updateRecipeVariantOfMasterInList');

      forkJoin(
        service.handleBackgroundUpdateResponse('master-id', null, _mockRecipeMasterActive, 'create'),
        service.handleBackgroundUpdateResponse('master-id', 'variant-id', _mockRecipeVariantComplete, 'update'),
        service.handleBackgroundUpdateResponse('master-id', null, _mockRecipeMasterActive, 'delete')
      )
      .subscribe(
        ([ masterRes, variantRes, deleteRes ]: [ RecipeMaster, RecipeVariant, any ]): void => {
          expect(masterRes).toStrictEqual(_mockRecipeMasterActive);
          expect(variantRes).toStrictEqual(_mockRecipeVariantComplete);
          expect(deleteRes).toBeNull();
          expect(masterSpy).toHaveBeenCalledWith('master-id', _mockRecipeMasterActive);
          expect(variantSpy).toHaveBeenCalledWith('master-id', 'variant-id', _mockRecipeVariantComplete);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should handle a background update response'`, error);
          expect(true).toBe(false);
        }
      );
    });

    test('should make a post request in background', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.requestInBackground = originalRequest;
      service.getBackgroundRequest = jest.fn().mockReturnValue(of(_mockRecipeMasterActive));
      service.handleBackgroundUpdateResponse = jest.fn().mockReturnValue(of(_mockRecipeMasterActive));
      service.errorReporter.handleGenericCatchError = jest.fn();
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.requestInBackground('post', _mockRecipeMasterActive);

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Recipe: background post request successful');
        done();
      }, 10);
    });

    test('should make a patch request in background', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      service.requestInBackground = originalRequest;
      service.getBackgroundRequest = jest.fn().mockReturnValue(of(_mockRecipeVariantComplete));
      service.handleBackgroundUpdateResponse = jest.fn()
        .mockReturnValue(of(_mockRecipeVariantComplete));
      service.errorReporter.handleGenericCatchError = jest.fn();
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.requestInBackground('patch', _mockRecipeMasterActive, _mockRecipeVariantComplete);

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Recipe: background patch request successful');
        done();
      }, 10);
    });

    test('should make a delete request in background', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.requestInBackground = originalRequest;
      service.getBackgroundRequest = jest.fn().mockReturnValue(of(_mockRecipeMasterActive));
      service.handleBackgroundUpdateResponse = jest.fn().mockReturnValue(of(_mockRecipeMasterActive));
      service.errorReporter.handleGenericCatchError = jest.fn();
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.requestInBackground('delete', _mockRecipeMasterActive);

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Recipe: background delete request successful');
        done();
      }, 10);
    });

    test('should get an error making an invalid request in background', (done: jest.DoneCallback): void => {
      service.requestInBackground = originalRequest;
      service.errorReporter.handleGenericCatchError = jest.fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => {
            expect(error.message).toMatch('Unknown sync type: invalid');
            return throwError(null);
          };
        });
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.requestInBackground('invalid', null);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(null);
        done();
      });
    });

    test('should get an http error making a request in background', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'not found', `${BASE_URL}/${API_VERSION}`);
      service.requestInBackground = originalRequest;
      service.getBackgroundRequest = jest.fn().mockReturnValue(throwError(_mockHttpError));
      service.errorReporter.handleGenericCatchError = jest.fn()
        .mockImplementation((): (error: HttpErrorResponse) => Observable<never> => {
          return (error: HttpErrorResponse): Observable<never> => {
            expect(error).toStrictEqual(_mockHttpError);
            return throwError(null);
          };
        });
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.requestInBackground('post', _mockRecipeMasterActive);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(null);
        done();
      });
    });

  });


  describe('Sync Methods', (): void => {

    test('should add a sync flag', (): void => {
      service.addSyncFlag = originalSync;
      service.syncService.addSyncFlag = jest.fn();
      const syncSpy: jest.SpyInstance = jest.spyOn(service.syncService, 'addSyncFlag');

      service.addSyncFlag('method', 'docId');

      expect(syncSpy).toHaveBeenCalledWith({
        method: 'method',
        docId: 'docId',
        docType: 'recipe'
      });
    });

    test('should dismiss sync errors', (): void => {
      const _mockSyncError: SyncError = mockSyncError();
      service.syncErrors = [ _mockSyncError ];

      service.dismissAllSyncErrors();

      expect(service.syncErrors.length).toEqual(0);
    });

    test('should dismiss sync errors', (): void => {
      const _mockSyncError1: SyncError = mockSyncError();
      const _mockSyncError2: SyncError = mockSyncError();
      _mockSyncError2.message = 'error 2';
      const _mockSyncError3: SyncError = mockSyncError();
      _mockSyncError3.message = 'error 3';
      service.syncErrors = [ _mockSyncError1, _mockSyncError2, _mockSyncError3 ];

      service.dismissSyncError(1);

      expect(service.syncErrors.length).toEqual(2);
      expect(service.syncErrors[1]).toStrictEqual(_mockSyncError3);
    });

    test('should generate sync requests successfully', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.owner = 'a1b2c3';
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeMasterNeedsUser: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterNeedsUser.owner = '0123456789012';
      const _mockRecipeMasterNeedsUser$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterNeedsUser);
      service.syncService.getSyncFlagsByType = jest.fn()
        .mockReturnValue([
          mockSyncMetadata('delete', _mockRecipeMasterActive.cid, 'recipe'),
          mockSyncMetadata('create', _mockRecipeMasterNeedsUser.cid, 'recipe'),
          mockSyncMetadata('update', _mockRecipeMasterActive.cid, 'recipe')
        ]);
      service.getRecipeMasterById = jest.fn()
        .mockReturnValueOnce(_mockRecipeMasterActive$)
        .mockReturnValueOnce(_mockRecipeMasterNeedsUser$)
        .mockReturnValueOnce(_mockRecipeMasterActive$);
      service.userService.getUser = jest.fn().mockReturnValue(_mockUser$);
      service.configureBackgroundRequest = jest.fn()
        .mockReturnValueOnce(of(_mockRecipeMasterActive))
        .mockReturnValueOnce(of(_mockRecipeMasterNeedsUser))
        .mockReturnValueOnce(of(_mockRecipeMasterActive));
      service.idService.hasDefaultIdType = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      service.idService.isMissingServerId = jest.fn().mockReturnValue(false);

      const syncRequests: SyncRequests<RecipeMaster> = service.generateSyncRequests();

      const requests: Observable<HttpErrorResponse | RecipeMaster | SyncData<RecipeMaster>>[] = syncRequests.syncRequests;
      const errors: SyncError[] = syncRequests.syncErrors;
      expect(requests.length).toEqual(3);
      expect(errors.length).toEqual(0);
      forkJoin(requests)
        .subscribe(
          ([deleteSync, createSync, updateSync]: RecipeMaster[]): void => {
            expect(deleteSync).toStrictEqual(_mockRecipeMasterActive);
            expect(createSync.owner).toMatch(_mockUser._id);
            expect(updateSync).toStrictEqual(_mockRecipeMasterActive);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should generate sync requests successfully'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should generate sync request with errors', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeMasterNoUser: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterNoUser.owner = '2109876543210';
      const _mockRecipeMasterNoUser$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterNoUser);
      const _mockRecipeMasterMissingServerId: RecipeMaster = mockRecipeMasterActive();
      delete _mockRecipeMasterMissingServerId._id;
      const _mockRecipeMasterMissingServerId$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterMissingServerId);
      service.syncService.getSyncFlagsByType = jest.fn()
        .mockReturnValue([
          mockSyncMetadata('create', 'not-found-id', 'recipe'),
          mockSyncMetadata('create', _mockRecipeMasterNoUser.cid, 'recipe'),
          mockSyncMetadata('update', _mockRecipeMasterMissingServerId.cid, 'recipe'),
          mockSyncMetadata('invalid', _mockRecipeMasterActive.cid, 'recipe')
        ]);
      service.getRecipeMasterById = jest.fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(_mockRecipeMasterNoUser$)
        .mockReturnValueOnce(_mockRecipeMasterMissingServerId$)
        .mockReturnValueOnce(_mockRecipeMasterActive$);
      service.syncService.constructSyncError = jest.fn()
        .mockImplementation((errMsg: string): SyncError => {
          return { errCode: 1, message: errMsg };
        });
      service.userService.getUser = jest.fn().mockReturnValue(undefined);
      service.idService.hasDefaultIdType = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      service.idService.isMissingServerId = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const syncRequests: SyncRequests<RecipeMaster> = service.generateSyncRequests();

      const requests: Observable<HttpErrorResponse | RecipeMaster | SyncData<RecipeMaster>>[] = syncRequests.syncRequests;
      const errors: SyncError[] = syncRequests.syncErrors;
      expect(requests.length).toEqual(0);
      expect(errors.length).toEqual(4);
      expect(errors[0].message).toMatch('Sync error: Recipe master with id \'not-found-id\' not found');
      expect(errors[1].message).toMatch('Sync error: Cannot get recipe owner\'s id');
      expect(errors[2].message).toMatch(`Recipe with id: ${_mockRecipeMasterMissingServerId.cid} is missing its server id`);
      expect(errors[3].message).toMatch('Sync error: Unknown sync flag method \'invalid\'');
    });

    test('should process sync successes', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockUpdate: RecipeMaster = mockRecipeMasterActive();
      _mockUpdate.name = 'updated';
      service.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.emitListUpdate = jest.fn();
      const syncData: (RecipeMaster | SyncData<RecipeMaster>)[] = [
        _mockUpdate,
        { isDeleted: true, data: null }
      ];

      service.processSyncSuccess(syncData);

      expect(_mockRecipeMasterActive$.value.name).toMatch('updated');
    });

    test('should get error handling sync success', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.getRecipeMasterById = jest.fn().mockReturnValue(undefined);
      service.emitListUpdate = jest.fn();

      service.processSyncSuccess([_mockRecipeMasterActive]);

      expect(service.syncErrors[0]['message']).toMatch(`Sync error: recipe with id: '${_mockRecipeMasterActive.cid}' not found`);
    });

    test('should sync on connection (not login)', (done: jest.DoneCallback): void => {
      const _mockSyncResponse: SyncResponse<RecipeMaster> = mockSyncResponse<RecipeMaster>();
      const preError: SyncError = mockSyncError();
      preError.message = 'pre-error';
      const responseError: SyncError = mockSyncError();
      responseError.message = 'response-error';
      _mockSyncResponse.errors.push(responseError);
      service.userService.isLoggedIn = jest.fn().mockReturnValue(true);
      service.generateSyncRequests = jest.fn()
        .mockReturnValue({ syncRequests: [], syncErrors: [ preError ] });
      service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
      service.processSyncSuccess = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.errorReporter.handleGenericCatchError = jest.fn();
      const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateRecipeStorage');

      service.syncOnConnection(false)
        .subscribe(
          (): void => {
            expect(processSpy).toHaveBeenCalled();
            expect(updateSpy).toHaveBeenCalled();
            expect(service.syncErrors.length).toEqual(2);
            expect(service.syncErrors[0]).toStrictEqual(responseError);
            expect(service.syncErrors[1]).toStrictEqual(preError);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should perform sync on connection (not login)'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should perform sync on connection (on login)', (done: jest.DoneCallback): void => {
      const _mockSyncResponse: SyncResponse<RecipeMaster> = mockSyncResponse<RecipeMaster>();
      service.userService.isLoggedIn = jest.fn().mockReturnValue(true);
      service.generateSyncRequests = jest.fn()
        .mockReturnValue({ syncRequests: [], syncErrors: [] });
      service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
      service.processSyncSuccess = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.errorReporter.handleGenericCatchError = jest.fn();
      const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateRecipeStorage');

      service.syncOnConnection(true)
        .subscribe(
          (): void => {
            expect(processSpy).not.toHaveBeenCalled();
            expect(updateSpy).not.toHaveBeenCalled();
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should perform sync on connection (on login)'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should not sync on reconnect if not logged in', (done: jest.DoneCallback): void => {
      service.userService.isLoggedIn = jest.fn().mockReturnValue(false);
      const genSpy: jest.SpyInstance = jest.spyOn(service, 'generateSyncRequests');

      service.syncOnConnection(false)
        .subscribe(
          (): void => {
            expect(genSpy).not.toHaveBeenCalled();
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should not sync on reconnect if not logged in'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should sync on reconnect', (): void => {
      const _mockSubject: Subject<any> = new Subject<any>();
      const _mockError: Error = new Error('test-error');
      service.syncOnConnection = jest.fn().mockReturnValue(_mockSubject);
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const customSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.syncOnReconnect();

      _mockSubject.next();
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('sync on reconnect complete');
      _mockSubject.error(_mockError);
      expect(customSpy).toHaveBeenCalledWith(_mockError);
    });

    test('should sync on signup', (done: jest.DoneCallback): void => {
      const _mockSyncResponse: SyncResponse<RecipeMaster> = mockSyncResponse<RecipeMaster>();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([_mockRecipeMasterActive$]);
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
      service.getMasterList = jest.fn().mockReturnValue(_mockRecipeList$);
      service.userService.getUser = jest.fn().mockReturnValue(_mockUser$);
      service.configureBackgroundRequest = jest.fn().mockReturnValue(of(_mockRecipeMasterActive));
      service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
      service.event.emit = jest.fn();
      service.processSyncSuccess = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.errorReporter.handleGenericCatchError = jest.fn();
      const processSpy: jest.SpyInstance = jest.spyOn(service, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(service, 'updateRecipeStorage');
      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');

      service.syncOnSignup();

      setTimeout((): void => {
        expect(processSpy).toHaveBeenCalled();
        expect(updateSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith('sync-batches-on-signup');
        done();
      }, 10);
    });

    test('should get error syncing on signup', (): void => {
      const _mockSubject: Subject<any> = new Subject<any>();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([_mockRecipeMasterActive$]);
      const _mockSyncResponse: SyncResponse<RecipeMaster> = mockSyncResponse<RecipeMaster>();
      _mockSyncResponse.errors.push({ errCode: 1, message: 'Sync error: Cannot get recipe owner\'s id' });
      service.getMasterList = jest.fn().mockReturnValue(_mockRecipeList$);
      service.userService.getUser = jest.fn().mockReturnValue(undefined);
      service.syncService.sync = jest.fn().mockReturnValue(_mockSubject);
      service.errorReporter.handleGenericCatchError = jest.fn()
        .mockReturnValue((): Observable<never> => {
          return throwError(null);
        });
      const customSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');
      const emitSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');

      service.syncOnSignup();

      _mockSubject.error(_mockSyncResponse);
      expect(customSpy).toHaveBeenCalledWith(null);
      expect(emitSpy).toHaveBeenCalledWith('sync-batches-on-signup');
    });

  });


  describe('Utility Methods', (): void => {

    test('should add a recipe master to list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);
      service.getMasterList = jest.fn().mockReturnValue(list$);
      service.updateRecipeStorage = jest.fn();

      service.addRecipeMasterToList(_mockRecipeMasterActive)
        .subscribe(
          (): void => {
            expect(list$.value.length).toEqual(1);
            expect(list$.value[0].value).toStrictEqual(_mockRecipeMasterActive);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should add a recipe master to list'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should add a recipe variant to a master in list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();
      _mockRecipeVariantIncomplete.isMaster = true;
      service.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.setRecipeAsMaster = jest.fn();
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.idService.getId = jest.fn().mockReturnValue('');
      expect(_mockRecipeMasterActive$.value.variants.length).toEqual(2);

      service.addRecipeVariantToMasterInList(_mockRecipeMasterActive.cid, _mockRecipeVariantIncomplete)
        .subscribe(
          (): void => {
            expect(_mockRecipeMasterActive$.value.variants.length).toEqual(3);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should add a recipe variant to a master in list'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error adding a recipe variant to missing master', (done: jest.DoneCallback): void => {
      service.getRecipeMasterById = jest.fn().mockReturnValue(undefined);

      service.addRecipeVariantToMasterInList('master-id', null)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch('An error occurred trying to add a new variant to its master: missing recipe master Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should check if a request can be sent', (): void => {
      service.canSendRequest = originalCan;
      service.connectionService.isConnected = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      service.userService.isLoggedIn = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      service.idService.hasDefaultIdType = jest.fn().mockReturnValue(false);

      expect(service.canSendRequest(['1a2b3c4d5e', '6f7g8h9i10j'])).toBe(true);
      expect(service.canSendRequest()).toBe(false);
    });

    test('should format a new recipe master', (): void => {
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockStyle: Style = mockStyles()[0];
      const _defaultImage: Image = defaultImage();
      const masterValues: object = {
        name: 'test-name',
        style: _mockStyle,
        notes: [],
        labelImage: _defaultImage
      };
      service.userService.getUser = jest.fn().mockReturnValue(_mockUser$);
      service.idService.getNewId = jest.fn().mockReturnValue('219876543210');
      service.setRecipeIds = jest.fn();
      service.idService.getId = jest.fn().mockReturnValue('test-id');

      const formatted: RecipeMaster = service.formatNewRecipeMaster({
        master: masterValues,
        variant: _mockRecipeVariantComplete
      });

      expect(formatted).toStrictEqual({
        cid: '219876543210',
        name: masterValues['name'],
        style: masterValues['style'],
        notes: masterValues['notes'],
        master: _mockRecipeVariantComplete.cid,
        owner: _mockUser._id,
        isPublic: false,
        isFriendsOnly: false,
        variants: [ _mockRecipeVariantComplete ],
        labelImage: masterValues['labelImage']
      });
    });

    test('should get an error formatting a recipe with a missing user id', (): void => {
      const _mockUser: User = mockUser();
      delete _mockUser.cid;
      delete _mockUser._id;
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
      service.userService.getUser = jest.fn().mockReturnValue(_mockUser$);
      service.idService.getId = jest.fn().mockReturnValue(undefined);
      const _mockError: CustomError = new CustomError(
        'RecipeError',
        'Client Validation Error: Missing User ID',
        2,
        'Client Validation Error: Missing User ID'
      );

      expect((): void => {
        service.formatNewRecipeMaster({});
      })
      .toThrow(_mockError);
    });

    test('should clear recipes', (): void => {
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive),
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive)
      ]);
      service.getMasterList = jest.fn().mockReturnValue(list$);
      service.storageService.removeRecipes();

      expect(list$.value.length).toEqual(2);

      service.clearRecipes();

      expect(list$.value.length).toEqual(0);
    });

    test('should update list subject', (): void => {
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);
      service.getMasterList = jest.fn().mockReturnValue(list$);
      const nextSpy: jest.SpyInstance = jest.spyOn(list$, 'next');

      service.emitListUpdate();

      expect(nextSpy).toHaveBeenCalled();
    });

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

    test('should get a custom error for a missing recipe', (): void => {
      service.getMissingError = originalMissingError;
      const message: string = 'test-message';
      const additional: string = 'test-additional';
      const customError: CustomError = <CustomError>service.getMissingError(message, additional);
      expect(customError.name).toMatch('RecipeError');
      expect(customError.message).toMatch('test-message test-additional');
      expect(customError.severity).toEqual(2);
      expect(customError.userMessage).toMatch('test-message');
    });

    test('should get a recipe master by id', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive),
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive)
      ]);
      service.getMasterList = jest.fn().mockReturnValue(list$);
      service.idService.hasId = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValue(false);

      expect(service.getRecipeMasterById(_mockRecipeMasterInactive.cid).value).toStrictEqual(_mockRecipeMasterInactive);
      expect(service.getRecipeMasterById('not-found')).toBeUndefined();
    });

    test('should get the master list', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      service.recipeMasterList$ = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive),
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive)
      ]);

      expect(service.getMasterList().value[0].value).toStrictEqual(_mockRecipeMasterActive);
      expect(service.getMasterList().value[1].value).toStrictEqual(_mockRecipeMasterInactive);
    });

    test('should get a recipe variant by id', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      service.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.idService.hasId = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      forkJoin(
        service.getRecipeVariantById(_mockRecipeMasterActive.cid, _mockRecipeVariantComplete.cid),
        service.getRecipeVariantById(_mockRecipeMasterActive.cid, 'variant-id')
      )
      .subscribe(
        ([variant, und]: RecipeVariant[]): void => {
          expect(variant).toStrictEqual(_mockRecipeVariantComplete);
          expect(und).toBeUndefined();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should get a recipe variant by id'`, error);
          expect(true).toBe(false);
        }
      );
    });

    test('should get an error trying to get a recipe variant with missing master', (done: jest.DoneCallback): void => {
      service.getRecipeMasterById = jest.fn().mockReturnValue(undefined);

      service.getRecipeVariantById('master-id', 'variant-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get reults', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch('An error occurred trying to get variant by id: missing recipe master Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should check if a recipe has a process', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();

      expect(service.isRecipeProcessPresent(_mockRecipeVariantComplete)).toBe(true);
      expect(service.isRecipeProcessPresent(_mockRecipeVariantIncomplete)).toBe(false);
    });

    test('should map an array of recipe masters to an array of master subjects', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);
      service.getMasterList = jest.fn().mockReturnValue(list$);
      service.utilService.toSubjectArray = jest.fn()
        .mockReturnValue([
          new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive),
          new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive)
        ]);

      service.mapRecipeMasterArrayToSubjects([_mockRecipeMasterActive, _mockRecipeMasterInactive]);

      const newList: BehaviorSubject<RecipeMaster>[] = list$.value;
      expect(newList.length).toEqual(2);
      expect(newList[0].value).toStrictEqual(_mockRecipeMasterActive);
      expect(newList[1].value).toStrictEqual(_mockRecipeMasterInactive);
    });

    test('should remove a recipe variant from a master in list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      service.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.removeRecipeAsMaster = jest.fn();
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.idService.getIndexById = jest.fn().mockReturnValue(0);
      expect(_mockRecipeMasterActive.variants.length).toEqual(2);
      expect(_mockRecipeMasterActive.variants.find((variant: RecipeVariant): boolean => variant.cid === _mockRecipeVariantComplete.cid)).toBeDefined();

      service.removeRecipeFromMasterInList(_mockRecipeMasterActive.cid, _mockRecipeVariantComplete.cid)
        .subscribe(
          (): void => {
            expect(_mockRecipeMasterActive.variants.length).toEqual(1);
            expect(_mockRecipeMasterActive.variants.find((variant: RecipeVariant): boolean => variant.cid === _mockRecipeVariantComplete.cid)).toBeUndefined();
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should remove a recipe variant from a master in list'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error trying to remove a recipe variant with a missing master', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.getRecipeMasterById = jest.fn().mockReturnValue(undefined);
      service.getMissingError = jest.fn().mockReturnValue(_mockError);
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getMissingError');

      service.removeRecipeFromMasterInList('master-id', 'variant-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error).toStrictEqual(_mockError);
            expect(errorSpy).toHaveBeenCalledWith(
              'An error occurred trying to remove variant from recipe master: missing recipe master',
              'Recipe master with id master-id not found'
            );
            done();
          }
        );
    });

    test('should get an error trying to remove a recipe variant from master in list with a missing variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      service.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.idService.getIndexById = jest.fn().mockReturnValue(-1);

      service.removeRecipeFromMasterInList('master-id', 'variant-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch(
              'An error occurred trying to remove variant from recipe master: missing recipe variant Recipe variant with id variant-id from master with id master-id not found'
            );
            done();
          }
        );
    });

    test('should remove a recipe master from list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive),
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive)
      ]);
      service.getMasterList = jest.fn().mockReturnValue(list$);
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.idService.getIndexById = jest.fn().mockReturnValue(1);

      service.removeRecipeMasterFromList(_mockRecipeMasterInactive.cid)
        .subscribe(
          (): void => {
            const newList: BehaviorSubject<RecipeMaster>[] = list$.value;
            expect(newList.length).toEqual(1);
            expect(newList.find((_master$: BehaviorSubject<RecipeMaster>): boolean => _master$.value.cid === _mockRecipeMasterInactive.cid)).toBeUndefined();
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should remove a recipe master from list'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error trying to remove a recipe master if master is not found', (done: jest.DoneCallback): void => {
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);
      service.getMasterList = jest.fn().mockReturnValue(list$);
      service.idService.getIndexById = jest.fn().mockReturnValue(-1);

      service.removeRecipeMasterFromList('master-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch(
              'An error occurred trying to remove recipe master from list: missing recipe master Recipe master with id master-id not found',
            );
            done();
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
      service.idService.getNewId = jest
        .fn()
        .mockImplementation((): string => `${id++}`);

      service.setRecipeNestedIds<Process>(_mockProcessSchedule);

      _mockProcessSchedule.forEach((process: Process, index: number): void => {
        expect(process.cid).toMatch(`${index}`);
      });
    });

    test('should updat recipe storage', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive),
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive)
      ]);
      service.storageService.setRecipes = jest.fn().mockReturnValue(of({}));
      service.getMasterList = jest.fn().mockReturnValue(list$);
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storageService, 'setRecipes');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.updateRecipeStorage();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith([_mockRecipeMasterActive, _mockRecipeMasterInactive]);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('stored recipes');
        done();
      }, 10);
    });

    test('should get an error trying to update recipe storage', (): void => {
      const _mockError: Error = new Error('test-error');
      const _mockSubject: Subject<any> = new Subject<any>();
      service.storageService.setRecipes = jest.fn().mockReturnValue(_mockSubject);
      service.getMasterList = jest.fn().mockReturnValue(new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]));
      service.errorReporter.handleUnhandledError = jest.fn();
      const customSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.updateRecipeStorage();

      _mockSubject.error(_mockError);

      expect(customSpy).toHaveBeenCalledWith(_mockError);
    });

    test('should update a recipe master in list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const _mockRecipeMasterInactive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive);
      const _mockUpdate: RecipeMaster = mockRecipeMasterInactive();
      _mockUpdate.name = 'updated';
      service.getRecipeMasterById = jest.fn().mockReturnValue(_mockRecipeMasterInactive$);
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();

      service.updateRecipeMasterInList(_mockRecipeMasterInactive.cid, _mockUpdate)
        .subscribe(
          (updated: RecipeMaster): void => {
            expect(updated.name).toMatch('updated');
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should update a recipe master in list'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error trying to update a recipe master in list if missing', (done: jest.DoneCallback): void => {
      service.getRecipeMasterById = jest.fn().mockReturnValue(undefined);

      service.updateRecipeMasterInList('master-id', null)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch(
              'An error occurred trying to update recipe master: missing recipe master Recipe master with id master-id not found'
            );
            done();
          }
        );
    });

    test('should update a variant of master in list (select master)', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();
      _mockRecipeVariantIncomplete.variantName = 'update';
      _mockRecipeVariantIncomplete.isMaster = true;
      service.getRecipeMasterById  = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.setRecipeAsMaster = jest.fn();
      service.removeRecipeAsMaster = jest.fn();
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.idService.getIndexById = jest.fn().mockReturnValue(1);
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setRecipeAsMaster');

      service.updateRecipeVariantOfMasterInList(_mockRecipeMasterActive.cid, _mockRecipeVariantIncomplete.cid, _mockRecipeVariantIncomplete)
        .subscribe(
          (variant: RecipeVariant): void => {
            expect(setSpy).toHaveBeenCalled();
            expect(variant.variantName).toMatch('update');
            expect(_mockRecipeMasterActive$.value.variants[1].variantName).toMatch('update');
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should update a variant of master in list'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should update a variant of master in list (deselect master)', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      _mockRecipeVariantComplete.isMaster = false;
      service.getRecipeMasterById  = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.setRecipeAsMaster = jest.fn();
      service.removeRecipeAsMaster = jest.fn();
      service.emitListUpdate = jest.fn();
      service.updateRecipeStorage = jest.fn();
      service.idService.getIndexById = jest.fn().mockReturnValue(0);
      const removeSpy: jest.SpyInstance = jest.spyOn(service, 'removeRecipeAsMaster');

      service.updateRecipeVariantOfMasterInList(_mockRecipeMasterActive.cid, _mockRecipeVariantComplete.cid, _mockRecipeVariantComplete)
        .subscribe(
          (variant: RecipeVariant): void => {
            expect(removeSpy).toHaveBeenCalled();
            expect(variant.isMaster).toBe(false);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should update a variant of master in list'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error updating a recipe variant with missing master', (done: jest.DoneCallback): void => {
      service.getRecipeMasterById = jest.fn().mockReturnValue(undefined);

      service.updateRecipeVariantOfMasterInList('master-id', 'variant-id', {})
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch(
              'An error occurred trying to update variant from recipe master: missing recipe master Recipe master with id master-id not found',
            );
            done();
          }
        );
    });

    test('should get an error updating a missing recipe variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      service.getRecipeMasterById  = jest.fn().mockReturnValue(_mockRecipeMasterActive$);
      service.idService.getIndexById = jest.fn().mockReturnValue(-1);

      service.updateRecipeVariantOfMasterInList(_mockRecipeMasterActive.cid, 'variant-id', {})
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch(
              `An error occurred trying to update variant from recipe master: missing recipe variant Recipe variant with id variant-id from master with id ${_mockRecipeMasterActive.cid} not found`
            );
            done();
          }
        );
    });

  });


  describe('Type Guard', (): void => {

    test('should check recipe type safety', (): void => {
      service.checkTypeSafety = originalCheck;
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

});
