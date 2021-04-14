/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Provider imports */
import { HttpErrorService } from './http-error.service';


describe('Process HTTP Error Service', (): void => {
  let injector: TestBed;
  let processHttpService: HttpErrorService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [ HttpErrorService ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    processHttpService = injector.get(HttpErrorService);
  });

  test('should get 401 HttpErrorResponse', (done: jest.DoneCallback): void => {
    const errorResponse: HttpErrorResponse = new HttpErrorResponse({
      status: 401,
      statusText: '',
      error: {
        error: {
          message: 'Not authorized'
        }
      }
    });

    processHttpService.handleError(errorResponse)
      .subscribe(
        (response: any): void => {
          console.log('Should not get a response', response);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('Not authorized');
          done();
        }
      );
  }); // end 'should get 401 HttpErrorResponse' test

  test('should get 500 HttpErrorResponse', (done: jest.DoneCallback): void => {
    const errorResponse: HttpErrorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'test 500 error',
      error: {
        name: ''
      }
    });

    processHttpService.handleError(errorResponse)
      .subscribe(
        (response: any): void => {
          console.log('Should not get a response', response);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('<500> test 500 error');
          done();
        }
      );
  }); // end 'should get 500 HttpErrorResponse' test

  test('should get ValidationError', (done: jest.DoneCallback): void => {
    const errorResponse: HttpErrorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'test validation error',
      error: {
        name: 'ValidationError',
        message: 'a database validation error occurred'
      }
    });

    processHttpService.handleError(errorResponse)
      .subscribe(
        (response: any): void => {
          console.log('Should not get a response', response);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('<500> test validation error');
          done();
        }
      );
  }); // end 'should get ValidationError' test

  test('should get 503 generic error with message', (done: jest.DoneCallback): void => {
    const genericError: object = {
      status: 503,
      message: 'generic error message'
    };

    processHttpService.handleError(genericError).subscribe(
      (response: any): void => {
        console.log('Should not get a response', response);
        expect(true).toBe(false);
      },
      (error: string): void => {
        expect(error).toMatch('generic error message');
        done();
      }
    );
  }); // end 'should get 503 generic error with message' test

  test('should get 500 generic error', (done: jest.DoneCallback): void => {
    const genericError: string = '500 Internal Server Error';

    processHttpService.handleError(genericError)
      .subscribe(
        (response: any): void => {
          console.log('Should not get a response', response);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch(genericError);
          done();
        }
      );
  }); // end 'should get 500 generic error' test

});
