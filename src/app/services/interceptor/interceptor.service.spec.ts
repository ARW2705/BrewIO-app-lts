/* Module Imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

/* Constant imports */
import { API_VERSION } from '../../shared/constants/api-version';
import { BASE_URL } from '../../shared/constants/base-url';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Interface imports */
import { User } from '../../shared/interfaces/user';

/* Mock imports */
import { ToastServiceMock, UserServiceMock } from '../../../../test-config/mocks-app';
import { HttpMock } from '../../../../test-config/mocks-ionic';
import { mockUser } from '../../../../test-config/mock-models/mock-user';
import { mockErrorResponse } from '../../../../test-config/mock-models/mock-response';

/* Provider imports */
import { AuthorizedInterceptor, UnauthorizedInterceptor } from './interceptor.service';
import { UserService } from '../user/user.service';
import { ToastService } from '../toast/toast.service';


describe('InterceptorService', (): void => {
  let injector: TestBed;
  let httpMock: HttpTestingController;
  let userService: UserService;
  let mockHttpService: HttpMock;
  let toastService: ToastService;
  configureTestBed();

  beforeAll(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        HttpMock,
        { provide: UserService, useClass: UserServiceMock },
        { provide: ToastService, useClass: ToastServiceMock },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthorizedInterceptor,
          multi: true
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: UnauthorizedInterceptor,
          multi: true
        }
      ]
    });
  }));

  beforeAll(async((): void => {
    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    userService = injector.get(UserService);
    mockHttpService = injector.get(HttpMock);
    toastService = injector.get(ToastService);

    toastService.presentToast = jest
      .fn();
  }));

  afterEach((): void => {
    httpMock.verify();
  });

  describe('Authorized interceptor', (): void => {
    let authedService: AuthorizedInterceptor;

    beforeAll((): void => {
      authedService = injector.get(AuthorizedInterceptor);
      const _mockUser: User = mockUser();
      userService.getUser = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<User>(_mockUser));
      userService.getToken = jest
        .fn()
        .mockReturnValue(_mockUser.token);
    });

    test('should create authorized service', (): void => {
      expect(authedService).toBeDefined();
    });

    test('should have authorization header with token', (done: jest.DoneCallback): void => {
      const mockResponse: object = {
        status: 200,
        statusText: 'OK'
      };

      mockHttpService.get()
        .subscribe(
          (response: any): void => {
            expect(response).toBeTruthy();
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should have authorization header with token'`, error);
            expect(true).toBe(false);
          }
        );

      const req: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/mock`);

      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toMatch('bearer testtoken');

      req.flush(mockResponse);
    });

  });

  describe('Unauthorized interceptor', (): void => {
    let unauthedService: UnauthorizedInterceptor;

    beforeEach((): void => {
      unauthedService = injector.get(UnauthorizedInterceptor);
      userService.getUser = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<User>(null));
      userService.getToken = jest
        .fn()
        .mockReturnValue(undefined);
    });

    test('should create authorized service', (): void => {
      expect(unauthedService).toBeDefined();
    });

    test('should have authorization header of undefined and 401 error (logged in)', (done: jest.DoneCallback): void => {
      userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(true);

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      mockHttpService.get()
        .subscribe(
          (response: any): void => {
            console.log('Should have no response', response);
            expect(true).toBe(false);
          },
          (error: object): void => {
            expect(error['status']).toEqual(401);
            expect(error['statusText']).toMatch('Not Authorized');
            const consoleCall: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
            expect(consoleCall[0]).toMatch('Error intercept');
            expect(consoleCall[1] instanceof HttpErrorResponse).toBe(true);
            done();
          }
        );

      const req: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/mock`);

      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toMatch('undefined');

      req.flush(null, mockErrorResponse(401, 'Not Authorized'));
    });

  });

});
