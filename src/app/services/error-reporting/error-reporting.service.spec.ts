/* Module imports */
import { TestBed, async, getTestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Interface imports */
import { DeviceInfo, ErrorReport } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Mock imports */
import { mockDeviceInfo, mockErrorReport, mockErrorResponse } from '@test/mock-models';
import { DeviceServiceStub, LoggingServiceStub, ToastServiceStub } from '@test/service-stubs';
import { DateStub, ModalControllerStub, ModalStub } from '@test/ionic-stubs';

/* Component imports */
import { ErrorReportComponent } from '@components/system/public';

/* Service imports */
import { DeviceService, LoggingService, ToastService } from '@services/public';
import { ErrorReportingService } from './error-reporting.service';


describe('ErrorReportingService', () => {
  configureTestBed();
  let injector: TestBed;
  let service: ErrorReportingService;
  let originalTimestamp: any;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      providers: [
        ErrorReportingService,
        { provide: DeviceService, useClass: DeviceServiceStub },
        { provide: LoggingService, useClass: LoggingServiceStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: ToastService, useClass: ToastServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(ErrorReportingService);
    originalTimestamp = service.getTimestamp;
    service.getTimestamp = jest.fn().mockReturnValue('timestamp');
    service.device.getDeviceInfo = jest.fn().mockReturnValue(mockDeviceInfo());
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  describe('Error Report', (): void => {

    test('should clear error reports', (): void => {
      const _mockErrorReport: ErrorReport = mockErrorReport();
      service.reports = [ _mockErrorReport, _mockErrorReport ];

      service.clearErrorReport();

      expect(service.reports.length).toEqual(0);
    });

    test('should create an error report', (): void => {
      let dismissFlag: boolean = false;
      const _mockErrorReport: ErrorReport = mockErrorReport();
      const _mockDismissFn: () => void = () => {
        dismissFlag = true;
      };
      const createdReport: ErrorReport = service.createErrorReport(
        _mockErrorReport.name,
        _mockErrorReport.message,
        _mockErrorReport.severity,
        _mockErrorReport.userMessage,
        _mockDismissFn
      );

      expect(createdReport.name).toMatch(_mockErrorReport.name);
      expect(createdReport.message).toMatch(_mockErrorReport.message);
      expect(createdReport.severity).toEqual(_mockErrorReport.severity);
      expect(createdReport.timestamp).toMatch('timestamp');
      expect(createdReport.userMessage).toMatch(_mockErrorReport.userMessage);
      createdReport.dismissFn();
      expect(dismissFlag).toBe(true);
    });

    test('should get a custom error report from a given error and no overrides', (): void => {
      const _mockError: Error = new Error();
      _mockError.name = 'TestError';
      _mockError.message = 'test-error';
      service.getReportSeverity = jest.fn().mockReturnValue(2);
      service.getReportUserMessage = jest.fn().mockReturnValue(_mockError.message);
      const createReport: ErrorReport = service.getCustomReportFromError(_mockError);

      expect(createReport.name).toMatch(_mockError.name);
      expect(createReport.message).toMatch(_mockError.message);
      expect(createReport.severity).toEqual(2);
      expect(createReport.stackTrace).toMatch(_mockError.stack);
      expect(createReport.timestamp).toMatch('timestamp');
      expect(createReport.userMessage).toMatch(_mockError.message);
      expect(createReport.dismissFn).toBeNull();
    });

    test('should get a custom error report from a given error with overrides', (): void => {
      const _mockError: Error = new Error();
      _mockError.name = 'TestError';
      _mockError.message = 'test-error';
      let dismissFlag: boolean = false;
      const overrides: object = {
        name: 'OverrideError',
        message: 'override',
        severity: 3,
        userMessage: 'user message',
        dismissFn: () => dismissFlag = true
      };
      const createReport: ErrorReport = service.getCustomReportFromError(_mockError, overrides);

      expect(createReport.name).toMatch(overrides['name']);
      expect(createReport.message).toMatch(overrides['message']);
      expect(createReport.severity).toEqual(3);
      expect(createReport.stackTrace).toMatch(_mockError.stack);
      expect(createReport.timestamp).toMatch('timestamp');
      expect(createReport.userMessage).toMatch(overrides['userMessage']);
      createReport.dismissFn();
      expect(dismissFlag).toBe(true);
    });

    test('should get a custom error report from a given http error and no overrides', (): void => {
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'not found', 'test/url');
      service.getHeaders = jest.fn().mockReturnValue('header,header');
      service.getReportSeverity = jest.fn().mockReturnValue(2);
      service.getReportUserMessage = jest.fn().mockReturnValue(_mockHttpError.statusText);
      const createReport: ErrorReport = service.getCustomReportFromHttpError(_mockHttpError);

      expect(createReport.name).toMatch(_mockHttpError.name);
      expect(createReport.message).toMatch(_mockHttpError.message);
      expect(createReport.severity).toEqual(2);
      expect(createReport.statusCode).toEqual(_mockHttpError.status);
      expect(createReport.timestamp).toMatch('timestamp');
      expect(createReport.userMessage).toEqual(_mockHttpError.statusText);
      expect(createReport.dismissFn).toBeNull();
      expect(createReport.headers).toMatch('header,header');
      expect(createReport.url).toMatch('test/url');
    });

    test('should get a custom error report from a given http error with overrides', (): void => {
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'not found', 'test/url');
      console.log(_mockHttpError.status);
      service.getHeaders = jest.fn().mockReturnValue('header,header');
      let dismissFlag: boolean = false;
      const overrides: object = {
        name: 'OverrideError',
        message: 'override',
        severity: 3,
        userMessage: 'user message',
        dismissFn: () => dismissFlag = true
      };
      const createReport: ErrorReport = service.getCustomReportFromHttpError(_mockHttpError, overrides);

      expect(createReport.name).toMatch(overrides['name']);
      expect(createReport.message).toMatch(overrides['message']);
      expect(createReport.severity).toEqual(3);
      expect(createReport.statusCode).toEqual(_mockHttpError.status);
      expect(createReport.timestamp).toMatch('timestamp');
      expect(createReport.userMessage).toMatch(overrides['userMessage']);
      expect(createReport.headers).toMatch('header,header');
      expect(createReport.url).toMatch('test/url');
      createReport.dismissFn();
      expect(dismissFlag).toBe(true);
    });

    test('should set an error report with severity that requires viewing the report', (): void => {
      const _mockErrorReport: ErrorReport = mockErrorReport();
      _mockErrorReport.severity = 2;
      service.openReportModal = jest.fn();
      service.reports = [];
      service.isErrorModalOpen = false;
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'error');
      const modalSpy: jest.SpyInstance = jest.spyOn(service, 'openReportModal');

      service.setErrorReport(_mockErrorReport);

      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch(`${_mockErrorReport.name}: ${_mockErrorReport.message}`);
      expect(service.reports.length).toEqual(1);
      expect(modalSpy).toHaveBeenCalled();
      service.setErrorReport(_mockErrorReport);
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch(`${_mockErrorReport.name}: ${_mockErrorReport.message}`);
      expect(service.reports.length).toEqual(2);
      expect(modalSpy).toHaveBeenCalledTimes(1);
    });

    test('should set an error report with severity that only requires a toast warning', (): void => {
      const _mockErrorReport: ErrorReport = mockErrorReport();
      _mockErrorReport.severity = 3;
      service.logErrorReports = jest.fn();
      service.presentErrorToast = jest.fn();
      service.reports = [];
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'warn');
      const logSpy: jest.SpyInstance = jest.spyOn(service, 'logErrorReports');
      const toastSpy: jest.SpyInstance = jest.spyOn(service, 'presentErrorToast');

      service.setErrorReport(_mockErrorReport);

      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch(`${_mockErrorReport.name}: ${_mockErrorReport.message}`);
      expect(service.reports.length).toEqual(1);
      expect(toastSpy).toHaveBeenCalledWith(_mockErrorReport.userMessage, _mockErrorReport.dismissFn);
      expect(logSpy).toHaveBeenCalled();
    });

    test('should set an error report with severity that does not require user notification', (): void => {
      const _mockErrorReport: ErrorReport = mockErrorReport();
      _mockErrorReport.severity = 4;
      service.reports = [];
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const logSpy: jest.SpyInstance = jest.spyOn(service, 'logErrorReports');

      service.setErrorReport(_mockErrorReport);

      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch(`${_mockErrorReport.name}: ${_mockErrorReport.message}`);
      expect(service.reports.length).toEqual(0);
      expect(logSpy).not.toHaveBeenCalled();
    });

    test('should set an error report from a given error', (): void => {
      service.setErrorReport = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setErrorReport');
      const _mockCustomError: CustomError = new CustomError(
        'TestError',
        'test message',
        4,
        'test user message'
      );
      service.getCustomReportFromError = jest.fn().mockReturnValue(_mockCustomError);
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomReportFromError');

      service.setErrorReportFromCustomError(_mockCustomError);

      expect(getSpy).toHaveBeenCalledWith(_mockCustomError);
      expect(setSpy).toHaveBeenCalledWith(_mockCustomError);
    });

  });


  describe('Custom Error Handling', (): void => {

    test('should get a generic catch error handler with no override', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      const _mockErrorReport: ErrorReport = mockErrorReport();
      service.setErrorReport = jest.fn();
      service.getCustomReportFromError = jest.fn().mockReturnValue(_mockErrorReport);
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setErrorReport');
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomReportFromError');

      service.handleGenericCatchError()(_mockError)
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error).toBeNull();
            expect(getSpy).toHaveBeenCalledWith(_mockError);
            expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
            done();
          }
        );
    });

    test('should get a generic catch error handler with override', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      const _mockErrorOverride: Error = new Error('override-error');
      const _mockErrorReport: ErrorReport = mockErrorReport();
      service.setErrorReport = jest.fn();
      service.getCustomReportFromError = jest.fn().mockReturnValue(_mockErrorReport);
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setErrorReport');
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomReportFromError');

      service.handleGenericCatchError(_mockErrorOverride)(_mockError)
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error).toBeNull();
            expect(getSpy).toHaveBeenCalledWith(_mockErrorOverride);
            expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
            done();
          }
        );
    });

    test('should get a generic catch http error handler with no override', (done: jest.DoneCallback): void => {
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'not found');
      const _mockErrorReport: ErrorReport = mockErrorReport();
      service.setErrorReport = jest.fn();
      service.getCustomReportFromHttpError = jest.fn().mockReturnValue(_mockErrorReport);
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setErrorReport');
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomReportFromHttpError');

      service.handleGenericCatchError()(_mockHttpError)
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: HttpErrorResponse): void => {
            expect(error).toBeNull();
            expect(getSpy).toHaveBeenCalledWith(_mockHttpError);
            expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
            done();
          }
        );
    });

    test('should get a generic catch error handler that resolves an error with a replacement value', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      const _mockResolved: object = { resolved: true };

      service.handleResolvableCatchError<object>(true, _mockResolved)(_mockError)
        .subscribe(
          (resolved: object): void => {
            expect(resolved).toStrictEqual(_mockResolved);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get a generic catch error handler that resolves an error with a replacement value'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get a generic catch error handler that resolves an error with an observable of the error', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      service.handleResolvableCatchError<object>(true)(_mockError)
        .subscribe(
          (resolved: object): void => {
            expect(resolved).toStrictEqual(_mockError);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get a generic catch error handler that resolves an error with an observable of the error'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get a generic catch error handler that handles error as an error', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      const _mockErrorReport: ErrorReport = mockErrorReport();
      service.setErrorReport = jest.fn();
      service.getCustomReportFromError = jest.fn().mockReturnValue(_mockErrorReport);
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setErrorReport');
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomReportFromError');

      service.handleResolvableCatchError<object>(false)(_mockError)
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error).toBeNull();
            expect(getSpy).toHaveBeenCalledWith(_mockError);
            expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
            done();
          }
        );
    });

    test('should get a generic catch error handler that handles httperror as an error', (done: jest.DoneCallback): void => {
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'not found');
      const _mockErrorReport: ErrorReport = mockErrorReport();
      service.setErrorReport = jest.fn();
      service.getCustomReportFromHttpError = jest.fn().mockReturnValue(_mockErrorReport);
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setErrorReport');
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomReportFromHttpError');

      service.handleResolvableCatchError<object>(false)(_mockHttpError)
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error).toBeNull();
            expect(getSpy).toHaveBeenCalledWith(_mockHttpError);
            expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
            done();
          }
        );
    });

    test('should handle an unhandled error', (): void => {
      const _mockError: Error = new Error('test-error');
      const _mockFormatError: CustomError = new CustomError(
        'CustomError',
        'test-message',
        2,
        'test-user-message'
      );
      const _mockErrorReport: ErrorReport = mockErrorReport();
      service.setErrorReport = jest.fn();
      service.getCustomReportFromError = jest.fn().mockReturnValue(_mockErrorReport);
      service.formatUnhandledError = jest.fn().mockReturnValue(_mockFormatError);
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setErrorReport');
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomReportFromError');
      const formatSpy: jest.SpyInstance = jest.spyOn(service, 'formatUnhandledError');

      service.handleUnhandledError(_mockError);

      expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
      expect(getSpy).toHaveBeenCalledWith(_mockFormatError);
      expect(formatSpy).toHaveBeenCalledWith(_mockError);

      service.handleUnhandledError(null);

      expect(setSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(formatSpy).toHaveBeenCalledTimes(1);
    });

  });


  describe('Modal', (): void => {

    test('should handle generic modal error', (): void => {
      const message: string = 'test-error';
      const userMessage: string = 'test-user-message';
      const _mockErrorReport: ErrorReport = mockErrorReport();
      service.setErrorReport = jest.fn();
      service.createErrorReport = jest.fn().mockReturnValue(_mockErrorReport);
      const setSpy: jest.SpyInstance = jest.spyOn(service, 'setErrorReport');
      const createSpy: jest.SpyInstance = jest.spyOn(service, 'createErrorReport');

      service.handleModalError(message, userMessage);

      expect(createSpy).toHaveBeenCalledWith('ModalError', message, 4, userMessage);
      expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
    });

    test('should open an error report modal', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();
      _stubModal.onDidDismiss = jest.fn().mockReturnValue(Promise.resolve({ data: true }));
      _stubModal.present = jest.fn().mockReturnValue(Promise.resolve());
      service.modalCtrl.create = jest.fn().mockReturnValue(_stubModal);
      service.logErrorReports = jest.fn();
      service.clearErrorReport = jest.fn();
      service.navToHome = jest.fn();
      service.reports = [];
      const createSpy: jest.SpyInstance = jest.spyOn(service.modalCtrl, 'create');
      const logSpy: jest.SpyInstance = jest.spyOn(service, 'logErrorReports');
      const clearSpy: jest.SpyInstance = jest.spyOn(service, 'clearErrorReport');
      const navSpy: jest.SpyInstance = jest.spyOn(service, 'navToHome');

      service.openReportModal();

      setTimeout((): void => {
        expect(createSpy).toHaveBeenCalledWith({
          component: ErrorReportComponent,
          componentProps: {
            reports: [],
            shouldHideLoginButton: true
          }
        });
        expect(logSpy).toHaveBeenCalled();
        expect(clearSpy).toHaveBeenCalled();
        expect(navSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

  });


  describe('Message Helpers', (): void => {

    test('should get headers from http error response', (): void => {
      const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'not found');

      expect(service.getHeaders(_mockHttpError))
        .toMatch('content-type: application/json, Access-Control-Allow-Origin: *,');
    });

    test('should get error report severity', (): void => {
      const _mockError: Error = new Error();
      const _mockCustomError: CustomError = new CustomError('TestError', '', 3, '');
      const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');

      expect(service.getReportSeverity(_mockError)).toEqual(2);
      expect(service.getReportSeverity(_mockCustomError)).toEqual(3);
      expect(service.getReportSeverity(_mockErrorResponse)).toEqual(2);
    });

    test('should get error report severity', (): void => {
      const _mockError: Error = new Error('error');
      const _mockCustomError: CustomError = new CustomError('TestError', 'custom-error', 3, 'custom-error');
      const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');

      expect(service.getReportUserMessage(_mockError)).toMatch('An internal error occurred');
      expect(service.getReportUserMessage(_mockCustomError)).toMatch('custom-error');
      expect(service.getReportUserMessage(_mockErrorResponse)).toMatch('not found');
    });

    test('should get a timestamp', (): void => {
      service.getTimestamp = originalTimestamp;
      global.Date = DateStub as unknown as typeof Date;

      expect(service.getTimestamp()).toMatch('2020-01-01T00:00:00.000Z');
    });

    test('should format an unhandled error', (): void => {
      const unhandledError: any = { some: 'data' };
      const newError: CustomError = service.formatUnhandledError(unhandledError);

      expect(newError.name).toMatch('UncaughtError');
      expect(newError.message).toMatch('An unhandled error occurred: {\n\ \ "some": "data"\n}');
      expect(newError.severity).toEqual(2);
      expect(newError.userMessage).toMatch('An unhandled error occurred');
    });

    test('should format an unhandled error with message', (): void => {
      const unhandledError: Error = new Error('test-error');
      const newError: CustomError = service.formatUnhandledError(unhandledError);

      expect(newError.name).toMatch('UncaughtError');
      expect(newError.message).toMatch('An unhandled error occurred: test-error');
      expect(newError.severity).toEqual(2);
      expect(newError.userMessage).toMatch('An unhandled error occurred');
    });

  });


  describe('Other', (): void => {

    test('should log error reports', (): void => {
      const _mockErrorReport1: ErrorReport = mockErrorReport();
      const _mockErrorReport2: ErrorReport = mockErrorReport();
      const _mockDeviceInfo: DeviceInfo = mockDeviceInfo();
      service.reports = [ _mockErrorReport1, _mockErrorReport2 ];
      service.logger.logErrorReports = jest.fn();
      const logSpy: jest.SpyInstance = jest.spyOn(service.logger, 'logErrorReports');
      const deviceSpy: jest.SpyInstance = jest.spyOn(service.device, 'getDeviceInfo');

      service.logErrorReports();

      expect(logSpy).toHaveBeenCalledWith(service.reports);
      expect(deviceSpy).toHaveBeenCalledTimes(2);
      expect(_mockErrorReport1.device).toStrictEqual(_mockDeviceInfo);
      expect(_mockErrorReport2.device).toStrictEqual(_mockDeviceInfo);
    });

    test('should navigate to home page', (): void => {
      service.router.navigate = jest.fn();
      const navSpy: jest.SpyInstance = jest.spyOn(service.router, 'navigate');

      service.navToHome();

      expect(navSpy).toHaveBeenCalledWith(['/tabs/home'], { replaceUrl: true });
    });

    test('should present error toast', (): void => {
      service.toastService.presentErrorToast = jest.fn();
      const dismiss: () => void = (): void => {};
      const toastSpy: jest.SpyInstance = jest.spyOn(service.toastService, 'presentErrorToast');

      service.presentErrorToast('test-message', dismiss);

      expect(toastSpy).toHaveBeenLastCalledWith('test-message', dismiss);
    });

  });

});
