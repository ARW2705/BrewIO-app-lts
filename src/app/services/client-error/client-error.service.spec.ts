/* Module imports */
import { TestBed, async, getTestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { ErrorReportingServiceStub } from '../../../../test-config/service-stubs';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Service imports */
import { ClientErrorService } from './client-error.service';
import { ErrorReportingService } from '../services';


describe('ClientErrorService', () => {
  let injector: TestBed;
  let clientError: ClientErrorService;
  let errorReporter: ErrorReportingService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        ClientErrorService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    clientError = injector.get(ClientErrorService);
    errorReporter = injector.get(ErrorReportingService);
    errorReporter.setErrorReport = jest.fn();
    errorReporter.getTimestamp = jest
      .fn()
      .mockReturnValue('timestamp');
    clientError.injector.get = jest
      .fn()
      .mockReturnValue(errorReporter);
  });

  test('should create the service', (): void => {
    expect(clientError).toBeTruthy();
  });

  test('should handle an error', (): void => {
    const _mockError: Error = new Error('test-error');

    clientError.createJSErrorReport = jest.fn();
    clientError.createUnknownErrorReport = jest.fn();

    const setSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'setErrorReport');
    const createSpy: jest.SpyInstance = jest.spyOn(clientError, 'createJSErrorReport');

    clientError.handleError(_mockError);

    expect(setSpy).toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalledWith(_mockError, 'timestamp');
  });

  test('should handle an error of unknown type', (): void => {
    const _mockUnknown: any = { test: true };

    clientError.createJSErrorReport = jest.fn();
    clientError.createUnknownErrorReport = jest.fn();

    const setSpy: jest.SpyInstance = jest.spyOn(errorReporter, 'setErrorReport');
    const createSpy: jest.SpyInstance = jest.spyOn(clientError, 'createUnknownErrorReport');

    clientError.handleError(_mockUnknown);

    expect(setSpy).toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalledWith(_mockUnknown, 'timestamp');
  });

  test('should create a JS Error report', (): void => {
    const _mockError: Error = new Error();
    _mockError.name = 'ErrorName';
    _mockError.message = 'test-error';

    const _mockCustomError: CustomError = new CustomError(
      'CustomName',
      'test-message',
      3,
      'test-user-message'
    );

    clientError.getUserMessage = jest
      .fn()
      .mockReturnValue('user-message');

    const getSpy: jest.SpyInstance = jest.spyOn(clientError, 'getUserMessage');

    expect(clientError.createJSErrorReport(_mockError, 'timestamp')).toStrictEqual({
      message: 'test-error',
      name: 'ErrorName',
      severity: 2,
      stackTrace: _mockError.stack,
      timestamp: 'timestamp',
      userMessage: 'user-message'
    });
    expect(getSpy).toHaveBeenNthCalledWith(1, _mockError);

    expect(clientError.createJSErrorReport(_mockCustomError, 'timestamp')).toStrictEqual({
      message: 'test-message',
      name: 'CustomName',
      severity: 3,
      stackTrace: _mockCustomError.stack,
      timestamp: 'timestamp',
      userMessage: 'user-message'
    });
    expect(getSpy).toHaveBeenNthCalledWith(2, _mockCustomError);
  });

  test('should create an unknown error report', (): void => {
    const _mockUnknown: any = { test: true };

    clientError.getUserMessage = jest
      .fn()
      .mockReturnValue('user-message');

    expect(clientError.createUnknownErrorReport(_mockUnknown, 'timestamp')).toStrictEqual({
      name: 'UnknownError',
      message: '{"test":true}',
      severity: 2,
      timestamp: 'timestamp',
      userMessage: 'user-message'
    });
  });

  test('should get a user message', (): void => {
    const _mockError: Error = new Error();
    _mockError.name = 'TypeError';

    const _mockCustomError: CustomError = new CustomError('CustomError', 'message', 2, 'user-message');

    const _mockUnknownButMessage: any = { message: 'test-message' };

    expect(clientError.getUserMessage(_mockError)).toMatch('A system error has occurred');
    expect(clientError.getUserMessage(_mockCustomError)).toMatch(_mockCustomError.userMessage);
    expect(clientError.getUserMessage(_mockUnknownButMessage)).toMatch('test-message');
    expect(typeof clientError.getUserMessage({})).toMatch('string');
    expect(clientError.getUserMessage({}).length).toEqual(0);
  });

});
