/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { ErrorReportingServiceStub } from '../../../../test-config/service-stubs';

/* Provider imports */
import { HttpErrorService } from './http-error.service';
import { ErrorReportingService } from '../services';


describe('HTTPErrorService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: HttpErrorService;

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
    service = injector.get(HttpErrorService);
    Object.assign(service.errorReporter, { moderateSeverity: 3 });
  });

  test('should compose a 401 error message', (): void => {
    const errorResponse: HttpErrorResponse = new HttpErrorResponse({
      status: service.NOT_AUTHORIZED_STATUS,
      statusText: '',
      error: {
        error: {
          message: 'Not Authorized'
        }
      }
    });

    expect(service.composeErrorMessage(errorResponse)).toMatch('Not Authorized');
  });

  test('should compose a 500 error message', (): void => {
    const errorResponse: HttpErrorResponse = new HttpErrorResponse({
      status: service.INTERNAL_SERVER_STATUS,
      statusText: 'test 500 error',
      error: { name: '' }
    });

    expect(service.composeErrorMessage(errorResponse)).toMatch('<500> test 500 error');
  });

  test('should compose a validation error message', (): void => {
    const errorResponse: HttpErrorResponse = new HttpErrorResponse({
      status: service.INTERNAL_SERVER_STATUS,
      statusText: 'test validation error',
      error: {
        name: 'ValidationError',
        message: 'a database validation error occurred'
      }
    });

    expect(service.composeErrorMessage(errorResponse)).toMatch('<500> test validation error');
  });

  test('should get generic 503 error', (): void => {
    const genericError: object = { message: 'generic error message' };
    expect(service.composeErrorMessage(<HttpErrorResponse>genericError)).toMatch('Unknown http error');
  });

  test('should handle an http error', (done: jest.DoneCallback): void => {
    const errorResponse: HttpErrorResponse = new HttpErrorResponse({
      status: service.INTERNAL_SERVER_STATUS,
      statusText: 'test 500 error',
      error: { name: '' }
    });
    service.errorReporter.setErrorReport = jest.fn();
    service.errorReporter.getTimestamp = jest.fn().mockReturnValue('test-iso');
    const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'setErrorReport');

    service.handleError(errorResponse)
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
            severity: service.errorReporter.moderateSeverity,
            timestamp: 'test-iso',
            userMessage: '<500> test 500 error'
          });
          done();
        }
      );
  });

});
