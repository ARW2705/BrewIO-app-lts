/* Module Imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';

/* Constant imports */
import { API_VERSION, BASE_URL } from '../../shared/constants';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockErrorReport, mockErrorResponse, mockUser, mockHttpErrorHandler } from '../../../../test-config/mock-models';
import { HttpStub } from '../../../../test-config/ionic-stubs';
import { ErrorReportingServiceStub, HttpErrorServiceStub, UserServiceStub } from '../../../../test-config/service-stubs';

/* Interface imports */
import { ErrorReport, User } from '../../shared/interfaces';

/* Service imports */
import { AuthorizeInterceptor, ErrorInterceptor } from './interceptor.service';
import { ErrorReportingService, HttpErrorService, UserService } from '../services';


describe('InterceptorService', (): void => {
  let injector: TestBed;
  let httpMock: HttpTestingController;
  let userService: UserService;
  let mockHttpService: HttpStub;
  configureTestBed();

  beforeAll(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        HttpStub,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: HttpErrorService, useClass: HttpErrorServiceStub },
        { provide: UserService, useClass: UserServiceStub },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthorizeInterceptor,
          multi: true
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        }
      ]
    });
  }));

  beforeAll(async((): void => {
    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    userService = injector.get(UserService);
    mockHttpService = injector.get(HttpStub);
  }));

  afterEach((): void => {
    httpMock.verify();
  });

  describe('Authorized interceptor', (): void => {
    let authedService: AuthorizeInterceptor;

    beforeAll((): void => {
      authedService = injector.get(ErrorInterceptor);
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

  describe('Error interceptor', (): void => {
    let unauthedService: ErrorInterceptor;
    let originalIsExempt: any;
    let originalReportError: any;
    let originalMessage: any;

    beforeEach((): void => {
      unauthedService = injector.get(ErrorInterceptor);
      userService.getUser = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<User>(null));
      userService.getToken = jest
        .fn()
        .mockReturnValue(undefined);
      originalIsExempt = unauthedService.isHandlerExempt;
      unauthedService.isHandlerExempt = jest
        .fn()
        .mockReturnValue(false);
      originalReportError = unauthedService.reportHttpError;
      unauthedService.reportHttpError = jest.fn();
      originalMessage = unauthedService.httpError.composeErrorMessage;
      unauthedService.httpError.composeErrorMessage = jest
        .fn()
        .mockReturnValue('http-error');
    });

    test('should create authorized service', (): void => {
      expect(unauthedService).toBeDefined();
    });

    test('should pass caught error to handler', (done: jest.DoneCallback): void => {
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'test-error', 'url');
      const _mockHandler: HttpHandler = mockHttpErrorHandler(_mockHttpError);

      unauthedService.handleHttpError = jest
        .fn()
        .mockReturnValue(throwError(null));

      const handleSpy: jest.SpyInstance = jest.spyOn(unauthedService, 'handleHttpError');

      unauthedService.intercept(null, _mockHandler)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toBeNull();
            expect(handleSpy).toHaveBeenCalled();
            done();
          }
        );
    });

    test('should handle 400 http error', (done: jest.DoneCallback): void => {
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(400, 'bad request', 'url');

      const reportSpy: jest.SpyInstance = jest.spyOn(unauthedService, 'reportHttpError');
      const composeSpy: jest.SpyInstance = jest.spyOn(unauthedService.httpError, 'composeErrorMessage');

      unauthedService.handleHttpError(_mockHttpError)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toBeNull();
            expect(composeSpy).toHaveBeenCalledWith(_mockHttpError);
            expect(reportSpy).toHaveBeenCalledWith(
              _mockHttpError,
              {
                severity: 2,
                userMessage: 'http-error'
              }
            );
            done();
          }
        );
    });

    test('should handle 401 http error', (done: jest.DoneCallback): void => {
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(401, 'not authorized', 'url');

      unauthedService.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(true);
      unauthedService.userService.logOut = jest.fn();

      const reportSpy: jest.SpyInstance = jest.spyOn(unauthedService, 'reportHttpError');
      const composeSpy: jest.SpyInstance = jest.spyOn(unauthedService.httpError, 'composeErrorMessage');
      const logoutSpy: jest.SpyInstance = jest.spyOn(unauthedService.userService, 'logOut');

      unauthedService.handleHttpError(_mockHttpError)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toBeNull();
            expect(composeSpy).toHaveBeenCalledWith(_mockHttpError);
            expect(reportSpy).toHaveBeenCalledWith(
              _mockHttpError,
              {
                severity: 3,
                userMessage: 'http-error'
              }
            );
            expect(logoutSpy).toHaveBeenCalled();
            done();
          }
        );
    });

    test('should handle 403 http error', (done: jest.DoneCallback): void => {
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(403, 'forbidden', 'url');

      const reportSpy: jest.SpyInstance = jest.spyOn(unauthedService, 'reportHttpError');
      const composeSpy: jest.SpyInstance = jest.spyOn(unauthedService.httpError, 'composeErrorMessage');

      unauthedService.handleHttpError(_mockHttpError)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toBeNull();
            expect(composeSpy).toHaveBeenCalledWith(_mockHttpError);
            expect(reportSpy).toHaveBeenCalledWith(
              _mockHttpError,
              {
                severity: 3,
                userMessage: 'http-error'
              }
            );
            done();
          }
        );
    });

    test('should rethrow 404 http error', (done: jest.DoneCallback): void => {
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'not found', 'url');

      unauthedService.handleHttpError(_mockHttpError)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toStrictEqual(_mockHttpError);
            done();
          }
        );
    });

    test('should handle 402 or > 404 http error', (done: jest.DoneCallback): void => {
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(500, 'internal error', 'url');

      const reportSpy: jest.SpyInstance = jest.spyOn(unauthedService, 'reportHttpError');
      const composeSpy: jest.SpyInstance = jest.spyOn(unauthedService.httpError, 'composeErrorMessage');

      unauthedService.handleHttpError(_mockHttpError)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toBeNull();
            expect(composeSpy).toHaveBeenCalledWith(_mockHttpError);
            expect(reportSpy).toHaveBeenCalledWith(
              _mockHttpError,
              {
                severity: 2,
                userMessage: 'http-error'
              }
            );
            done();
          }
        );
    });

    test('should check if error url should be exempt', (): void => {
      unauthedService.isHandlerExempt = originalIsExempt;

      const _mockHttpErrorExempt: HttpErrorResponse = mockErrorResponse(404, 'not found', 'url/reporting/error');
      const _mockHttpErrorNonExempt: HttpErrorResponse = mockErrorResponse(404, 'not found', 'url');

      expect(unauthedService.isHandlerExempt(_mockHttpErrorExempt)).toBe(true);
      expect(unauthedService.isHandlerExempt(_mockHttpErrorNonExempt)).toBe(false);
    });

    test('should report http error', (): void => {
      unauthedService.reportHttpError = originalReportError;

      const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'not found');
      const _mockErrorReport: ErrorReport = mockErrorReport();

      unauthedService.errorReporter.setErrorReport = jest.fn();
      unauthedService.errorReporter.getCustomReportFromHttpError = jest
        .fn()
        .mockReturnValue(_mockErrorReport);

      const setSpy: jest.SpyInstance = jest.spyOn(unauthedService.errorReporter, 'setErrorReport');
      const getSpy: jest.SpyInstance = jest.spyOn(unauthedService.errorReporter, 'getCustomReportFromHttpError');

      unauthedService.reportHttpError(_mockHttpError);

      expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
      expect(getSpy).toHaveBeenCalledWith(_mockHttpError, undefined);
    });

  });

});
