/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockImage, mockImageRequestMetadata } from '../../../../test-config/mock-models/mock-image';
import { mockErrorResponse, mockLoginResponse, mockJWTSuccess } from '../../../../test-config/mock-models/mock-response';
import { mockUser, mockUserUpdate, mockUserLogin } from '../../../../test-config/mock-models/mock-user';
import { mockSyncMetadata, mockSyncResponse } from '../../../../test-config/mock-models/mock-sync';
import { ConnectionServiceMock, EventServiceMock, HttpErrorServiceMock, ImageServiceMock, PreferencesServiceMock, StorageServiceMock, SyncServiceMock, ToastServiceMock } from '../../../../test-config/mocks-app';
import { RouterMock } from '../../../../test-config/mocks-ionic';

/* Constants imports */
import { BASE_URL } from '../../shared/constants/base-url';
import { API_VERSION } from '../../shared/constants/api-version';

/* Default imports */
import { defaultEnglish } from '../../shared/defaults/default-units';
import { defaultImage } from '../../shared/defaults/default-image';

/* Interface imports */
import { Image, ImageRequestFormData, ImageRequestMetadata } from '../../shared/interfaces/image';
import { SelectedUnits } from '../../shared/interfaces/units';
import { SyncResponse } from '../../shared/interfaces/sync';
import { LoginCredentials } from '../../shared/interfaces/login-credentials';
import { User } from '../../shared/interfaces/user';
import { UserResponse } from '../../shared/interfaces/user-response';

/* Service imports */
import { UserService } from './user.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { StorageService } from '../storage/storage.service';
import { ConnectionService } from '../connection/connection.service';
import { PreferencesService } from '../preferences/preferences.service';
import { EventService } from '../event/event.service';
import { ImageService } from '../image/image.service';
import { SyncService } from '../sync/sync.service';
import { ToastService } from '../toast/toast.service';


describe('UserService', (): void => {
  let injector: TestBed;
  let userService: UserService;
  let httpMock: HttpTestingController;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        UserService,
        { provide: Router, useClass: RouterMock },
        { provide: EventService, useClass: EventServiceMock },
        { provide: ImageService, useClass: ImageServiceMock },
        { provide: HttpErrorService, useClass: HttpErrorServiceMock },
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: ConnectionService, useClass: ConnectionServiceMock },
        { provide: PreferencesService, useClass: PreferencesServiceMock },
        { provide: SyncService, useClass: SyncServiceMock },
        { provide: ToastService, useClass: ToastServiceMock }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    userService = injector.get(UserService);
    httpMock = injector.get(HttpTestingController);
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

  test('should get valid JWT', (done: jest.DoneCallback): void => {
    userService.httpError.handleError = jest
      .fn()
      .mockReturnValue(throwError('test-error'));

    userService.checkJWToken()
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

    const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/checkJWToken`);
    expect(getReq.request.method).toMatch('GET');
    getReq.flush(null, mockErrorResponse(500, 'test-error'));
  });

  test('should clear user data', (): void => {
    const _defaultImage: Image = defaultImage();
    const _defaultEnglish: SelectedUnits = defaultEnglish();

    userService.storageService.removeUser = jest
      .fn();

    userService.event.emit = jest
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
      preferredUnitSystem: _defaultEnglish.system,
      units: _defaultEnglish,
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

  test('should load a user from storage', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockJWTResponse: UserResponse = mockJWTSuccess();

    userService.storageService.getUser = jest
      .fn()
      .mockReturnValue(of(_mockUser));

    userService.isLoggedIn = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    userService.checkJWToken = jest
      .fn()
      .mockReturnValue(of(_mockJWTResponse));

    userService.connectionService.setOfflineMode = jest
      .fn();

    userService.event.emit = jest
      .fn();

    userService.preferenceService.setUnits = jest
      .fn();

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const connSpy: jest.SpyInstance = jest.spyOn(userService.connectionService, 'setOfflineMode');
    const eventSpy: jest.SpyInstance = jest.spyOn(userService.event, 'emit');
    const prefSpy: jest.SpyInstance = jest.spyOn(userService.preferenceService, 'setUnits');

    userService.loadUserFromStorage();

    setTimeout((): void => {
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch(_mockJWTResponse.status);
      expect(connSpy).not.toHaveBeenCalled();
      expect(eventSpy).toHaveBeenNthCalledWith(1, 'init-recipes');
      expect(prefSpy).toHaveBeenNthCalledWith(1, _mockUser.preferredUnitSystem, _mockUser.units);

      userService.loadUserFromStorage();

      setTimeout((): void => {
        expect(connSpy).toHaveBeenCalledWith(true);
        expect(eventSpy).toHaveBeenNthCalledWith(2, 'init-recipes');
        expect(prefSpy).toHaveBeenNthCalledWith(2, _mockUser.preferredUnitSystem, _mockUser.units);
        done();
      }, 10);
    }, 10);
  });

  test('should handle errors trying to load user from storage', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();

    userService.storageService.getUser = jest
      .fn()
      .mockReturnValueOnce(of(_mockUser))
      .mockReturnValueOnce(throwError('get-error'));

    userService.isLoggedIn = jest
      .fn()
      .mockReturnValue(true);

    userService.checkJWToken = jest
      .fn()
      .mockReturnValue(throwError('<401> not authorized'));

    userService.clearUserData = jest
      .fn();

    userService.toastService.presentErrorToast = jest
      .fn();

    userService.navToHome = jest
      .fn();

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const clearSpy: jest.SpyInstance = jest.spyOn(userService, 'clearUserData');
    const toastSpy: jest.SpyInstance = jest.spyOn(userService.toastService, 'presentErrorToast');

    userService.loadUserFromStorage();

    setTimeout((): void => {
      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('jwt error');
      expect(consoleCalls[1]).toMatch('<401> not authorized');
      expect(clearSpy).toHaveBeenCalled();
      expect(toastSpy.mock.calls[0][0]).toMatch('Login has expired, please log in again');

      userService.loadUserFromStorage();

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('User load error: get-error');
        done();
      }, 10);
    }, 10);
  });

  test('should successfully log in (not on signup)', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockLoginCredentials: LoginCredentials = mockUserLogin();
    _mockLoginCredentials.remember = true;
    const _mockUserResponse: UserResponse = mockLoginResponse();

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

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    userService.logIn(_mockLoginCredentials, true)
      .subscribe(
        (user: User): void => {
          expect(user).toStrictEqual(_mockUser);
          const callCount: number = consoleSpy.mock.calls.length;
          const storeCalls: any[] = consoleSpy.mock.calls[callCount - 2];
          expect(storeCalls[0]).toMatch('User store error: storage-error');
          const syncCalls: any[] = consoleSpy.mock.calls[callCount - 1];
          expect(syncCalls[0]).toMatch('User login error');
          expect(syncCalls[1]).toMatch('sync-error');
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

    userService.httpError.handleError = jest
      .fn()
      .mockReturnValue(throwError('<404> not found'));

    userService.logIn(_mockLoginCredentials, false)
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

  test('should get an error on startup', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();

    userService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue(of([]));

    userService.composeImageUploadRequests = jest
      .fn()
      .mockReturnValue([]);

    userService.imageService.blobbifyImages = jest
      .fn()
      .mockReturnValue(of([]));

    userService.httpError.handleError = jest
      .fn()
      .mockImplementation((error: HttpErrorResponse): Observable<never> => {
        return throwError(`<${error.status}> ${error.statusText}`);
      });

    userService.signUp(_mockUser)
      .subscribe(
        (results): any => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('<404> not found');
          done();
        }
      );

    const postReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/signup`);
    expect(postReq.request.method).toMatch('POST');
    postReq.flush(null, mockErrorResponse(404, 'not found'));
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

  test('should update user storage', (done: jest.DoneCallback): void => {
    userService.storageService.setUser = jest
      .fn()
      .mockReturnValue(of({}));

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    userService.updateUserStorage();

    setTimeout((): void => {
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('user data stored');
      done();
    }, 10);
  });

  test('should get an error updating user storage', (done: jest.DoneCallback): void => {
    userService.storageService.setUser = jest
      .fn()
      .mockReturnValue(throwError('test-error'));

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    userService.updateUserStorage();

    setTimeout((): void => {
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('user store error: test-error');
      done();
    }, 10);
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

    userService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue([]);

    userService.imageService.blobbifyImages = jest
      .fn()
      .mockReturnValue(of([]));

    userService.httpError.handleError = jest
      .fn()
      .mockReturnValue(throwError('test-error'));

    userService.configureBackgroundRequest(_mockUser, false)
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

    const patchReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/users/profile`);
    expect(patchReq.request.method).toMatch('PATCH');
    patchReq.flush(null, mockErrorResponse(404, 'not found'));
  });

  test('should get an error configuring a background request that should resolve', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();

    userService.composeImageStoreRequests = jest
      .fn()
      .mockReturnValue([]);

    userService.imageService.blobbifyImages = jest
      .fn()
      .mockReturnValue(of([]));

    userService.httpError.handleError = jest
      .fn()
      .mockReturnValue(throwError('test-error'));

    userService.configureBackgroundRequest(_mockUser, true)
      .subscribe(
        (resolvedError: HttpErrorResponse): void => {
          expect(resolvedError.status).toEqual(404);
          expect(resolvedError.statusText).toMatch('not found');
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

  test('should get an error making request in background', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();

    userService.configureRequestBody = jest
      .fn()
      .mockReturnValue({});

    userService.configureBackgroundRequest = jest
      .fn()
      .mockReturnValue(throwError('test-error'));

    userService.toastService.presentErrorToast = jest
      .fn();

    const toastSpy: jest.SpyInstance = jest.spyOn(userService.toastService, 'presentErrorToast');

    userService.requestInBackground(_mockUser);

    setTimeout((): void => {
      expect(toastSpy).toHaveBeenCalledWith('User profile failed to save to server');
      done();
    }, 10);
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

});
