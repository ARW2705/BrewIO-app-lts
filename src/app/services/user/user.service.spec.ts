/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockImage, mockImageRequestMetadata, mockErrorResponse, mockLoginResponse, mockJWTSuccess, mockUser, mockUserUpdate, mockUserLogin, mockSyncMetadata, mockSyncResponse } from '../../../../test-config/mock-models';
import { ConnectionServiceStub, ErrorReportingServiceStub, EventServiceStub, HttpErrorServiceStub, IdServiceStub, ImageServiceStub, PreferencesServiceStub, StorageServiceStub, SyncServiceStub, ToastServiceStub, TypeGuardServiceStub } from '../../../../test-config/service-stubs';

/* Constants imports */
import { API_VERSION, BASE_URL } from '../../shared/constants';

/* Default imports */
import { defaultEnglishUnits, defaultImage } from '../../shared/defaults';

/* Interface imports */
import { Image, ImageRequestFormData, ImageRequestMetadata, LoginCredentials, SelectedUnits, SyncResponse, User, UserResponse } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Service imports */
import { UserService } from './user.service';
import { ConnectionService, ErrorReportingService, EventService, HttpErrorService, IdService, ImageService, PreferencesService, StorageService, SyncService, ToastService, TypeGuardService } from '../services';


describe('UserService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: UserService;
  let httpMock: HttpTestingController;
  let originalCheckType: any;
  const baseURL: string = `${BASE_URL}/${API_VERSION}/`;

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
        { provide: IdService, useClass: IdServiceStub },
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
    service = injector.get(UserService);
    httpMock = injector.get(HttpTestingController);
    service.errorReporter.handleUnhandledError = jest.fn();
    service.errorReporter.setErrorReport = jest.fn();
    originalCheckType = service.checkTypeSafety;
    service.checkTypeSafety = jest.fn();
    Object.assign(service.errorReporter, { highSeverity: 2 });
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should get valid JWT', (done: jest.DoneCallback): void => {
    const _mockJWTResponse: UserResponse = mockJWTSuccess();

    service.checkJWToken()
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
    service.httpError.handleError = jest.fn().mockReturnValue(throwError('test-error'));

    service.checkJWToken()
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
    service.storageService.removeUser = jest.fn();
    service.event.emit = jest.fn();
    service.checkTypeSafety = jest.fn();
    const storeSpy: jest.SpyInstance = jest.spyOn(service.storageService, 'removeUser');
    const eventSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');

    service.clearUserData();

    expect(service.user$.value).toStrictEqual({
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
    service.user$.next(_mockUser);

    expect(service.getToken()).toMatch('test-token');
  });

  test('should get the user', (): void => {
    const _mockUser: User = mockUser();
    service.user$.next(_mockUser);

    expect(service.getUser().value).toStrictEqual(_mockUser);
  });

  test('should check if user is logged in', (): void => {
    const _mockUser: User = mockUser();
    service.user$.next(_mockUser);

    expect(service.isLoggedIn()).toBe(true);

    _mockUser.token = '';
    service.user$.next(_mockUser);

    expect(service.isLoggedIn()).toBe(false);

    _mockUser.token = undefined;
    service.user$.next(_mockUser);

    expect(service.isLoggedIn()).toBe(false);
  });

  test('should load a user from storage', (): void => {
    const _mockUser: User = mockUser();
    const _mockJWTResponse: UserResponse = mockJWTSuccess();
    const _mockSubject: Subject<any> = new Subject<any>();
    service.storageService.getUser = jest.fn().mockReturnValue(of(_mockUser));
    service.isLoggedIn = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.checkJWToken = jest.fn().mockReturnValue(_mockSubject);
    service.connectionService.setOfflineMode = jest.fn();
    service.event.emit = jest.fn();
    service.preferenceService.setUnits = jest.fn();
    service.checkTypeSafety = jest.fn();
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const connSpy: jest.SpyInstance = jest.spyOn(service.connectionService, 'setOfflineMode');
    const eventSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');
    const prefSpy: jest.SpyInstance = jest.spyOn(service.preferenceService, 'setUnits');

    service.loadUserFromStorage();

    _mockSubject.next(_mockJWTResponse);
    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch(_mockJWTResponse.status);
    expect(connSpy).not.toHaveBeenCalled();
    expect(eventSpy).toHaveBeenNthCalledWith(1, 'init-recipes');
    expect(prefSpy).toHaveBeenNthCalledWith(1, _mockUser.preferredUnitSystem, _mockUser.units);

    service.loadUserFromStorage();

    _mockSubject.next(_mockJWTResponse);
    expect(connSpy).toHaveBeenCalledWith(true);
    expect(eventSpy).toHaveBeenNthCalledWith(2, 'init-recipes');
    expect(prefSpy).toHaveBeenNthCalledWith(2, _mockUser.preferredUnitSystem, _mockUser.units);
  });

  test('should handle storage error trying to load user from storage', (): void => {
    const _mockUser: User = mockUser();
    const _mockError = new Error('test-error');
    const _mockSubject: Subject<any> = new Subject<any>();
    service.storageService.getUser = jest.fn().mockReturnValue(of(_mockUser));
    service.checkTypeSafety = jest.fn();
    service.isLoggedIn = jest.fn().mockReturnValue(true);
    service.checkJWToken = jest.fn().mockReturnValue(_mockSubject);
    service.errorReporter.handleUnhandledError = jest.fn();
    service.clearUserData = jest.fn();
    service.navToHome = jest.fn();
    const handleSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');
    const clearSpy: jest.SpyInstance = jest.spyOn(service, 'clearUserData');
    const homeSpy: jest.SpyInstance = jest.spyOn(service, 'navToHome');

    service.loadUserFromStorage();

    _mockSubject.error(_mockError);
    expect(handleSpy).toHaveBeenCalledWith(_mockError);
    expect(clearSpy).toHaveBeenCalled();
    expect(homeSpy).toHaveBeenCalled();
  });

  test('should handle verification error tyring to load user from storage', (): void => {
    const _mockError: Error = new Error('test-error');
    const _mockSubject: Subject<any> = new Subject<any>();
    service.storageService.getUser = jest.fn().mockReturnValue(_mockSubject);
    service.errorReporter.handleUnhandledError = jest.fn();
    const customSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

    service.loadUserFromStorage();

    _mockSubject.error(_mockError);

    expect(customSpy).toHaveBeenCalledWith(_mockError);
  });

  test('should successfully log in (not on signup)', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockLoginCredentials: LoginCredentials = mockUserLogin();
    _mockLoginCredentials.remember = true;
    const _mockUserResponse: UserResponse = mockLoginResponse();
    service.isSafeUser = jest.fn().mockReturnValue(true);
    service.connectionService.setOfflineMode = jest.fn();
    service.event.emit = jest.fn();
    service.preferenceService.setUnits = jest.fn();
    service.storageService.setUser = jest.fn().mockReturnValue(of({}));
    service.syncOnConnection = jest.fn().mockReturnValue(of({}));
    service.errorReporter.handleGenericCatchError = jest.fn();
    const eventSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    service.logIn(_mockLoginCredentials, false)
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
    service.isSafeUser = jest.fn().mockReturnValue(true);
    service.connectionService.setOfflineMode = jest.fn();
    service.event.emit = jest.fn();
    service.preferenceService.setUnits = jest.fn();
    service.storageService.setUser = jest.fn();
    service.syncOnConnection = jest.fn().mockReturnValue(of({}));
    service.errorReporter.handleGenericCatchError = jest.fn();
    const eventSpy: jest.SpyInstance = jest.spyOn(service.event, 'emit');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const storeSpy: jest.SpyInstance = jest.spyOn(service.storageService, 'setUser');

    service.logIn(_mockLoginCredentials, true)
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
    service.isSafeUser = jest.fn().mockReturnValue(true);
    service.connectionService.setOfflineMode = jest.fn();
    service.event.emit = jest.fn();
    service.preferenceService.setUnits = jest.fn();
    service.storageService.setUser = jest.fn().mockReturnValue(throwError('storage-error'));
    service.syncOnConnection = jest.fn().mockReturnValue(throwError('sync-error'));
    service.errorReporter.handleUnhandledError = jest.fn();
    service.errorReporter.handleGenericCatchError = jest.fn();
    const customSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

    service.logIn(_mockLoginCredentials, false)
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
    service.errorReporter.handleGenericCatchError = jest.fn()
      .mockReturnValue((error: any): Observable<never> => {
        handledError = true;
        return throwError(null);
      });

    service.logIn(_mockLoginCredentials, false)
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
    service.connectionService.setOfflineMode = jest.fn();
    service.clearUserData = jest.fn();
    const connSpy: jest.SpyInstance = jest.spyOn(service.connectionService, 'setOfflineMode');
    const clearSpy: jest.SpyInstance = jest.spyOn(service, 'clearUserData');

    service.logOut();

    expect(connSpy).toHaveBeenCalledWith(true);
    expect(clearSpy).toHaveBeenCalled();
  });

  test('should map user data to current user', (): void => {
    const _mockUser: User = mockUser();
    const _mockUserUpdate: User = mockUserUpdate();
    service.checkTypeSafety = jest.fn();
    const user$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    service.getUser = jest.fn().mockReturnValue(user$);

    service.mapUserData(_mockUserUpdate);

    expect(user$.value).toStrictEqual(_mockUserUpdate);
  });

  test('should map user data to given user', (): void => {
    const _mockUser: User = mockUser();
    const _mockUserUpdate: User = mockUserUpdate();
    service.getUser = jest.fn().mockReturnValue(undefined);

    service.mapUserData(_mockUserUpdate, _mockUser);

    expect(_mockUser).toStrictEqual(_mockUserUpdate);
  });

  test('should navigate to home page', (): void => {
    service.router.navigate = jest.fn();
    const navSpy: jest.SpyInstance = jest.spyOn(service.router, 'navigate');

    service.navToHome();

    expect(navSpy).toHaveBeenCalledWith(['tabs/home']);
  });

  test('should sign up a user', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockImageRequestMetadata: ImageRequestMetadata = mockImageRequestMetadata();
    const _mockUserResponse: UserResponse = mockLoginResponse();
    service.composeImageStoreRequests = jest.fn().mockReturnValue(of([]));
    service.composeImageUploadRequests = jest.fn().mockReturnValue([]);
    service.imageService.blobbifyImages = jest.fn()
      .mockReturnValue(of([_mockImageRequestMetadata, _mockImageRequestMetadata]));
    service.logIn = jest.fn().mockReturnValue(of({}));
    service.errorReporter.handleGenericCatchError = jest.fn();
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    service.signUp(_mockUser)
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
    service.composeImageStoreRequests = jest.fn().mockReturnValue(of([]));
    service.composeImageUploadRequests = jest.fn().mockReturnValue([]);
    service.imageService.blobbifyImages = jest.fn().mockReturnValue(of([]));
    service.errorReporter.handleGenericCatchError = jest.fn()
      .mockReturnValue((error: any): Observable<never> => {
        handledError = true;
        return throwError(null);
      });

    service.signUp(_mockUser)
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
    service.composeImageStoreRequests = jest.fn().mockReturnValue(of([]));
    service.composeImageUploadRequests = jest.fn().mockReturnValue([]);
    service.imageService.blobbifyImages = jest.fn().mockReturnValue(of([]));
    service.logIn = jest.fn().mockReturnValue(throwError(_mockError));
    service.errorReporter.handleGenericCatchError = jest.fn();
    const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

    service.signUp(_mockUser)
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

  test('should get image path', (): void => {
    const _mockUserImage: Image = mockImage();
    const userFilePath: string = 'test-user-image-filepath';
    _mockUserImage.filePath = userFilePath;
    const _mockBreweryLabelImage: Image = mockImage();
    const breweryLabelFilePath: string = 'test-brewery-label-image-filepath';
    _mockBreweryLabelImage.filePath = breweryLabelFilePath;
    const _mockUser: User = mockUser();
    _mockUser.userImage = _mockUserImage;
    _mockUser.breweryLabelImage = _mockBreweryLabelImage;

    expect(service.getImagePath(_mockUser, 'userImage')).toMatch(userFilePath);
    expect(service.getImagePath(_mockUser, 'breweryLabelImage')).toMatch(breweryLabelFilePath);
    expect(service.getImagePath(_mockUser, 'notImage')).toBeNull();
  });

  test('should update the user profile (online)', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const user$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    const _mockUserUpdate: User = mockUserUpdate();
    service.getUser = jest.fn().mockReturnValue(user$);
    service.mapUserData = jest.fn();
    service.composeImageStoreRequests = jest.fn().mockReturnValue([of(null)]);
    service.canSendRequest = jest.fn().mockReturnValue(true);
    service.requestInBackground = jest.fn();
    service.idService.getId = jest.fn().mockReturnValue('');
    service.errorReporter.handleGenericCatchError = jest.fn();
    const composeSpy: jest.SpyInstance = jest.spyOn(service, 'composeImageStoreRequests');
    const reqSpy: jest.SpyInstance = jest.spyOn(service, 'requestInBackground');

    service.updateUserProfile(_mockUserUpdate)
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
    service.getUser = jest.fn().mockReturnValue(user$);
    service.mapUserData = jest.fn();
    service.composeImageStoreRequests = jest.fn().mockReturnValue([of(null)]);
    service.canSendRequest = jest.fn().mockReturnValue(false);
    service.addSyncFlag = jest.fn();
    service.idService.getId = jest.fn().mockReturnValue('');
    service.errorReporter.handleGenericCatchError = jest.fn();
    const composeSpy: jest.SpyInstance = jest.spyOn(service, 'composeImageStoreRequests');
    const syncSpy: jest.SpyInstance = jest.spyOn(service, 'addSyncFlag');

    service.updateUserProfile(_mockUserUpdate)
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
    service.storageService.setUser = jest.fn().mockReturnValue(_mockSubject);

    service.updateUserStorage();

    _mockSubject.next();

    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('user data stored');
  });

  test('should get an error updating user storage', (): void => {
    const _mockError: Error = new Error('test-error');
    const _mockSubject: Subject<any> = new Subject<any>();
    service.storageService.setUser = jest.fn().mockReturnValue(_mockSubject);
    service.errorReporter.handleUnhandledError = jest.fn();
    const customSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

    service.updateUserStorage();

    _mockSubject.error(_mockError);

    expect(customSpy).toHaveBeenCalledWith(_mockError);
  });

  test('should check if can send a request', (): void => {
    const testId: string = '';
    service.connectionService.isConnected = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.isLoggedIn = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.idService.hasDefaultIdType = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    expect(service.canSendRequest(testId)).toBe(true);
    expect(service.canSendRequest(testId)).toBe(false);
    expect(service.canSendRequest(testId)).toBe(false);
    expect(service.canSendRequest(testId)).toBe(false);
  });

  test('should compose image store requests', (): void => {
    const _mockImage: Image = mockImage();
    _mockImage.hasPending = true;
    const _mockUser: User = mockUser();
    _mockUser.breweryLabelImage = _mockImage;
    _mockUser.userImage = _mockImage;
    service.imageService.storeImageToLocalDir = jest.fn().mockReturnValue(of(_mockImage));
    const storeSpy: jest.SpyInstance = jest.spyOn(service.imageService, 'storeImageToLocalDir');
    const reqs: Observable<Image>[] = service.composeImageStoreRequests(_mockUser);

    expect(storeSpy).toHaveBeenCalledTimes(2);
    expect(reqs.length).toEqual(2);
  });

  test('should compose image upload request data', (): void => {
    const _mockUser: User = mockUser();
    _mockUser.breweryLabelImage.hasPending = true;
    _mockUser.userImage.hasPending = true;

    const imageData: ImageRequestFormData[] = service.composeImageUploadRequests(_mockUser);

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
    service.composeImageStoreRequests = jest.fn().mockReturnValue([]);
    service.imageService.blobbifyImages = jest.fn().mockReturnValue(of([_mockImageRequestMetadata]));
    service.errorReporter.handleResolvableCatchError = jest.fn()
      .mockReturnValue((error: any): Observable<never> => {
        return throwError(error);
      });

    service.configureBackgroundRequest(_mockUser, false)
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
    service.composeImageStoreRequests = jest.fn().mockReturnValue([]);
    service.imageService.blobbifyImages = jest.fn().mockReturnValue(throwError(_mockError));
    service.errorReporter.handleResolvableCatchError = jest.fn()
      .mockReturnValue((error: any): Observable<never> => {
        return throwError(null);
      });
    const customSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleResolvableCatchError');

    service.configureBackgroundRequest(_mockUser, false)
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
    service.composeImageStoreRequests = jest.fn().mockReturnValue([]);
    service.imageService.blobbifyImages = jest.fn().mockReturnValue(of([]));
    service.errorReporter.handleResolvableCatchError = jest.fn()
      .mockReturnValue((error: any): Observable<any> =>  of(null));

    service.configureBackgroundRequest(_mockUser, true)
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

    const body: object = service.configureRequestBody(_mockUser);

    expect(body['firstname']).toMatch(_mockUser.firstname);
    expect(body['lastname']).toMatch(_mockUser.lastname);
    expect(body['email']).toMatch(_mockUser.email);
    expect(body['userImage']).toStrictEqual(_mockUser.userImage);
    expect(body['breweryLabelImage']).toStrictEqual(_mockUser.breweryLabelImage);
  });

  test('should make request in background', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    service.configureRequestBody = jest.fn().mockReturnValue({});
    service.configureBackgroundRequest = jest.fn().mockReturnValue(of(_mockUser));
    service.mapUserData = jest.fn();
    service.updateUserStorage = jest.fn();
    const mapSpy: jest.SpyInstance = jest.spyOn(service, 'mapUserData');
    const storeSpy: jest.SpyInstance = jest.spyOn(service, 'updateUserStorage');

    service.requestInBackground(_mockUser);

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
    service.configureRequestBody = jest.fn().mockReturnValue({});
    service.configureBackgroundRequest = jest.fn().mockReturnValue(_mockSubject);
    service.errorReporter.handleUnhandledError = jest.fn();
    const customSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

    service.requestInBackground(_mockUser);

    _mockSubject.error(_mockError);

    expect(customSpy).toHaveBeenCalledWith(_mockError);
  });

  test('should add a sync flag', (): void => {
    service.syncService.addSyncFlag = jest.fn();
    const syncSpy: jest.SpyInstance = jest.spyOn(service.syncService, 'addSyncFlag');

    service.addSyncFlag('create', 'id');

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
    service.getUser = jest.fn().mockReturnValue(_mockUser$);
    service.syncService.getSyncFlagsByType = jest.fn()
      .mockReturnValue([mockSyncMetadata('method', 'docId', 'docType')]);
    service.configureBackgroundRequest = jest.fn();
    service.syncService.sync = jest.fn().mockReturnValue(of(_mockSyncResponse));
    service.mapUserData = jest.fn();
    service.checkTypeSafety = jest.fn();
    service.errorReporter.handleGenericCatchError = jest.fn();
    const mapSpy: jest.SpyInstance = jest.spyOn(service, 'mapUserData');

    service.syncOnConnection()
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
    service.getUser = jest.fn().mockReturnValue(_mockUser$);
    service.syncService.getSyncFlagsByType = jest.fn().mockReturnValue([]);
    const mapSpy: jest.SpyInstance = jest.spyOn(service, 'mapUserData');

    service.syncOnConnection()
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
    service.checkTypeSafety = originalCheckType;
    const _mockError: Error = new Error('test-error');
    const _mockUser: User = mockUser();
    service.isSafeUser = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.getUnsafeUserError = jest.fn().mockReturnValue(_mockError);

    expect((): void => {
      service.checkTypeSafety(_mockUser);
    }).not.toThrow();
    expect((): void => {
      service.checkTypeSafety(_mockUser);
    }).toThrow(_mockError);
  });

  test('should get a custom error for unsafe user', (): void => {
    const _mockError: Error = new Error('test-error');
    const customError: CustomError = <CustomError>service.getUnsafeUserError(_mockError);

    expect(customError.name).toMatch('UserError');
    expect(customError.message).toMatch('Given User is invalid: got\n{}');
    expect(customError.severity).toEqual(2);
    expect(customError.userMessage).toMatch('An error occurred while updating user: invalid user');
  });

  test('should check if user is type safe', (): void => {
    service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);
    service.preferenceService.isValidUnits = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    service.imageService.isSafeImage = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);
    const _mockUser: User = mockUser();
    _mockUser.breweryLabelImage = null;
    _mockUser.userImage = null;
    const _mockImage: Image = mockImage();

    expect(service.isSafeUser(_mockUser)).toBe(true);
    _mockUser.breweryLabelImage = _mockImage;
    _mockUser.userImage = _mockImage;
    expect(service.isSafeUser(_mockUser)).toBe(false);
    expect(service.isSafeUser(_mockUser)).toBe(false);
    expect(service.isSafeUser(_mockUser)).toBe(false);
    expect(service.isSafeUser(_mockUser)).toBe(false);
  });

});
