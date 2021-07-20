/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, Observable, Observer, TeardownLogic, Subject, forkJoin, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import {
  mockImage,
  mockImageRequestMetadata,
  mockErrorResponse,
  mockLoginResponse,
  mockJWTSuccess,
  mockUser,
  mockUserUpdate,
  mockUserLogin,
  mockSyncMetadata,
  mockSyncResponse
} from '../../../../test-config/mock-models';
import {
  ConnectionServiceStub,
  ErrorReportingServiceStub,
  EventServiceStub,
  HttpErrorServiceStub,
  ImageServiceStub,
  PreferencesServiceStub,
  StorageServiceStub,
  SyncServiceStub,
  ToastServiceStub,
  TypeGuardServiceStub
} from '../../../../test-config/service-stubs';

/* Constants imports */
import { API_VERSION, BASE_URL } from '../../shared/constants';

/* Default imports */
import { defaultEnglishUnits, defaultImage } from '../../shared/defaults';

/* Interface imports */
import {
  Image,
  ImageRequestFormData,
  ImageRequestMetadata,
  LoginCredentials,
  SelectedUnits,
  SyncResponse,
  User,
  UserResponse
} from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Service imports */
import { UserService } from './user.service';
import { ConnectionService } from '../connection/connection.service';
import { ErrorReportingService } from '../error-reporting/error-reporting.service';
import { EventService } from '../event/event.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { ImageService } from '../image/image.service';
import { PreferencesService } from '../preferences/preferences.service';
import { StorageService } from '../storage/storage.service';
import { SyncService } from '../sync/sync.service';
import { ToastService } from '../toast/toast.service';
import { TypeGuardService } from '../type-guard/type-guard.service';


describe('UserService', (): void => {
  let injector: TestBed;
  let userService: UserService;
  let httpMock: HttpTestingController;
  let originalCheckType: any;
  const baseURL: string = `${BASE_URL}/${API_VERSION}/`;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        UserService,
        { provide: ConnectionService, useClass: ConnectionServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: EventService, useClass: EventServiceStub },
        { provide: HttpErrorService, useClass: HttpErrorServiceStub },
        { provide: ImageService, useClass: ImageServiceStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub },
        { provide: StorageService, useClass: StorageServiceStub },
        { provide: SyncService, useClass: SyncServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: TypeGuardService, useClass: TypeGuardServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    userService = injector.get(UserService);
    httpMock = injector.get(HttpTestingController);
    userService.errorReporter.handleUnhandledError = jest
      .fn();
    userService.errorReporter.setErrorReport = jest
      .fn();
    originalCheckType = userService.checkTypeSafety;
    userService.checkTypeSafety = jest.fn();
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    expect(userService).toBeDefined();
  });

  test('should get valid JWT', (done: jest.DoneCallback): void => {
    const _mockJWTResponse: UserResponse = mockJWTSuccess();

    userService.checkJWToken()
      .subscribe(
        (res: UserResponse): void => {
          expect(res).toStrictEqual(_mockJWTResponse);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should get valid JWT'`, error);
          expect(true).toBe(false);
        }
      );

    const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/checkJWToken`);
    expect(getReq.request.method).toMatch('GET');
    getReq.flush(_mockJWTResponse);
  });

  test('should get invalid JWT', (done: jest.DoneCallback): void => {
    const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(
      500,
      'test-error',
      baseURL + 'users/checkJWToken'
    );

    userService.httpError.handleError = jest
      .fn()
      .mockReturnValue(throwError('test-error'));

    userService.checkJWToken()
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: HttpErrorResponse): void => {
          expect(error).toStrictEqual(_mockErrorResponse);
          done();
        }
      );

    const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/checkJWToken`);
    expect(getReq.request.method).toMatch('GET');
    getReq.flush(null, _mockErrorResponse);
  });

  test('should clear user data', (): void => {
    const _defaultImage: Image = defaultImage();
    const _defaultEnglishUnits: SelectedUnits = defaultEnglishUnits();

    userService.storageService.removeUser = jest
      .fn();

    userService.event.emit = jest
      .fn();

    userService.checkTypeSafety = jest
      .fn();

    const storeSpy: jest.SpyInstance = jest.spyOn(userService.storageService, 'removeUser');
    const eventSpy: jest.SpyInstance = jest.spyOn(userService.event, 'emit');

    userService.clearUserData();

    expect(userService.user$.value).toStrictEqual({
      _id: undefined,
      cid: 'offline',
      createdAt: undefined,
      updatedAt: undefined,
      username: '',
      firstname: undefined,
      lastname: undefined,
      email: undefined,
      friendList: [],
      token: '',
      preferredUnitSystem: _defaultEnglishUnits.system,
      units: _defaultEnglishUnits,
      breweryLabelImage: _defaultImage,
      userImage: _defaultImage
    });

    expect(storeSpy).toHaveBeenCalled();
    expect(eventSpy).toHaveBeenCalledWith('clear-data');
  });

  test('should get user token', (): void => {
    const _mockUser: User = mockUser();
    _mockUser.token = 'test-token';

    userService.user$.next(_mockUser);

    expect(userService.getToken()).toMatch('test-token');
  });

  test('should get the user', (): void => {
    const _mockUser: User = mockUser();

    userService.user$.next(_mockUser);

    expect(userService.getUser().value).toStrictEqual(_mockUser);
  });

  test('should check if user is logged in', (): void => {
    const _mockUser: User = mockUser();

    userService.user$.next(_mockUser);

    expect(userService.isLoggedIn()).toBe(true);

    _mockUser.token = '';
    userService.user$.next(_mockUser);

    expect(userService.isLoggedIn()).toBe(false);

    _mockUser.token = undefined;
    userService.user$.next(_mockUser);

    expect(userService.isLoggedIn()).toBe(false);
  });

  test('should load a user from storage', (): void => {
    const _mockUser: User = mockUser();
    const _mockJWTResponse: UserResponse = mockJWTSuccess();
    const _mockSubject: Subject<any> = new Subject<any>();

    userService.storageService.getUser = jest
      .fn()
      .mockReturnValue(of(_mockUser));

    userService.isLoggedIn = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    userService.checkJWToken = jest
      .fn()
      .mockReturnValue(_mockSubject);

    userService.connectionService.setOfflineMode = jest
      .fn();

    userService.event.emit = jest
      .fn();

    userService.preferenceService.setUnits = jest
      .fn();

    userService.checkTypeSafety = jest
      .fn();

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const connSpy: jest.SpyInstance = jest.spyOn(userService.connectionService, 'setOfflineMode');
    const eventSpy: jest.SpyInstance = jest.spyOn(userService.event, 'emit');
    const prefSpy: jest.SpyInstance = jest.spyOn(userService.preferenceService, 'setUnits');

    userService.loadUserFromStorage();

    _mockSubject.next(_mockJWTResponse);

    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch(_mockJWTResponse.status);
    expect(connSpy).not.toHaveBeenCalled();
    expect(eventSpy).toHaveBeenNthCalledWith(1, 'init-recipes');
    expect(prefSpy).toHaveBeenNthCalledWith(1, _mockUser.preferredUnitSystem, _mockUser.units);

    userService.loadUserFromStorage();

    _mockSubject.next(_mockJWTResponse);

    expect(connSpy).toHaveBeenCalledWith(true);
    expect(eventSpy).toHaveBeenNthCalledWith(2, 'init-recipes');
    expect(prefSpy).toHaveBeenNthCalledWith(2, _mockUser.preferredUnitSystem, _mockUser.units);
  });

  test('should handle storage error trying to load user from storage', (): void => {
    const _mockUser: User = mockUser();
    const _mockError = new Error('test-error');
    const _mockSubject: Subject<any> = new Subject<any>();

    userService.storageService.getUser = jest
      .fn()
      .mockReturnValue(of(_mockUser));

    userService.checkTypeSafety = jest
      .fn();

    userService.isLoggedIn = jest
      .fn()
      .mockReturnValue(true);

    userService.checkJWToken = jest
      .fn()
      .mockReturnValue(_mockSubject);

    userService.errorReporter.handleUnhandledError = jest
      .fn();

    userService.clearUserData = jest
      .fn();

    userService.navToHome = jest
      .fn();

    const handleSpy: jest.SpyInstance = jest.spyOn(userService.errorReporter, 'handleUnhandledError');
    const clearSpy: jest.SpyInstance = jest.spyOn(userService, 'clearUserData');
    const homeSpy: jest.SpyInstance = jest.spyOn(userService, 'navToHome');

    userService.loadUserFromStorage();

    _mockSubject.error(_mockError);

    expect(handleSpy).toHaveBeenCalledWith(_mockError);
    expect(clearSpy).toHaveBeenCalled();
    expect(homeSpy).toHaveBeenCalled();
  });

  test('should handle verification error tyring to load user from storage', (): void => {
    const _mockError: Error = new Error('test-error');
    const _mockSubject: Subject<any> = new Subject<any>();

    userService.storageService.getUser = jest
      .fn()
      .mockReturnValue(_mockSubject);

    userService.errorReporter.handleUnhandledError = jest
      .fn();

    const customSpy: jest.SpyInstance = jest.spyOn(userService.errorReporter, 'handleUnhandledError');

    userService.loadUserFromStorage();

    _mockSubject.error(_mockError);

    expect(customSpy).toHaveBeenCalledWith(_mockError);
  });

  test('should successfully log in (not on signup)', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockLoginCredentials: LoginCredentials = mockUserLogin();
    _mockLoginCredentials.remember = true;
    const _mockUserResponse: UserResponse = mockLoginResponse();

    userService.isSafeUser = jest
      .fn()
      .mockReturnValue(true);

    userService.connectionService.setOfflineMode = jest
      .fn();

    userService.event.emit = jest
      .fn();

    userService.preferenceService.setUnits = jest
      .fn();

    userService.storageService.setUser = jest
      .fn()
      .mockReturnValue(of({}));

    userService.syncOnConnection = jest
      .fn()
      .mockReturnValue(of({}));

    userService.errorReporter.handleGenericCatchError = jest.fn();

    const eventSpy: jest.SpyInstance = jest.spyOn(userService.event, 'emit');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    userService.logIn(_mockLoginCredentials, false)
      .subscribe(
        (user: User): void => {
          expect(user).toStrictEqual(_mockUser);
          expect(eventSpy).toHaveBeenCalledWith('init-recipes');
          expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 2][0]).toMatch('stored user data');
          expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('user sync successful');
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should successfully log in (not on signup)'`, error);
          expect(true).toBe(false);
        }
      );

    const postReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/login`);
    expect(postReq.request.method).toMatch('POST');
    postReq.flush(_mockUserResponse);
  });

  test('should successfully log in (on signup)', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockLoginCredentials: LoginCredentials = mockUserLogin();
    const _mockUserResponse: UserResponse = mockLoginResponse();

    userService.isSafeUser = jest
      .fn()
      .mockReturnValue(true);

    userService.connectionService.setOfflineMode = jest
      .fn();

    userService.event.emit = jest
      .fn();

    userService.preferenceService.setUnits = jest
      .fn();

    userService.storageService.setUser = jest
      .fn();

    userService.syncOnConnection = jest
      .fn()
      .mockReturnValue(of({}));

    userService.errorReporter.handleGenericCatchError = jest.fn();

    const eventSpy: jest.SpyInstance = jest.spyOn(userService.event, 'emit');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const storeSpy: jest.SpyInstance = jest.spyOn(userService.storageService, 'setUser');

    userService.logIn(_mockLoginCredentials, true)
      .subscribe(
        (user: User): void => {
          expect(user).toStrictEqual(_mockUser);
          expect(eventSpy).toHaveBeenCalledWith('sync-recipes-on-signup');
          expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('user sync successful');
          expect(storeSpy).not.toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should successfully log in (on signup)'`, error);
          expect(true).toBe(false);
        }
      );

    const postReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/login`);
    expect(postReq.request.method).toMatch('POST');
    postReq.flush(_mockUserResponse);
  });

  test('should log in, but fail syncing with server and storing', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockLoginCredentials: LoginCredentials = mockUserLogin();
    _mockLoginCredentials.remember = true;
    const _mockUserResponse: UserResponse = mockLoginResponse();

    userService.isSafeUser = jest
      .fn()
      .mockReturnValue(true);

    userService.connectionService.setOfflineMode = jest
      .fn();

    userService.event.emit = jest
      .fn();

    userService.preferenceService.setUnits = jest
      .fn();

    userService.storageService.setUser = jest
      .fn()
      .mockReturnValue(throwError('storage-error'));

    userService.syncOnConnection = jest
      .fn()
      .mockReturnValue(throwError('sync-error'));

    userService.errorReporter.handleUnhandledError = jest
      .fn();

    userService.errorReporter.handleGenericCatchError = jest.fn();

    const customSpy: jest.SpyInstance = jest.spyOn(userService.errorReporter, 'handleUnhandledError');

    userService.logIn(_mockLoginCredentials, false)
      .subscribe(
        (user: User): void => {
          expect(user).toStrictEqual(_mockUser);
          expect(customSpy).toHaveBeenNthCalledWith(1, 'storage-error');
          expect(customSpy).toHaveBeenNthCalledWith(2, 'sync-error');
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should successfully log in (on signup)'`, error);
          expect(true).toBe(false);
        }
      );

    const postReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/login`);
    expect(postReq.request.method).toMatch('POST');
    postReq.flush(_mockUserResponse);
  });

  test('should get an error when loggin in', (done: jest.DoneCallback): void => {
    const _mockLoginCredentials: LoginCredentials = mockUserLogin();
    const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');
    let handledError: boolean = false;

    userService.errorReporter.handleGenericCatchError = jest
      .fn()
      .mockReturnValue((error: any): Observable<never> => {
        handledError = true;
        return throwError(null);
      });

    userService.logIn(_mockLoginCredentials, false)
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

    const postReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/login`);
    expect(postReq.request.method).toMatch('POST');
    postReq.flush(null, _mockErrorResponse);
  });

  test('should log out a user', (): void => {
    userService.connectionService.setOfflineMode = jest
      .fn();

    userService.clearUserData = jest
      .fn();

    const connSpy: jest.SpyInstance = jest.spyOn(userService.connectionService, 'setOfflineMode');
    const clearSpy: jest.SpyInstance = jest.spyOn(userService, 'clearUserData');

    userService.logOut();

    expect(connSpy).toHaveBeenCalledWith(true);
    expect(clearSpy).toHaveBeenCalled();
  });

  test('should map user data to current user', (): void => {
    const _mockUser: User = mockUser();
    const _mockUserUpdate: User = mockUserUpdate();

    userService.checkTypeSafety = jest
      .fn();

    const user$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);

    userService.getUser = jest
      .fn()
      .mockReturnValue(user$);

    userService.mapUserData(_mockUserUpdate);

    expect(user$.value).toStrictEqual(_mockUserUpdate);
  });

  test('should map user data to given user', (): void => {
    const _mockUser: User = mockUser();
    const _mockUserUpdate: User = mockUserUpdate();

    userService.getUser = jest
      .fn()
      .mockReturnValue(undefined);

    userService.mapUserData(_mockUserUpdate, _mockUser);

    expect(_mockUser).toStrictEqual(_mockUserUpdate);
  });

  test('should navigate to home page', (): void => {
    userService.router.navigate = jest
      .fn();

    const navSpy: jest.SpyInstance = jest.spyOn(userService.router, 'navigate');

    userService.navToHome();

    expect(navSpy).toHaveBeenCalledWith(['tabs/home']);
  });

  test('should sign up a user', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockImageRequestMetadata: ImageRequestMetadata = mockImageRequestMetadata();
    const _mockUserResponse: UserResponse = mockLoginResponse();

    userService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue(of([]));

    userService.composeImageUploadRequests = jest
      .fn()
      .mockReturnValue([]);

    userService.imageService.blobbifyImages = jest
      .fn()
      .mockReturnValue(of([_mockImageRequestMetadata, _mockImageRequestMetadata]));

    userService.logIn = jest
      .fn()
      .mockReturnValue(of({}));

    userService.errorReporter.handleGenericCatchError = jest.fn();

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    userService.signUp(_mockUser)
      .subscribe(
        (res: UserResponse): void => {
          expect(res.user.username).toMatch(_mockUser.username);
          expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Signup successful; log in successful');
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should sign up a user'`, error);
          expect(true).toBe(false);
        }
      );

    const postReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/signup`);
    expect(postReq.request.method).toMatch('POST');
    expect(postReq.request.body instanceof FormData).toBe(true);
    postReq.flush(_mockUserResponse);
  });

  test('should get an error on signup', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    let handledError: boolean = false;

    userService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue(of([]));

    userService.composeImageUploadRequests = jest
      .fn()
      .mockReturnValue([]);

    userService.imageService.blobbifyImages = jest
      .fn()
      .mockReturnValue(of([]));

    userService.errorReporter.handleGenericCatchError = jest
      .fn()
      .mockReturnValue((error: any): Observable<never> => {
        handledError = true;
        return throwError(null);
      });

    userService.signUp(_mockUser)
      .subscribe(
        (results): any => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toBeNull();
          expect(handledError).toBe(true);
          done();
        }
      );

    const postReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/signup`);
    expect(postReq.request.method).toMatch('POST');
    postReq.flush(null, mockErrorResponse(404, 'not found'));
  });

  test('should get an error on login after signing up', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockUserResponse: UserResponse = mockLoginResponse();
    const _mockError: Error = new Error('test-error');

    userService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue(of([]));

    userService.composeImageUploadRequests = jest
      .fn()
      .mockReturnValue([]);

    userService.imageService.blobbifyImages = jest
      .fn()
      .mockReturnValue(of([]));

    userService.logIn = jest
      .fn()
      .mockReturnValue(throwError(_mockError));

    userService.errorReporter.handleGenericCatchError = jest.fn();

    const errorSpy: jest.SpyInstance = jest.spyOn(userService.errorReporter, 'handleUnhandledError');

    userService.signUp(_mockUser)
      .subscribe(
        (): void => {
          expect(errorSpy).toHaveBeenLastCalledWith(_mockError);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should get an error on login after signing up'`, error);
          expect(true).toBe(false);
        }
      );

    const postReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/signup`);
    postReq.flush(_mockUserResponse);
  });

  test('should update the user profile (online)', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const user$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    const _mockUserUpdate: User = mockUserUpdate();

    userService.getUser = jest
      .fn()
      .mockReturnValue(user$);

    userService.mapUserData = jest
      .fn();

    userService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue([of(null)]);

    userService.canSendRequest = jest
      .fn()
      .mockReturnValue(true);

    userService.requestInBackground = jest
      .fn();

    userService.errorReporter.handleGenericCatchError = jest.fn();

    const composeSpy: jest.SpyInstance = jest.spyOn(userService, 'composeImageStoreRequests');
    const reqSpy: jest.SpyInstance = jest.spyOn(userService, 'requestInBackground');

    userService.updateUserProfile(_mockUserUpdate)
      .subscribe(
        (): void => {
          expect(composeSpy).toHaveBeenCalledWith(
            user$.value,
            {
              userImage: _mockUser.userImage.filePath,
              breweryLabelImage: _mockUser.breweryLabelImage.filePath
            }
          );
          expect(reqSpy).toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should update the user profile'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should update the user profile (offline)', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const user$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    const _mockUserUpdate: User = mockUserUpdate();

    userService.getUser = jest
      .fn()
      .mockReturnValue(user$);

    userService.mapUserData = jest
      .fn();

    userService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue([of(null)]);

    userService.canSendRequest = jest
      .fn()
      .mockReturnValue(false);

    userService.addSyncFlag = jest
      .fn();

    userService.errorReporter.handleGenericCatchError = jest.fn();

    const composeSpy: jest.SpyInstance = jest.spyOn(userService, 'composeImageStoreRequests');
    const syncSpy: jest.SpyInstance = jest.spyOn(userService, 'addSyncFlag');

    userService.updateUserProfile(_mockUserUpdate)
      .subscribe(
        (): void => {
          expect(composeSpy).toHaveBeenCalledWith(
            user$.value,
            {
              userImage: _mockUser.userImage.filePath,
              breweryLabelImage: _mockUser.breweryLabelImage.filePath
            }
          );
          expect(syncSpy).toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should update the user profile'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should update user storage', (): void => {
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const _mockSubject: Subject<any> = new Subject<any>();

    userService.storageService.setUser = jest
      .fn()
      .mockReturnValue(_mockSubject);

    userService.updateUserStorage();

    _mockSubject.next();

    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('user data stored');
  });

  test('should get an error updating user storage', (): void => {
    const _mockError: Error = new Error('test-error');
    const _mockSubject: Subject<any> = new Subject<any>();

    userService.storageService.setUser = jest
      .fn()
      .mockReturnValue(_mockSubject);

    userService.errorReporter.handleUnhandledError = jest
      .fn();

    const customSpy: jest.SpyInstance = jest.spyOn(userService.errorReporter, 'handleUnhandledError');

    userService.updateUserStorage();

    _mockSubject.error(_mockError);

    expect(customSpy).toHaveBeenCalledWith(_mockError);
  });

  test('should check if can send a request', (): void => {
    const nonDefId: string = '1a2b3c';

    userService.connectionService.isConnected = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    userService.isLoggedIn = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    expect(userService.canSendRequest('0123456789012')).toBe(false);

    expect(userService.canSendRequest(nonDefId)).toBe(true);

    expect(userService.canSendRequest(nonDefId)).toBe(false);

    expect(userService.canSendRequest(nonDefId)).toBe(false);
  });

  test('should compose image store requests', (): void => {
    const _mockImage: Image = mockImage();
    _mockImage.hasPending = true;
    const _mockUser: User = mockUser();
    _mockUser.breweryLabelImage = _mockImage;
    _mockUser.userImage = _mockImage;

    userService.imageService.storeImageToLocalDir = jest
      .fn()
      .mockReturnValue(of(_mockImage));

    const storeSpy: jest.SpyInstance = jest.spyOn(userService.imageService, 'storeImageToLocalDir');

    const reqs: Observable<Image>[] = userService.composeImageStoreRequests(_mockUser);

    expect(storeSpy).toHaveBeenCalledTimes(2);
    expect(reqs.length).toEqual(2);
  });

  test('should compose image upload request data', (): void => {
    const _mockUser: User = mockUser();
    _mockUser.breweryLabelImage.hasPending = true;
    _mockUser.userImage.hasPending = true;

    const imageData: ImageRequestFormData[] = userService.composeImageUploadRequests(_mockUser);

    expect(imageData[0]).toStrictEqual({
      image: _mockUser.userImage,
      name: 'userImage'
    });

    expect(imageData[1]).toStrictEqual({
      image: _mockUser.breweryLabelImage,
      name: 'breweryLabelImage'
    });
  });

  test('should configure a background request', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockImageRequestMetadata: ImageRequestMetadata = mockImageRequestMetadata();

    userService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue([]);

    userService.imageService.blobbifyImages = jest
      .fn()
      .mockReturnValue(of([_mockImageRequestMetadata]));

    userService.errorReporter.handleResolvableCatchError = jest
      .fn()
      .mockReturnValue((error: any): Observable<never> => {
        return throwError(error);
      });

    userService.configureBackgroundRequest(_mockUser, false)
      .subscribe(
        (): void => {
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should configure a background request'`, error);
          expect(true).toBe(false);
        }
      );

    const patchReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/profile`);
    expect(patchReq.request.method).toMatch('PATCH');
    expect(patchReq.request.body instanceof FormData).toBe(true);
    patchReq.flush(_mockUser);
  });

  test('should get an error configuring a background request that should not resolve', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockError: Error = new Error('test-error');

    userService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue([]);

    userService.imageService.blobbifyImages = jest
      .fn()
      .mockReturnValue(throwError(_mockError));

    userService.errorReporter.handleResolvableCatchError = jest
      .fn()
      .mockReturnValue((error: any): Observable<never> => {
        return throwError(null);
      });

    const customSpy: jest.SpyInstance = jest.spyOn(userService.errorReporter, 'handleResolvableCatchError');

    userService.configureBackgroundRequest(_mockUser, false)
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: any): void => {
          expect(customSpy).toHaveBeenCalledWith(false);
          expect(error).toBeNull();
          done();
        }
      );
  });

  test('should get an error configuring a background request that should resolve', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();

    userService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue([]);

    userService.imageService.blobbifyImages = jest
      .fn()
      .mockReturnValue(of([]));

    userService.errorReporter.handleResolvableCatchError = jest
      .fn()
      .mockReturnValue((error: any): Observable<any> => {
        return of(null);
      });

    userService.configureBackgroundRequest(_mockUser, true)
      .subscribe(
        (results: any): void => {
          expect(results).toBeNull();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should get an error configuring a background request that should resolve'`, error);
          expect(true).toBe(false);
        }
      );

    const patchReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/profile`);
    expect(patchReq.request.method).toMatch('PATCH');
    patchReq.flush(null, mockErrorResponse(404, 'not found'));
  });

  test('should configure a request body', (): void => {
    const _mockUser: User = mockUser();

    const body: object = userService.configureRequestBody(_mockUser);

    expect(body['firstname']).toMatch(_mockUser.firstname);
    expect(body['lastname']).toMatch(_mockUser.lastname);
    expect(body['email']).toMatch(_mockUser.email);
    expect(body['userImage']).toStrictEqual(_mockUser.userImage);
    expect(body['breweryLabelImage']).toStrictEqual(_mockUser.breweryLabelImage);
  });

  test('should make request in background', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();

    userService.configureRequestBody = jest
      .fn()
      .mockReturnValue({});

    userService.configureBackgroundRequest = jest
      .fn()
      .mockReturnValue(of(_mockUser));

    userService.mapUserData = jest
      .fn();

    userService.updateUserStorage = jest
      .fn();

    const mapSpy: jest.SpyInstance = jest.spyOn(userService, 'mapUserData');
    const storeSpy: jest.SpyInstance = jest.spyOn(userService, 'updateUserStorage');

    userService.requestInBackground(_mockUser);

    setTimeout((): void => {
      expect(mapSpy).toHaveBeenCalled();
      expect(storeSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should get an error making request in background', (): void => {
    const _mockUser: User = mockUser();
    const _mockSubject: Subject<any> = new Subject<any>();
    const _mockError: Error = new Error('test-error');

    userService.configureRequestBody = jest
      .fn()
      .mockReturnValue({});

    userService.configureBackgroundRequest = jest
      .fn()
      .mockReturnValue(_mockSubject);

    userService.errorReporter.handleUnhandledError = jest
      .fn();

    const customSpy: jest.SpyInstance = jest.spyOn(userService.errorReporter, 'handleUnhandledError');

    userService.requestInBackground(_mockUser);

    _mockSubject.error(_mockError);

    expect(customSpy).toHaveBeenCalledWith(_mockError);
  });

  test('should add a sync flag', (): void => {
    userService.syncService.addSyncFlag = jest
      .fn();

    const syncSpy: jest.SpyInstance = jest.spyOn(userService.syncService, 'addSyncFlag');

    userService.addSyncFlag('create', 'id');

    expect(syncSpy).toHaveBeenCalledWith({
      method: 'create',
      docId: 'id',
      docType: 'user'
    });
  });

  test('should sync on connection', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    const _mockSyncResponse: SyncResponse<User> = mockSyncResponse<User>();
    const _mockUserResponse: User = mockUser();
    _mockUserResponse.cid = '12345';
    _mockUserResponse.email = 'email@email';
    _mockSyncResponse.successes = [_mockUserResponse];

    userService.getUser = jest
      .fn()
      .mockReturnValue(_mockUser$);

    userService.syncService.getSyncFlagsByType = jest
      .fn()
      .mockReturnValue([mockSyncMetadata('method', 'docId', 'docType')]);

    userService.configureBackgroundRequest = jest
      .fn();

    userService.syncService.sync = jest
      .fn()
      .mockReturnValue(of(_mockSyncResponse));

    userService.mapUserData = jest
      .fn();

    userService.checkTypeSafety = jest
      .fn();

    userService.errorReporter.handleGenericCatchError = jest.fn();

    const mapSpy: jest.SpyInstance = jest.spyOn(userService, 'mapUserData');

    userService.syncOnConnection()
      .subscribe(
        (): void => {
          expect(mapSpy).toHaveBeenCalledWith(_mockUserResponse, _mockUser);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should sync on connection'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should not sync on connection if no flags stored', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);

    userService.getUser = jest
      .fn()
      .mockReturnValue(_mockUser$);

    userService.syncService.getSyncFlagsByType = jest
      .fn()
      .mockReturnValue([]);

    const mapSpy: jest.SpyInstance = jest.spyOn(userService, 'mapUserData');

    userService.syncOnConnection()
      .subscribe(
        (): void => {
          expect(mapSpy).not.toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should not sync on connection if no flags stored'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should check user is type safe', (): void => {
    userService.checkTypeSafety = originalCheckType;
    const _mockError: Error = new Error('test-error');
    const _mockUser: User = mockUser();

    userService.isSafeUser = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    userService.getUnsafeUserError = jest
      .fn()
      .mockReturnValue(_mockError);

    expect((): void => {
      userService.checkTypeSafety(_mockUser);
    }).not.toThrow();
    expect((): void => {
      userService.checkTypeSafety(_mockUser);
    }).toThrow(_mockError);
  });

  test('should get a custom error for unsafe user', (): void => {
    const _mockError: Error = new Error('test-error');
    const customError: CustomError = <CustomError>userService.getUnsafeUserError(_mockError);

    expect(customError.name).toMatch('UserError');
    expect(customError.message).toMatch('Given User is invalid: got\n{}');
    expect(customError.severity).toEqual(2);
    expect(customError.userMessage).toMatch('An error occurred while updating user: invalid user');
  });

  test('should check if user is type safe', (): void => {
    userService.typeGuard.hasValidProperties = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    userService.preferenceService.isValidUnits = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    userService.imageService.isSafeImage = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);

    const _mockUser: User = mockUser();
    _mockUser.breweryLabelImage = null;
    _mockUser.userImage = null;
    const _mockImage: Image = mockImage();

    expect(userService.isSafeUser(_mockUser)).toBe(true);
    _mockUser.breweryLabelImage = _mockImage;
    _mockUser.userImage = _mockImage;
    expect(userService.isSafeUser(_mockUser)).toBe(false);
    expect(userService.isSafeUser(_mockUser)).toBe(false);
    expect(userService.isSafeUser(_mockUser)).toBe(false);
    expect(userService.isSafeUser(_mockUser)).toBe(false);
  });

});
