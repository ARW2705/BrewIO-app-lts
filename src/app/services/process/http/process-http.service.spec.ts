/* Module imports */
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

/* TestBed configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockBatch, mockErrorResponse } from '@test/mock-models';
import { ErrorReportingServiceStub, UtilityServiceStub } from '@test/service-stubs';

/* Constants imports */
import { API_VERSION, BASE_URL, HIGH_SEVERITY } from '@shared/constants';

/* Interface imports */
import { Batch } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ErrorReportingService, UtilityService } from '@services/public';
import { ProcessHttpService } from './process-http.service';


describe('ProcessHttpService', () => {
  configureTestBed();
  let injector: TestBed;
  let service: ProcessHttpService;
  let httpMock: HttpTestingController;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        ProcessHttpService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(ProcessHttpService);
    httpMock = injector.get(HttpTestingController);
    service.errorReporter.handleUnhandledError = jest.fn();
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    expect(service).toBeDefined();
  });

  test('should configure a background request', (done: jest.DoneCallback): void => {
    const _mockBatch: Batch = mockBatch();
    service.getBackgroundRequest = jest.fn().mockReturnValue(of(_mockBatch));
    service.errorReporter.handleResolvableCatchError = jest.fn();
    const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBackgroundRequest');

    service.configureBackgroundRequest('post', false, _mockBatch)
      .subscribe(
        (): void => {
          expect(getSpy).toHaveBeenCalledWith('post', _mockBatch);
          done();
        },
        (error: any): void => {
          console.log('Error in: should configure a background request', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get an error response from background request', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    service.getBackgroundRequest = jest.fn().mockReturnValue(throwError(_mockError));
    service.errorReporter.handleResolvableCatchError = jest.fn()
      .mockImplementation((): (error: Error) => Observable<never> => {
        return (error: Error): Observable<never> => {
          expect(error).toStrictEqual(_mockError);
          return throwError(null);
        };
      });

    service.configureBackgroundRequest('post', false, null)
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: any): void => {
          expect(error).toBeNull();
          done();
        }
      );
  });

  test('should resolve an error response from background request', (done: jest.DoneCallback): void => {
    const _mockHttpErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');
    service.getBackgroundRequest = jest.fn().mockReturnValue(throwError(_mockHttpErrorResponse));
    service.errorReporter.handleResolvableCatchError = jest.fn()
      .mockImplementation((): (error: Error) => Observable<any> => {
        return (error: Error): Observable<any> => {
          expect(error).toStrictEqual(_mockHttpErrorResponse);
          return of(error);
        };
      });
    const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleResolvableCatchError');

    service.configureBackgroundRequest('post', true, null)
      .subscribe(
        (resolvedError: HttpErrorResponse): void => {
          expect(errorSpy).toHaveBeenCalledWith(true);
          expect(resolvedError).toStrictEqual(_mockHttpErrorResponse);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should resolve an error response from background request'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get all batches', (done: jest.DoneCallback): void => {
    const _mockBatchActive: Batch = mockBatch();
    const _mockBatchArchive: Batch = mockBatch();
    _mockBatchArchive.isArchived = true;

    service.getAllBatches()
      .subscribe(
        (batchList: { activeBatches: Batch[], archiveBatches: Batch[] }): void => {
          expect(batchList.activeBatches).toStrictEqual([_mockBatchActive]);
          expect(batchList.archiveBatches).toStrictEqual([_mockBatchArchive]);
          done();
        },
        (error: any): void => {
          console.log('Error in: should get all batches', error);
          expect(true).toBe(false);
        }
      );

    const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/process/batch`);
    expect(getReq.request.method).toMatch('GET');
    getReq.flush({ activeBatches: [_mockBatchActive], archiveBatches: [_mockBatchArchive] });
  });

  test('should get a background post request', (done: jest.DoneCallback): void => {
    const _mockBatch: Batch = mockBatch();

    service.getBackgroundRequest('post', _mockBatch)
      .subscribe(
        (batch: Batch): void => {
          expect(batch).toStrictEqual(_mockBatch);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should get a background post request'`, error);
          expect(true).toBe(false);
        }
      );

    const postReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/process/user/${_mockBatch.owner}/master/${_mockBatch.recipeMasterId}/variant/${_mockBatch.recipeVariantId}`);
    expect(postReq.request.method).toMatch('POST');
    postReq.flush(_mockBatch);
  });

  test('should get a background patch request', (done: jest.DoneCallback): void => {
    const _mockBatch: Batch = mockBatch();

    service.getBackgroundRequest('patch', _mockBatch)
      .subscribe(
        (batch: Batch): void => {
          expect(batch).toStrictEqual(_mockBatch);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should get a background patch request'`, error);
          expect(true).toBe(false);
        }
      );

    const patchReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/process/batch/${_mockBatch._id}`);
    expect(patchReq.request.method).toMatch('PATCH');
    patchReq.flush(_mockBatch);
  });

  test('should get an error getting a background request', (done: jest.DoneCallback): void => {
    const _mockBatch: Batch = mockBatch();

    service.getBackgroundRequest('invalid', _mockBatch)
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: Error): void => {
          expect(error.message).toMatch('Invalid http method');
          done();
        }
      );

    httpMock.expectNone(`${BASE_URL}/${API_VERSION}/process/user/${_mockBatch.owner}/master/${_mockBatch.recipeMasterId}/variant/${_mockBatch.recipeVariantId}`);
    httpMock.expectNone(`${BASE_URL}/${API_VERSION}/process/batch/${_mockBatch._id}`);
  });

  test('should perform a background request', (done: jest.DoneCallback): void => {
    const _mockBatch: Batch = mockBatch();
    service.getBackgroundRequest = jest.fn().mockReturnValue(of(_mockBatch));
    const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBackgroundRequest');

    service.requestInBackground('post', _mockBatch)
      .subscribe(
        (batch: Batch): void => {
          expect(batch).toStrictEqual(_mockBatch);
          expect(getSpy).toHaveBeenCalledWith('post', _mockBatch);
          done();
        },
        (error: any): void => {
          console.log('Error in: should perform a background request', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get an error for an invalid request method', (done: jest.DoneCallback): void => {
    service.requestInBackground('invalid', null)
      .subscribe(
        (results: any): void => {
          console.log('should not get results', results);
          expect(true).toBe(false);
        },
        (error: CustomError): void => {
          const errMsg: string = 'Unknown method type: invalid';
          expect(error.name).toMatch('BatchError');
          expect(error.message).toMatch(errMsg);
          expect(error.severity).toEqual(HIGH_SEVERITY);
          expect(error.userMessage).toMatch(errMsg);
          done();
        }
      );
  });

});
