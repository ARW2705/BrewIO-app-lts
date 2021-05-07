/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, forkJoin, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAuthor, mockHopsSchedule, mockOtherIngredients, mockImage, mockImageRequestMetadata, mockRecipeMasterActive, mockRecipeMasterInactive, mockRecipeVariantComplete, mockRecipeVariantIncomplete, mockErrorResponse, mockProcessSchedule, mockStyles, mockUser, mockSyncError, mockSyncMetadata, mockSyncResponse } from '../../../../test-config/mock-models';
import { ClientIdServiceStub, ConnectionServiceStub, EventServiceStub, HttpErrorServiceStub, ImageServiceStub, StorageServiceStub, SyncServiceStub, ToastServiceStub, UserServiceStub } from '../../../../test-config/service-stubs';

/* Constants imports */
import { API_VERSION } from '../../shared/constants/api-version';
import { BASE_URL } from '../../shared/constants/base-url';

/* Interface imports */
import { Author } from '../../shared/interfaces/author';
import { HopsSchedule } from '../../shared/interfaces/hops-schedule';
import { Image, ImageRequestMetadata } from '../../shared/interfaces/image';
import { OtherIngredients } from '../../shared/interfaces/other-ingredients';
import { Process } from '../../shared/interfaces/process';
import { RecipeMaster } from '../../shared/interfaces/recipe-master';
import { RecipeVariant } from '../../shared/interfaces/recipe-variant';
import { Style } from '../../shared/interfaces/library';
import { SyncData, SyncError, SyncRequests, SyncResponse } from '../../shared/interfaces/sync';
import { User } from '../../shared/interfaces/user';

/* Default imports */
import { defaultImage } from '../../shared/defaults/default-image';

/* Service imports */
import { RecipeService } from './recipe.service';
import { ClientIdService } from '../client-id/client-id.service';
import { ConnectionService } from '../connection/connection.service';
import { EventService } from '../event/event.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { ImageService } from '../image/image.service';
import { StorageService } from '../storage/storage.service';
import { SyncService } from '../sync/sync.service';
import { ToastService } from '../toast/toast.service';
import { UserService } from '../user/user.service';


describe('RecipeService', (): void => {
  let injector: TestBed;
  let recipeService: RecipeService;
  let httpMock: HttpTestingController;
  let originalRegister: any;
  let originalRequest: any;
  let originalSync: any;
  let originalCan: any;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        RecipeService,
        { provide: ClientIdService, useClass: ClientIdServiceStub },
        { provide: ConnectionService, useClass: ConnectionServiceStub },
        { provide: EventService, useClass: EventServiceStub },
        { provide: HttpErrorService, useClass: HttpErrorServiceStub },
        { provide: ImageService, useClass: ImageServiceStub },
        { provide: StorageService, useClass: StorageServiceStub },
        { provide: SyncService, useClass: SyncServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UserService, useClass: UserServiceStub }
      ]
    });
    injector = getTestBed();
    recipeService = injector.get(RecipeService);
    originalRegister = recipeService.registerEvents;
    originalRequest = recipeService.requestInBackground;
    originalSync = recipeService.addSyncFlag;
    originalCan = recipeService.canSendRequest;
  }));

  beforeEach((): void => {
    injector = getTestBed();
    recipeService = injector.get(RecipeService);
    recipeService.registerEvents = jest
      .fn();
    recipeService.httpError.handleError = jest
      .fn()
      .mockImplementation((error: HttpErrorResponse): Observable<never> => {
        return throwError(`<${error.status}> ${error.statusText}`);
      });
    recipeService.requestInBackground = jest
      .fn();
    recipeService.addSyncFlag = jest
      .fn();
    recipeService.canSendRequest = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    expect(recipeService).toBeDefined();
  });


  describe('Initializations', (): void => {

    test('should initialize from server', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipeService.syncOnConnection = jest
        .fn()
        .mockReturnValue(of(true));

      recipeService.mapRecipeMasterArrayToSubjects = jest
        .fn();

      recipeService.updateRecipeStorage = jest
        .fn();

      recipeService.event.emit = jest
        .fn();

      const emitSpy: jest.SpyInstance = jest.spyOn(recipeService.event, 'emit');
      const mapSpy: jest.SpyInstance = jest.spyOn(recipeService, 'mapRecipeMasterArrayToSubjects');
      const updateSpy: jest.SpyInstance = jest.spyOn(recipeService, 'updateRecipeStorage');

      recipeService.initFromServer();

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
      recipeService.syncOnConnection = jest
        .fn()
        .mockReturnValue(of(true));

      recipeService.event.emit = jest
        .fn();

      const emitSpy: jest.SpyInstance = jest.spyOn(recipeService.event, 'emit');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      recipeService.initFromServer();

      setTimeout((): void => {
        expect(emitSpy).toHaveBeenCalledWith('init-batches');
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Initialization message: <404> not found');
        done();
      }, 10);

      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/private`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, mockErrorResponse(404, 'not found'));
    });

    test('should init from storage', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActiveList: RecipeMaster[] = [mockRecipeMasterActive()];

      recipeService.storageService.getRecipes = jest
        .fn()
        .mockReturnValue(of(_mockRecipeMasterActiveList));

      recipeService.mapRecipeMasterArrayToSubjects = jest
        .fn();

      const mapSpy: jest.SpyInstance = jest.spyOn(recipeService, 'mapRecipeMasterArrayToSubjects');

      recipeService.initFromStorage();

      setTimeout((): void => {
        expect(mapSpy).toHaveBeenCalledWith(_mockRecipeMasterActiveList);
        done();
      }, 10);
    });

    test('should get an error trying to init from storage', (done: jest.DoneCallback): void => {
      recipeService.storageService.getRecipes = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      recipeService.initFromStorage();

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('test-error: awaiting data from server');
        done();
      }, 10);
    });

    test('should initialize recipe list', (): void => {
      recipeService.initFromStorage = jest
        .fn();

      recipeService.initFromServer = jest
        .fn();

      recipeService.event.emit = jest
        .fn();

      const storeSpy: jest.SpyInstance = jest.spyOn(recipeService, 'initFromStorage');
      const serverSpy: jest.SpyInstance = jest.spyOn(recipeService, 'initFromServer');
      const emitSpy: jest.SpyInstance = jest.spyOn(recipeService.event, 'emit');

      recipeService.initializeRecipeMasterList();

      expect(storeSpy).toHaveBeenCalled();
      expect(serverSpy).toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalled();

      recipeService.initializeRecipeMasterList();

      expect(serverSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalled();
    });

    test('should register events', (): void => {
      const mockSubjects: Subject<object>[] = Array.from(Array(4), () => new Subject<object>());

      let counter = 0;
      recipeService.event.register = jest
        .fn()
        .mockImplementation(() => mockSubjects[counter++]);

      recipeService.initializeRecipeMasterList = jest
        .fn();

      recipeService.clearRecipes = jest
        .fn();

      recipeService.syncOnSignup = jest
        .fn();

      recipeService.syncOnReconnect = jest
        .fn();

      const spies: jest.SpyInstance[] = [
        jest.spyOn(recipeService, 'initializeRecipeMasterList'),
        jest.spyOn(recipeService, 'clearRecipes'),
        jest.spyOn(recipeService, 'syncOnSignup'),
        jest.spyOn(recipeService, 'syncOnReconnect')
      ];

      const eventSpy: jest.SpyInstance = jest.spyOn(recipeService.event, 'register');

      recipeService.registerEvents = originalRegister;

      recipeService.registerEvents();

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

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));

      recipeService.userService.getUser = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<User>(_mockUser));

      recipeService.getPublicAuthorByRecipeId('0123456789012')
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

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      recipeService.getPublicAuthorByRecipeId('')
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

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));

      recipeService.userService.getUser = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<User>(_mockUser));

      recipeService.getPublicAuthorByRecipeId('')
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

    test('should get an error getting public author due to missing recipe id', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.owner = 'other';
      delete _mockRecipeMasterActive._id;

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));

      recipeService.userService.getUser = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<User>(_mockUser));

      recipeService.getPublicAuthorByRecipeId('0123456789012')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Missing server id');
            done();
          }
        );
    });

    test('should get default author on http request error response', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      _mockRecipeMasterActive.owner = 'other';
      const _defaultImage: Image = defaultImage();

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive));

      recipeService.userService.getUser = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<User>(_mockUser));

      recipeService.getPublicAuthorByRecipeId('0123456789012')
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

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockImplementation(() => { throw new Error('unknown error'); });

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      recipeService.getPublicAuthorByRecipeId('')
        .subscribe(
          (author: Author): void => {
            expect(author).toStrictEqual({
              username: 'Not Found',
              userImage: _defaultImage,
              breweryLabelImage: _defaultImage
            });
            const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
            expect(consoleCalls[0]).toMatch('Error finding recipe');
            expect(consoleCalls[1].message).toMatch('unknown error');
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

      recipeService.getPublicRecipeMasterById(_mockRecipeMasterActive._id)
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
      recipeService.getPublicRecipeMasterById('test-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('<404> not found');
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

      recipeService.getPublicRecipeMasterListByUser('user-id')
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
      recipeService.getPublicRecipeMasterListByUser('user-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('<404> not found');
            done();
          }
        );

      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/recipes/public/user-id`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, mockErrorResponse(404, 'not found'));
    });

    test('should fetch a public recipe variant', (done: jest.DoneCallback): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      recipeService.getPublicRecipeVariantById('master-id', 'variant-id')
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
      recipeService.getPublicRecipeVariantById('master-id', 'variant-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('<404> not found');
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

      recipeService.formatNewRecipeMaster = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive);

      recipeService.imageService.storeImageToLocalDir = jest
        .fn()
        .mockReturnValue(of(_mockImage));

      recipeService.addRecipeMasterToList = jest
        .fn()
        .mockReturnValue(of(_mockRecipeMasterActive));

      const requestSpy: jest.SpyInstance = jest.spyOn(recipeService, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(recipeService, 'addSyncFlag');

      recipeService.createRecipeMaster({})
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should create a new recipe master'`, error);
            expect(true).toBe(false);
          }
        );

      recipeService.createRecipeMaster({})
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

    test('should get an error tyring to create a recipe master', (done: jest.DoneCallback): void => {
      recipeService.formatNewRecipeMaster = jest
        .fn()
        .mockImplementation((): Error => {
          throw new Error('test-error');
        });

      recipeService.createRecipeMaster({})
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('test-error');
            done();
          }
        );
    });

    test('should create a recipe variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      recipeService.setRecipeIds = jest
        .fn();

      recipeService.addRecipeVariantToMasterInList = jest
        .fn()
        .mockReturnValue(of(_mockRecipeVariantIncomplete));

      const requestSpy: jest.SpyInstance = jest.spyOn(recipeService, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(recipeService, 'addSyncFlag');

      recipeService.createRecipeVariant('master-id', _mockRecipeVariantIncomplete)
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should create a recipe variant'`, error);
            expect(true).toBe(false);
          }
        );

      recipeService.createRecipeVariant('master-id', _mockRecipeVariantIncomplete)
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
      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      recipeService.createRecipeVariant('master-id', null)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should remove recipe master', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      recipeService.removeRecipeMasterFromList = jest
        .fn()
        .mockReturnValue(of(true));

      recipeService.imageService.hasDefaultImage = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      recipeService.imageService.deleteLocalImage = jest
        .fn()
        .mockReturnValue(of(null));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const requestSpy: jest.SpyInstance = jest.spyOn(recipeService, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(recipeService, 'addSyncFlag');

      recipeService.removeRecipeMasterById('master-id')
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should remove recipe master'`, error);
            expect(true).toBe(false);
          }
        );

      recipeService.removeRecipeMasterById('master-id')
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should remove recipe master'`, error);
            expect(true).toBe(false);
          }
        );

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('image deletion');
        expect(requestSpy).toHaveBeenCalledWith('delete', _mockRecipeMasterActive);
        expect(syncSpy).toHaveBeenCalledWith('delete', 'master-id');
        done();
      }, 10);
    });

    test('should get an error removing a recipe master that is missing', (done: jest.DoneCallback): void => {
      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      recipeService.removeRecipeMasterById('master-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Master recipe not found');
            done();
          }
        );
    });

    test('should remove a recipe variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      recipeService.removeRecipeFromMasterInList = jest
        .fn()
        .mockReturnValue(of(true));

      const requestSpy: jest.SpyInstance = jest.spyOn(recipeService, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(recipeService, 'addSyncFlag');

      recipeService.removeRecipeVariantById('master-id', _mockRecipeVariantIncomplete._id)
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should remove a recipe variant'`, error);
            expect(true).toBe(false);
          }
        );

      recipeService.removeRecipeVariantById('master-id', _mockRecipeVariantIncomplete._id)
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

    test('should get an error trying to remove a recipe variant', (done: jest.DoneCallback): void => {
      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      recipeService.removeRecipeVariantById('master-id', 'variant-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Variant\'s master recipe not found');
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

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValueOnce(_mockRecipeMasterActive$)
        .mockReturnValueOnce(_mockUpdatedRecipe$);

      recipeService.imageService.isTempImage = jest
        .fn()
        .mockReturnValue(false);

      recipeService.imageService.storeImageToLocalDir = jest
        .fn()
        .mockReturnValue(of(_mockImage));

      recipeService.updateRecipeMasterInList = jest
        .fn()
        .mockReturnValue(of(_mockUpdatedRecipe));

      const requestSpy: jest.SpyInstance = jest.spyOn(recipeService, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(recipeService, 'addSyncFlag');
      const storeSpy: jest.SpyInstance = jest.spyOn(recipeService.imageService, 'storeImageToLocalDir');

      recipeService.updateRecipeMasterById('master-id', { labelImage: _mockRecipeMasterActive.labelImage })
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

      recipeService.updateRecipeMasterById('master-id', { name: 'updated name' })
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
      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      recipeService.updateRecipeMasterById('master-id', {})
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Update error: Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should update a recipe variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();

      recipeService.updateRecipeVariantOfMasterInList = jest
        .fn()
        .mockReturnValue(of(_mockRecipeVariantIncomplete));

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      const requestSpy: jest.SpyInstance = jest.spyOn(recipeService, 'requestInBackground');
      const syncSpy: jest.SpyInstance = jest.spyOn(recipeService, 'addSyncFlag');

      recipeService.updateRecipeVariantById('master-id', 'variant-id', {})
        .subscribe(
          (): void => {},
          (error: any): void => {
            console.log(`Error in 'should update a recipe variant'`, error);
            expect(true).toBe(false);
          }
        );

      recipeService.updateRecipeVariantById('master-id', 'variant-id', {})
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

  });


  describe('Background Server Update Methods', (): void => {

    test('should handle errors when configuring a background request', (done: jest.DoneCallback): void => {
      recipeService.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(throwError(mockErrorResponse(404, 'not found')));

      let checkCount = 0;

      recipeService.configureBackgroundRequest<RecipeMaster>('method', false, null, null)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('<404> not found');
            checkCount++;
          }
        );

      recipeService.configureBackgroundRequest<RecipeVariant>('method', true, null, null)
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

      recipeService.imageService.blobbifyImages = jest
        .fn()
        .mockReturnValue(of([_mockImageRequestMetadata]));

      const blobSpy: jest.SpyInstance = jest.spyOn(recipeService.imageService, 'blobbifyImages');

      recipeService.getBackgroundRequest<RecipeMaster>('post', _mockRecipeMasterActive)
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

      recipeService.imageService.blobbifyImages = jest
        .fn()
        .mockReturnValue(of([]));

      const blobSpy: jest.SpyInstance = jest.spyOn(recipeService.imageService, 'blobbifyImages');

      recipeService.getBackgroundRequest<RecipeVariant>('patch', _mockRecipeMasterActive, _mockRecipeVariantComplete)
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
        recipeService.getBackgroundRequest<RecipeMaster>('delete', _mockRecipeMasterActive),
        recipeService.getBackgroundRequest<RecipeVariant>('delete', _mockRecipeMasterActive, _mockRecipeVariantComplete),
        recipeService.getBackgroundRequest<RecipeVariant>('delete', null, null, 'delete-id')
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

      recipeService.imageService.blobbifyImages = jest
        .fn()
        .mockReturnValue(of([]));

      const blobSpy: jest.SpyInstance = jest.spyOn(recipeService.imageService, 'blobbifyImages');

      recipeService.getBackgroundRequest<RecipeVariant>('invalid', _mockRecipeMasterActive)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Invalid http method');
            expect(blobSpy).toHaveBeenCalledWith([]);
            done();
          }
        );
    });

    test('should handle a background update response', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      recipeService.updateRecipeMasterInList = jest
        .fn()
        .mockReturnValue(of(_mockRecipeMasterActive));

      recipeService.updateRecipeVariantOfMasterInList = jest
        .fn()
        .mockReturnValue(of(_mockRecipeVariantComplete));

      const masterSpy: jest.SpyInstance = jest.spyOn(recipeService, 'updateRecipeMasterInList');
      const variantSpy: jest.SpyInstance = jest.spyOn(recipeService, 'updateRecipeVariantOfMasterInList');

      forkJoin(
        recipeService.handleBackgroundUpdateResponse('master-id', null, _mockRecipeMasterActive),
        recipeService.handleBackgroundUpdateResponse('master-id', 'variant-id', _mockRecipeVariantComplete)
      )
      .subscribe(
        ([ masterRes, variantRes ]: [ RecipeMaster, RecipeVariant ]): void => {
          expect(masterRes).toStrictEqual(_mockRecipeMasterActive);
          expect(variantRes).toStrictEqual(_mockRecipeVariantComplete);
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

      recipeService.requestInBackground = originalRequest;

      recipeService.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(of(_mockRecipeMasterActive));

      recipeService.handleBackgroundUpdateResponse = jest
        .fn()
        .mockReturnValue(of(_mockRecipeMasterActive));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      recipeService.requestInBackground('post', _mockRecipeMasterActive);

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Recipe: background post request successful');
        done();
      }, 10);
    });

    test('should make a patch request in background', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      recipeService.requestInBackground = originalRequest;

      recipeService.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(of(_mockRecipeVariantComplete));

      recipeService.handleBackgroundUpdateResponse = jest
        .fn()
        .mockReturnValue(of(_mockRecipeVariantComplete));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      recipeService.requestInBackground('patch', _mockRecipeMasterActive, _mockRecipeVariantComplete);

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Recipe: background patch request successful');
        done();
      }, 10);
    });

    test('should make a patch request in background', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipeService.requestInBackground = originalRequest;

      recipeService.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(of(_mockRecipeMasterActive));

      recipeService.handleBackgroundUpdateResponse = jest
        .fn()
        .mockReturnValue(of(_mockRecipeMasterActive));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      recipeService.requestInBackground('delete', _mockRecipeMasterActive);

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Recipe: background delete request successful');
        done();
      }, 10);
    });

    test('should get an error making an invalid request in background', (done: jest.DoneCallback): void => {
      recipeService.requestInBackground = originalRequest;

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const toastSpy: jest.SpyInstance = jest.spyOn(recipeService.toastService, 'presentErrorToast');

      recipeService.requestInBackground('invalid', null);

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Recipe: background invalid request error');
        expect(toastSpy).toHaveBeenCalledWith('Recipe: update failed to save to server');
        done();
      }, 10);
    });

    test('should get an http error making a request in background', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipeService.requestInBackground = originalRequest;

      recipeService.getBackgroundRequest = jest
        .fn()
        .mockReturnValue(throwError(mockErrorResponse(404, 'not found')));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const toastSpy: jest.SpyInstance = jest.spyOn(recipeService.toastService, 'presentErrorToast');

      recipeService.requestInBackground('post', _mockRecipeMasterActive);

      setTimeout((): void => {
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('Recipe: background post request error');
        expect(consoleCalls[1]).toMatch('<404> not found');
        expect(toastSpy).toHaveBeenCalledWith('Recipe: update failed to save to server');
        done();
      }, 10);
    });

  });


  describe('Sync Methods', (): void => {

    test('should add a sync flag', (): void => {
      recipeService.addSyncFlag = originalSync;

      recipeService.syncService.addSyncFlag = jest
        .fn();

      const syncSpy: jest.SpyInstance = jest.spyOn(recipeService.syncService, 'addSyncFlag');

      recipeService.addSyncFlag('method', 'docId');

      expect(syncSpy).toHaveBeenCalledWith({
        method: 'method',
        docId: 'docId',
        docType: 'recipe'
      });
    });

    test('should dismiss sync errors', (): void => {
      const _mockSyncError: SyncError = mockSyncError();

      recipeService.syncErrors = [ _mockSyncError ];

      recipeService.dismissAllSyncErrors();

      expect(recipeService.syncErrors.length).toEqual(0);
    });

    test('should dismiss sync errors', (): void => {
      const _mockSyncError1: SyncError = mockSyncError();
      const _mockSyncError2: SyncError = mockSyncError();
      _mockSyncError2.message = 'error 2';
      const _mockSyncError3: SyncError = mockSyncError();
      _mockSyncError3.message = 'error 3';

      recipeService.syncErrors = [ _mockSyncError1, _mockSyncError2, _mockSyncError3 ];

      recipeService.dismissSyncError(1);

      expect(recipeService.syncErrors.length).toEqual(2);
      expect(recipeService.syncErrors[1]).toStrictEqual(_mockSyncError3);
    });

    test('should dismiss sync errors', (): void => {
      const _mockSyncError1: SyncError = mockSyncError();
      const _mockSyncError2: SyncError = mockSyncError();
      const _mockSyncError3: SyncError = mockSyncError();

      recipeService.syncErrors = [ _mockSyncError1, _mockSyncError2, _mockSyncError3 ];

      expect((): void => {
        recipeService.dismissSyncError(3);
      })
      .toThrowError('Invalid sync error index');

      expect((): void => {
        recipeService.dismissSyncError(-1);
      })
      .toThrowError('Invalid sync error index');
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

      recipeService.syncService.getSyncFlagsByType = jest
        .fn()
        .mockReturnValue([
          mockSyncMetadata('delete', _mockRecipeMasterActive.cid, 'recipe'),
          mockSyncMetadata('create', _mockRecipeMasterNeedsUser.cid, 'recipe'),
          mockSyncMetadata('update', _mockRecipeMasterActive.cid, 'recipe')
        ]);

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValueOnce(_mockRecipeMasterActive$)
        .mockReturnValueOnce(_mockRecipeMasterNeedsUser$)
        .mockReturnValueOnce(_mockRecipeMasterActive$);

      recipeService.userService.getUser = jest
        .fn()
        .mockReturnValue(_mockUser$);

      recipeService.configureBackgroundRequest = jest
        .fn()
        .mockReturnValueOnce(of(_mockRecipeMasterActive))
        .mockReturnValueOnce(of(_mockRecipeMasterNeedsUser))
        .mockReturnValueOnce(of(_mockRecipeMasterActive));

      const syncRequests: SyncRequests<RecipeMaster> = recipeService.generateSyncRequests();
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

      recipeService.syncService.getSyncFlagsByType = jest
        .fn()
        .mockReturnValue([
          mockSyncMetadata('create', 'not-found-id', 'recipe'),
          mockSyncMetadata('create', _mockRecipeMasterNoUser.cid, 'recipe'),
          mockSyncMetadata('update', _mockRecipeMasterMissingServerId.cid, 'recipe'),
          mockSyncMetadata('invalid', _mockRecipeMasterActive.cid, 'recipe')
        ]);

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(_mockRecipeMasterNoUser$)
        .mockReturnValueOnce(_mockRecipeMasterMissingServerId$)
        .mockReturnValueOnce(_mockRecipeMasterActive$);

      recipeService.syncService.constructSyncError = jest
        .fn()
        .mockImplementation((errMsg: string): SyncError => {
          return { errCode: 1, message: errMsg };
        });

      recipeService.userService.getUser = jest
        .fn()
        .mockReturnValue(undefined);

      const syncRequests: SyncRequests<RecipeMaster> = recipeService.generateSyncRequests();
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

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      recipeService.emitListUpdate = jest
        .fn();

      const syncData: (RecipeMaster | SyncData<RecipeMaster>)[] = [
        _mockUpdate,
        { isDeleted: true, data: null }
      ];

      recipeService.processSyncSuccess(syncData);

      expect(_mockRecipeMasterActive$.value.name).toMatch('updated');
    });

    test('should get error handling sync success', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      recipeService.emitListUpdate = jest
        .fn();

      recipeService.processSyncSuccess([_mockRecipeMasterActive]);

      expect(recipeService.syncErrors[0]['message']).toMatch(`Sync error: recipe with id: '${_mockRecipeMasterActive.cid}' not found`);
    });

    test('should sync on connection (not login)', (done: jest.DoneCallback): void => {
      const _mockSyncResponse: SyncResponse<RecipeMaster> = mockSyncResponse<RecipeMaster>();
      const preError: SyncError = mockSyncError();
      preError.message = 'pre-error';
      const responseError: SyncError = mockSyncError();
      responseError.message = 'response-error';
      _mockSyncResponse.errors.push(responseError);

      recipeService.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(true);

      recipeService.generateSyncRequests = jest
        .fn()
        .mockReturnValue({ syncRequests: [], syncErrors: [ preError ] });

      recipeService.syncService.sync = jest
        .fn()
        .mockReturnValue(of(_mockSyncResponse));

      recipeService.processSyncSuccess = jest
        .fn();

      recipeService.updateRecipeStorage = jest
        .fn();

      const processSpy: jest.SpyInstance = jest.spyOn(recipeService, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(recipeService, 'updateRecipeStorage');

      recipeService.syncOnConnection(false)
        .subscribe(
          (): void => {
            expect(processSpy).toHaveBeenCalled();
            expect(updateSpy).toHaveBeenCalled();
            expect(recipeService.syncErrors.length).toEqual(2);
            expect(recipeService.syncErrors[0]).toStrictEqual(responseError);
            expect(recipeService.syncErrors[1]).toStrictEqual(preError);
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

      recipeService.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(true);

      recipeService.generateSyncRequests = jest
        .fn()
        .mockReturnValue({ syncRequests: [], syncErrors: [] });

      recipeService.syncService.sync = jest
        .fn()
        .mockReturnValue(of(_mockSyncResponse));

      recipeService.processSyncSuccess = jest
        .fn();

      recipeService.updateRecipeStorage = jest
        .fn();

      const processSpy: jest.SpyInstance = jest.spyOn(recipeService, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(recipeService, 'updateRecipeStorage');

      recipeService.syncOnConnection(true)
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
      recipeService.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(false);

      const genSpy: jest.SpyInstance = jest.spyOn(recipeService, 'generateSyncRequests');

      recipeService.syncOnConnection(false)
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

    test('should sync on reconnect', (done: jest.DoneCallback): void => {
      recipeService.syncOnConnection = jest
        .fn()
        .mockReturnValueOnce(of({}))
        .mockReturnValueOnce(throwError('test-error'));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const toastSpy: jest.SpyInstance = jest.spyOn(recipeService.toastService, 'presentErrorToast');

      recipeService.syncOnReconnect();

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).not.toMatch('Reconnect sync error');

        recipeService.syncOnReconnect();

        setTimeout((): void => {
          expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('test-error: error on reconnect sync');
          expect(toastSpy).toHaveBeenCalledWith('Error syncing recipes with server');
          done();
        }, 10);
      }, 10);
    });

    test('should sync on signup', (done: jest.DoneCallback): void => {
      const _mockSyncResponse: SyncResponse<RecipeMaster> = mockSyncResponse<RecipeMaster>();
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([_mockRecipeMasterActive$]);
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);

      recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(_mockRecipeList$);

      recipeService.userService.getUser = jest
        .fn()
        .mockReturnValue(_mockUser$);

      recipeService.configureBackgroundRequest = jest
        .fn()
        .mockReturnValue(of(_mockRecipeMasterActive));

      recipeService.syncService.sync = jest
        .fn()
        .mockReturnValue(of(_mockSyncResponse));

      recipeService.event.emit = jest
        .fn();

      recipeService.processSyncSuccess = jest
        .fn();

      recipeService.updateRecipeStorage = jest
        .fn();

      const processSpy: jest.SpyInstance = jest.spyOn(recipeService, 'processSyncSuccess');
      const updateSpy: jest.SpyInstance = jest.spyOn(recipeService, 'updateRecipeStorage');
      const emitSpy: jest.SpyInstance = jest.spyOn(recipeService.event, 'emit');

      recipeService.syncOnSignup();

      setTimeout((): void => {
        expect(processSpy).toHaveBeenCalled();
        expect(updateSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith('sync-batches-on-signup');
        done();
      }, 10);
    });

    test('should get error syncing on signup', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeList$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([_mockRecipeMasterActive$]);
      const _mockSyncResponse: SyncResponse<RecipeMaster> = mockSyncResponse<RecipeMaster>();
      _mockSyncResponse.errors.push({ errCode: 1, message: 'Sync error: Cannot get recipe owner\'s id' });

      recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(_mockRecipeList$);

      recipeService.userService.getUser = jest
        .fn()
        .mockReturnValue(undefined);

      recipeService.syncService.sync = jest
        .fn()
        .mockReturnValue(throwError(_mockSyncResponse));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const emitSpy: jest.SpyInstance = jest.spyOn(recipeService.event, 'emit');

      recipeService.syncOnSignup();

      setTimeout((): void => {
        const consoleCall: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCall[0]).toMatch('Recipe sync error; continuing other sync events');
        expect(consoleCall[1]['errors'][0]['message']).toMatch('Sync error: Cannot get recipe owner\'s id');
        expect(emitSpy).toHaveBeenCalledWith('sync-batches-on-signup');
        done();
      }, 10);
    });

  });


  describe('Utility Methods', (): void => {

    test('should add a recipe master to list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);

      recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(list$);

      recipeService.updateRecipeStorage = jest
        .fn();

      recipeService.addRecipeMasterToList(_mockRecipeMasterActive)
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

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      recipeService.setRecipeAsMaster = jest
        .fn();

      recipeService.emitListUpdate = jest
        .fn();

      recipeService.updateRecipeStorage = jest
        .fn();

      expect(_mockRecipeMasterActive$.value.variants.length).toEqual(2);

      recipeService.addRecipeVariantToMasterInList(_mockRecipeMasterActive.cid, _mockRecipeVariantIncomplete)
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
      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      recipeService.addRecipeVariantToMasterInList('master-id', null)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should check if a request can be sent', (): void => {
      recipeService.canSendRequest = originalCan;

      recipeService.connectionService.isConnected = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      recipeService.userService.isLoggedIn = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      expect(recipeService.canSendRequest(['1a2b3c4d5e', '6f7g8h9i10j'])).toBe(true);
      expect(recipeService.canSendRequest()).toBe(false);
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

      recipeService.userService.getUser = jest
        .fn()
        .mockReturnValue(_mockUser$);

      recipeService.clientIdService.getNewId = jest
        .fn()
        .mockReturnValue('219876543210');

      recipeService.setRecipeIds = jest
        .fn();

      const formatted: RecipeMaster = recipeService.formatNewRecipeMaster({
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

      recipeService.userService.getUser = jest
        .fn()
        .mockReturnValue(_mockUser$);

      expect((): void => {
        recipeService.formatNewRecipeMaster({});
      })
      .toThrowError('Client Validation Error: Missing User ID');
    });

    test('should clear recipes', (): void => {
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive),
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive)
      ]);

      recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(list$);

      recipeService.storageService.removeRecipes();

      expect(list$.value.length).toEqual(2);

      recipeService.clearRecipes();

      expect(list$.value.length).toEqual(0);
    });

    test('should update list subject', (): void => {
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);

      recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(list$);

      const nextSpy: jest.SpyInstance = jest.spyOn(list$, 'next');

      recipeService.emitListUpdate();

      expect(nextSpy).toHaveBeenCalled();
    });

    test('should get combined hops schedule', (): void => {
      const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();

      expect(_mockHopsSchedule.length).toEqual(4);
      expect(_mockHopsSchedule[0].quantity).toEqual(1);

      const combined: HopsSchedule[] = recipeService.getCombinedHopsSchedule(_mockHopsSchedule);

      expect(combined.length).toEqual(3);
      expect(_mockHopsSchedule[0].quantity).toEqual(2);
    });

    test('should get undefined if combining a hops schedule that is undefined', (): void => {
      expect(recipeService.getCombinedHopsSchedule(undefined)).toBeUndefined();
    });

    test('should get a recipe master by id', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive),
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive)
      ]);

      recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(list$);

      expect(recipeService.getRecipeMasterById(_mockRecipeMasterInactive.cid).value).toStrictEqual(_mockRecipeMasterInactive);
      expect(recipeService.getRecipeMasterById('not-found')).toBeUndefined();
    });

    test('should get the master list', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      recipeService.recipeMasterList$ = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive),
        new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive)
      ]);

      expect(recipeService.getMasterList().value[0].value).toStrictEqual(_mockRecipeMasterActive);
      expect(recipeService.getMasterList().value[1].value).toStrictEqual(_mockRecipeMasterInactive);
    });

    test('should get a recipe variant by id', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      forkJoin(
        recipeService.getRecipeVariantById(_mockRecipeMasterActive.cid, _mockRecipeVariantComplete.cid),
        recipeService.getRecipeVariantById(_mockRecipeMasterActive.cid, 'variant-id')
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
      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      recipeService.getRecipeVariantById('master-id', 'variant-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get reults', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should check if a recipe has a process', (): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();

      expect(recipeService.isRecipeProcessPresent(_mockRecipeVariantComplete)).toBe(true);
      expect(recipeService.isRecipeProcessPresent(_mockRecipeVariantIncomplete)).toBe(false);
    });

    test('should map an array of recipe masters to an an array of master subjects', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list$: BehaviorSubject<BehaviorSubject<RecipeMaster>[]> = new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]);

      recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(list$);

      recipeService.mapRecipeMasterArrayToSubjects([_mockRecipeMasterActive, _mockRecipeMasterInactive]);

      const newList: BehaviorSubject<RecipeMaster>[] = list$.value;
      expect(newList.length).toEqual(2);
      expect(newList[0].value).toStrictEqual(_mockRecipeMasterActive);
      expect(newList[1].value).toStrictEqual(_mockRecipeMasterInactive);
    });

    test('should remove a recipe variant from a master in list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      recipeService.removeRecipeAsMaster = jest
        .fn();

      recipeService.emitListUpdate = jest
        .fn();

      recipeService.updateRecipeStorage = jest
        .fn();

      expect(_mockRecipeMasterActive.variants.length).toEqual(2);
      expect(_mockRecipeMasterActive.variants.find((variant: RecipeVariant): boolean => variant.cid === _mockRecipeVariantComplete.cid)).toBeDefined();

      recipeService.removeRecipeFromMasterInList(_mockRecipeMasterActive.cid, _mockRecipeVariantComplete.cid)
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
      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      recipeService.removeRecipeFromMasterInList('master-id', 'variant-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should get an error trying to remove a recipe variant with a missing variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      recipeService.removeRecipeFromMasterInList('master-id', 'variant-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Delete error: recipe with id variant-id not found');
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

      recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(list$);

      recipeService.emitListUpdate = jest
        .fn();

      recipeService.updateRecipeStorage = jest
        .fn();

      recipeService.removeRecipeMasterFromList(_mockRecipeMasterInactive.cid)
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

      recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(list$);

      recipeService.removeRecipeMasterFromList('master-id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Delete error: Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should remove a recipe as the master', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      _mockRecipeVariantComplete.isMaster = false;
      _mockRecipeMasterActive.variants.push(_mockRecipeVariantComplete);

      recipeService.removeRecipeAsMaster(_mockRecipeMasterActive, 0);

      expect(_mockRecipeMasterActive.variants.findIndex((variant: RecipeVariant): boolean => variant.isMaster)).toEqual(1);

      recipeService.removeRecipeAsMaster(_mockRecipeMasterActive, 1);

      expect(_mockRecipeMasterActive.variants.findIndex((variant: RecipeVariant): boolean => variant.isMaster)).toEqual(0);

      _mockRecipeMasterActive.variants[0].isMaster = false;
      _mockRecipeMasterActive.variants[2].isMaster = true;
      recipeService.removeRecipeAsMaster(_mockRecipeMasterActive, 2);

      expect(_mockRecipeMasterActive.variants.findIndex((variant: RecipeVariant): boolean => variant.isMaster)).toEqual(0);

      _mockRecipeMasterActive.variants.pop();
      _mockRecipeMasterActive.variants.pop();

      recipeService.removeRecipeAsMaster(_mockRecipeMasterActive, 0);

      expect(_mockRecipeMasterActive.variants[0].isMaster).toBe(true);
    });

    test('should set a recipe as master', (): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      expect(_mockRecipeMasterActive.variants[0].isMaster).toBe(true);
      expect(_mockRecipeMasterActive.variants[1].isMaster).toBe(false);

      recipeService.setRecipeAsMaster(_mockRecipeMasterActive, 1);

      expect(_mockRecipeMasterActive.variants[1].isMaster).toBe(true);
      expect(_mockRecipeMasterActive.variants[0].isMaster).toBe(false);
    });

    test('should set all recipe ids', (): void => {
      const _mockOtherIngredients: OtherIngredients[] = mockOtherIngredients();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      _mockRecipeVariantComplete.cid = '';
      _mockRecipeVariantComplete.otherIngredients = _mockOtherIngredients;

      recipeService.clientIdService.getNewId = jest
        .fn()
        .mockReturnValue('0000000000000');

      recipeService.setRecipeNestedIds = jest
        .fn();

      const nestSpy: jest.SpyInstance = jest.spyOn(recipeService, 'setRecipeNestedIds');

      recipeService.setRecipeIds(_mockRecipeVariantComplete);

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
      recipeService.clientIdService.getNewId = jest
        .fn()
        .mockImplementation((): string => `${id++}`);

      recipeService.setRecipeNestedIds<Process>(_mockProcessSchedule);

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

      recipeService.storageService.setRecipes = jest
        .fn()
        .mockReturnValue(of({}));

      recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(list$);

      const storeSpy: jest.SpyInstance = jest.spyOn(recipeService.storageService, 'setRecipes');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      recipeService.updateRecipeStorage();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith([_mockRecipeMasterActive, _mockRecipeMasterInactive]);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('stored recipes');
        done();
      }, 10);
    });

    test('should get an error trying to update recipe storage', (done: jest.DoneCallback): void => {
      recipeService.storageService.setRecipes = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      recipeService.getMasterList = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<BehaviorSubject<RecipeMaster>[]>([]));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      recipeService.updateRecipeStorage();

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('recipe store error: test-error');
        done();
      }, 10);
    });

    test('should update a recipe master in list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const _mockRecipeMasterInactive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterInactive);
      const _mockUpdate: RecipeMaster = mockRecipeMasterInactive();
      _mockUpdate.name = 'updated';

      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterInactive$);

      recipeService.emitListUpdate = jest
        .fn();

      recipeService.updateRecipeStorage = jest
        .fn();

      recipeService.updateRecipeMasterInList(_mockRecipeMasterInactive.cid, _mockUpdate)
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
      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      recipeService.updateRecipeMasterInList('master-id', null)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Update error: Recipe master with id master-id not found');
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

      recipeService.getRecipeMasterById  = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      recipeService.setRecipeAsMaster = jest
        .fn();

      recipeService.removeRecipeAsMaster = jest
        .fn();

      recipeService.emitListUpdate = jest
        .fn();

      recipeService.updateRecipeStorage = jest
        .fn();

      const setSpy: jest.SpyInstance = jest.spyOn(recipeService, 'setRecipeAsMaster');

      recipeService.updateRecipeVariantOfMasterInList(_mockRecipeMasterActive.cid, _mockRecipeVariantIncomplete.cid, _mockRecipeVariantIncomplete)
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

      recipeService.getRecipeMasterById  = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      recipeService.setRecipeAsMaster = jest
        .fn();

      recipeService.removeRecipeAsMaster = jest
        .fn();

      recipeService.emitListUpdate = jest
        .fn();

      recipeService.updateRecipeStorage = jest
        .fn();

      const removeSpy: jest.SpyInstance = jest.spyOn(recipeService, 'removeRecipeAsMaster');

      recipeService.updateRecipeVariantOfMasterInList(_mockRecipeMasterActive.cid, _mockRecipeVariantComplete.cid, _mockRecipeVariantComplete)
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
      recipeService.getRecipeMasterById = jest
        .fn()
        .mockReturnValue(undefined);

      recipeService.updateRecipeVariantOfMasterInList('master-id', 'variant-id', {})
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Recipe master with id master-id not found');
            done();
          }
        );
    });

    test('should get an error updating a missing recipe variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterActive$: BehaviorSubject<RecipeMaster> = new BehaviorSubject<RecipeMaster>(_mockRecipeMasterActive);

      recipeService.getRecipeMasterById  = jest
        .fn()
        .mockReturnValue(_mockRecipeMasterActive$);

      recipeService.updateRecipeVariantOfMasterInList(_mockRecipeMasterActive.cid, 'variant-id', {})
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Recipe with id variant-id not found');
            done();
          }
        );
    });

  });

});
