/* Module imports */
import { TestBed, async, getTestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Interface imports */
import { DeviceInfo, ErrorReport } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Mock imports */
import { mockDeviceInfo, mockErrorReport, mockErrorResponse } from '../../../../test-config/mock-models';
import { DeviceServiceStub, LoggingServiceStub, ToastServiceStub } from '../../../../test-config/service-stubs';
import { DateStub, ModalControllerStub, ModalStub } from '../../../../test-config/ionic-stubs';

/* Component imports */
import { ErrorReportPage } from '../../pages/error-report/error-report.page';

/* Service imports */
import { ErrorReportingService } from './error-reporting.service';
import { DeviceService, LoggingService, ToastService } from '../services';


describe('ErrorReportingService', () => {
  let injector: TestBed;
  let errorReporter: ErrorReportingService;
  let originalTimestamp: any;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
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
    errorReporter = injector.get(ErrorReportingService);
    originalTimestamp = errorReporter.getTimestamp;
    errorReporter.getTimestamp = jest
      .fn()
      .mockReturnValue('timestamp');
    errorReporter.device.getDeviceInfo = jest
      .fn()
      .mockReturnValue(mockDeviceInfo());
  });

  test('should create the service', (): void => {
    expect(errorReporter).toBeTruthy();
  });

  test('should clear error reports', (): void => {
    const _mockErrorReport: ErrorReport = mockErrorReport();

    errorReporter.reports = [ _mockErrorReport, _mockErrorReport ];

    errorReporter.clearErrorReport();

    expect(errorReporter.reports.length).toEqual(0);
  });

  test('should create an error report', (): void => {
    let dismissFlag: boolean = false;
    const _mockErrorReport: ErrorReport = mockErrorReport();
    const _mockDismissFn: () => void = () => {
      dismissFlag = true;
    };

    const createdReport: ErrorReport = errorReporter.createErrorReport(
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

    const createReport: ErrorReport = errorReporter.getCustomReportFromError(_mockError);

    expect(createReport.name).toMatch(_mockError.name);
    expect(createReport.message).toMatch(_mockError.message);
    expect(createReport.severity).toEqual(2);
    expect(createReport.stackTrace).toMatch(_mockError.stack);
    expect(createReport.timestamp).toMatch('timestamp');
    expect(createReport.userMessage.length).toEqual(0);
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

    const createReport: ErrorReport = errorReporter.getCustomReportFromError(_mockError, overrides);

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

    errorReporter.getHeaders = jest
      .fn()
      .mockReturnValue('header,header');

    const createReport: ErrorReport = errorReporter.getCustomReportFromHttpError(_mockHttpError);

    expect(createReport.name).toMatch(_mockHttpError.name);
    expect(createReport.message).toMatch(_mockHttpError.message);
    expect(createReport.severity).toEqual(2);
    expect(createReport.statusCode).toEqual(_mockHttpError.status);
    expect(createReport.timestamp).toMatch('timestamp');
    expect(createReport.userMessage.length).toEqual(0);
    expect(createReport.dismissFn).toBeNull();
    expect(createReport.headers).toMatch('header,header');
    expect(createReport.url).toMatch('test/url');
  });

  test('should get a custom error report from a given http error with overrides', (): void => {
    const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'not found', 'test/url');
    console.log(_mockHttpError.status);
    errorReporter.getHeaders = jest
      .fn()
      .mockReturnValue('header,header');

    let dismissFlag: boolean = false;
    const overrides: object = {
      name: 'OverrideError',
      message: 'override',
      severity: 3,
      userMessage: 'user message',
      dismissFn: () => dismissFlag = true
    };

    const createReport: ErrorReport = errorReporter.getCustomReportFromHttpError(_mockHttpError, overrides);

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

    errorReporter.logErrorReports = jest.fn();
    errorReporter.openReportModal = jest.fn();

    errorReporter.reports = [];
    errorReporter.isErrorModalOpen = false;

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'error');
    const logSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'logErrorReports');
    const modalSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'openReportModal');

    errorReporter.setErrorReport(_mockErrorReport);

    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch(`${_mockErrorReport.name}: ${_mockErrorReport.message}`);
    expect(errorReporter.reports.length).toEqual(1);
    expect(modalSpy).toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();

    errorReporter.setErrorReport(_mockErrorReport);

    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch(`${_mockErrorReport.name}: ${_mockErrorReport.message}`);
    expect(errorReporter.reports.length).toEqual(2);
    expect(modalSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalled();
  });

  test('should set an error report with severity that only requires a toast warning', (): void => {
    const _mockErrorReport: ErrorReport = mockErrorReport();
    _mockErrorReport.severity = 3;

    errorReporter.logErrorReports = jest.fn();
    errorReporter.presentErrorToast = jest.fn();

    errorReporter.reports = [];

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'warn');
    const logSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'logErrorReports');
    const toastSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'presentErrorToast');

    errorReporter.setErrorReport(_mockErrorReport);

    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch(`${_mockErrorReport.name}: ${_mockErrorReport.message}`);
    expect(errorReporter.reports.length).toEqual(1);
    expect(toastSpy).toHaveBeenCalledWith(_mockErrorReport.userMessage, _mockErrorReport.dismissFn);
    expect(logSpy).toHaveBeenCalled();
  });

  test('should set an error report with severity that does not require user notification', (): void => {
    const _mockErrorReport: ErrorReport = mockErrorReport();
    _mockErrorReport.severity = 4;

    errorReporter.reports = [];

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const logSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'logErrorReports');

    errorReporter.setErrorReport(_mockErrorReport);

    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch(`${_mockErrorReport.name}: ${_mockErrorReport.message}`);
    expect(errorReporter.reports.length).toEqual(0);
    expect(logSpy).not.toHaveBeenCalled();
  });

  test('should get a generic catch error handler with no override', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    const _mockErrorReport: ErrorReport = mockErrorReport();

    errorReporter.setErrorReport = jest.fn();
    errorReporter.getCustomReportFromError = jest
      .fn()
      .mockReturnValue(_mockErrorReport);

    const setSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'setErrorReport');
    const getSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'getCustomReportFromError');

    errorReporter.handleGenericCatchError()(_mockError)
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

    errorReporter.setErrorReport = jest.fn();
    errorReporter.getCustomReportFromError = jest
      .fn()
      .mockReturnValue(_mockErrorReport);

    const setSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'setErrorReport');
    const getSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'getCustomReportFromError');

    errorReporter.handleGenericCatchError(_mockErrorOverride)(_mockError)
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

    errorReporter.setErrorReport = jest.fn();
    errorReporter.getCustomReportFromHttpError = jest
      .fn()
      .mockReturnValue(_mockErrorReport);

    const setSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'setErrorReport');
    const getSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'getCustomReportFromHttpError');

    errorReporter.handleGenericCatchError()(_mockHttpError)
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

    errorReporter.handleResolvableCatchError<object>(true, _mockResolved)(_mockError)
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

  test('should get a generic catch error handler that handles error as an error', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    const _mockErrorReport: ErrorReport = mockErrorReport();

    errorReporter.setErrorReport = jest.fn();
    errorReporter.getCustomReportFromError = jest
      .fn()
      .mockReturnValue(_mockErrorReport);

    const setSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'setErrorReport');
    const getSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'getCustomReportFromError');

    errorReporter.handleResolvableCatchError<object>(false)(_mockError)
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

  test('should get a generic catch error handler that handles error as an error', (done: jest.DoneCallback): void => {
    const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'not found');
    const _mockErrorReport: ErrorReport = mockErrorReport();

    errorReporter.setErrorReport = jest.fn();
    errorReporter.getCustomReportFromHttpError = jest
      .fn()
      .mockReturnValue(_mockErrorReport);

    const setSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'setErrorReport');
    const getSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'getCustomReportFromHttpError');

    errorReporter.handleResolvableCatchError<object>(false)(_mockHttpError)
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

    errorReporter.setErrorReport = jest.fn();
    errorReporter.getCustomReportFromError = jest
      .fn()
      .mockReturnValue(_mockErrorReport);
    errorReporter.formatUnhandledError = jest
      .fn()
      .mockReturnValue(_mockFormatError);

    const setSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'setErrorReport');
    const getSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'getCustomReportFromError');
    const formatSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'formatUnhandledError');

    errorReporter.handleUnhandledError(_mockError);

    expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
    expect(getSpy).toHaveBeenCalledWith(_mockFormatError);
    expect(formatSpy).toHaveBeenCalledWith(_mockError);

    errorReporter.handleUnhandledError(null);

    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(formatSpy).toHaveBeenCalledTimes(1);
  });

  test('should handle generic modal error', (): void => {
    const message: string = 'test-error';
    const userMessage: string = 'test-user-message';
    const _mockErrorReport: ErrorReport = mockErrorReport();

    errorReporter.setErrorReport = jest.fn();
    errorReporter.createErrorReport = jest
      .fn()
      .mockReturnValue(_mockErrorReport);

    const setSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'setErrorReport');
    const createSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'createErrorReport');

    errorReporter.handleModalError(message, userMessage);

    expect(createSpy).toHaveBeenCalledWith('ModalError', message, 4, userMessage);
    expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
  });

  test('should open an error report modal', (done: jest.DoneCallback): void => {
    const _stubModal: ModalStub = new ModalStub();
    _stubModal.onDidDismiss = jest
      .fn()
      .mockReturnValue(Promise.resolve({ data: true }));
    _stubModal.present = jest
      .fn()
      .mockReturnValue(Promise.resolve());

    errorReporter.modalCtrl.create = jest
      .fn()
      .mockReturnValue(_stubModal);
    errorReporter.logErrorReports = jest.fn();
    errorReporter.clearErrorReport = jest.fn();
    errorReporter.navToHome = jest.fn();
    errorReporter.reports = [];

    const createSpy: jest.SpyInstance = jest.spyOn(errorReporter.modalCtrl, 'create');
    const logSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'logErrorReports');
    const clearSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'clearErrorReport');
    const navSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'navToHome');

    errorReporter.openReportModal();

    setTimeout((): void => {
      expect(createSpy).toHaveBeenCalledWith({
        component: ErrorReportPage,
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

  test('should get headers from http error response', (): void => {
    const _mockHttpError: HttpErrorResponse = mockErrorResponse(404, 'not found');

    expect(errorReporter.getHeaders(_mockHttpError))
      .toMatch('content-type: application/json, Access-Control-Allow-Origin: *,');
  });

  test('should get a timestamp', (): void => {
    errorReporter.getTimestamp = originalTimestamp;

    global.Date = DateStub as unknown as typeof Date;

    expect(errorReporter.getTimestamp()).toMatch('2020-01-01T00:00:00.000Z');
  });

  test('should format an unhandled error', (): void => {
    const unhandledError: any = { some: 'data' };

    const newError: CustomError = errorReporter.formatUnhandledError(unhandledError);

    expect(newError.name).toMatch('UncaughtError');
    expect(newError.message).toMatch('An unhandled error occurred: {\n\ \ "some": "data"\n}');
    expect(newError.severity).toEqual(2);
    expect(newError.userMessage).toMatch('An unhandled error occurred');
  });

  test('should log error reports', (): void => {
    const _mockErrorReport1: ErrorReport = mockErrorReport();
    const _mockErrorReport2: ErrorReport = mockErrorReport();
    const _mockDeviceInfo: DeviceInfo = mockDeviceInfo();

    errorReporter.reports = [ _mockErrorReport1, _mockErrorReport2 ];

    errorReporter.logger.logErrorReports = jest.fn();

    const logSpy: jest.SpyInstance = jest.spyOn(errorReporter.logger, 'logErrorReports');
    const deviceSpy: jest.SpyInstance = jest.spyOn(errorReporter.device, 'getDeviceInfo');

    errorReporter.logErrorReports();

    expect(logSpy).toHaveBeenCalledWith(errorReporter.reports);
    expect(deviceSpy).toHaveBeenCalledTimes(2);
    expect(_mockErrorReport1.device).toStrictEqual(_mockDeviceInfo);
    expect(_mockErrorReport2.device).toStrictEqual(_mockDeviceInfo);
  });

  test('should navigate to home page', (): void => {
    errorReporter.router.navigate = jest.fn();

    const navSpy: jest.SpyInstance = jest.spyOn(errorReporter.router, 'navigate');

    errorReporter.navToHome();

    expect(navSpy).toHaveBeenCalledWith(['/tabs/home']);
  });

  test('should present error toast', (): void => {
    errorReporter.toastService.presentErrorToast = jest.fn();
    const dismiss: () => void = (): void => {};

    const toastSpy: jest.SpyInstance = jest.spyOn(errorReporter.toastService, 'presentErrorToast');

    errorReporter.presentErrorToast('test-message', dismiss);

    expect(toastSpy).toHaveBeenLastCalledWith('test-message', dismiss);
  });

});
