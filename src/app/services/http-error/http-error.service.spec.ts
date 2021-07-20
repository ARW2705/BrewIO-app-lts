/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { ErrorReportingServiceStub } from '../../../../test-config/service-stubs';

/* Provider imports */
import { HttpErrorService } from './http-error.service';
import { ErrorReportingService } from '../error-reporting/error-reporting.service';


describe('Process HTTP Error Service', (): void => {
  let injector: TestBed;
  let httpError: HttpErrorService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        HttpErrorService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    httpError = injector.get(HttpErrorService);
  });

  test('should compose a 401 error message', (): void => {
    const errorResponse: HttpErrorResponse = new HttpErrorResponse({
      status: 401,
      statusText: '',
      error: {
        error: {
          message: 'Not Authorized'
        }
      }
    });

    expect(httpError.composeErrorMessage(errorResponse)).toMatch('Not Authorized');
  });

  test('should compose a 500 error message', (): void => {
    const errorResponse: HttpErrorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'test 500 error',
      error: {
        name: ''
      }
    });

    expect(httpError.composeErrorMessage(errorResponse)).toMatch('<500> test 500 error');
  });

  test('should compose a validation error message', (): void => {
    const errorResponse: HttpErrorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'test validation error',
      error: {
        name: 'ValidationError',
        message: 'a database validation error occurred'
      }
    });

    expect(httpError.composeErrorMessage(errorResponse)).toMatch('<500> test validation error');
  });

  test('should get generic 503 error', (): void => {
    const genericError: object = {
      message: 'generic error message'
    };

    expect(httpError.composeErrorMessage(<HttpErrorResponse>genericError)).toMatch('Unknown http error');
  });

  test('should handle an http error', (done: jest.DoneCallback): void => {
    const errorResponse: HttpErrorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'test 500 error',
      error: {
        name: ''
      }
    });

    httpError.errorReporter.setErrorReport = jest
      .fn();

    httpError.errorReporter.getTimestamp = jest
      .fn()
      .mockReturnValue('test-iso');

    const errorSpy: jest.SpyInstance = jest.spyOn(httpError.errorReporter, 'setErrorReport');

    httpError.handleError(errorResponse)
      .subscribe(
        (results: any): void => {
          console.log('should not get results', results);
          expect(true).toBe(false);
        },
        (error: any): void => {
          expect(error).toBeNull();
          expect(errorSpy).toHaveBeenCalledWith({
            name: 'HttpError',
            message: '<500> test 500 error',
            severity: 3,
            timestamp: 'test-iso',
            userMessage: '<500> test 500 error'
          });
          done();
        }
      );
  });

});
