/* Module imports */
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { forkJoin, Observable, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockErrorResponse, mockImageRequestMetadata, mockInventoryItem } from '@test/mock-models';
import { ConnectionServiceStub, ErrorReportingServiceStub, InventoryImageServiceStub} from '@test/service-stubs';

/* Constants imports */
import { API_VERSION, BASE_URL, HIGH_SEVERITY } from '@shared/constants';

/* Interface imports*/
import { ImageRequestMetadata, InventoryItem } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { InventoryImageService } from '@services/inventory/image/inventory-image.service';
import { ConnectionService, ErrorReportingService } from '@services/public';
import { InventoryHttpService } from './inventory-http.service';


describe('InventoryHttpService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: InventoryHttpService;
  let httpMock: HttpTestingController;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        InventoryHttpService,
        { provide: ConnectionService, useClass: ConnectionServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: InventoryImageService, useClass: InventoryImageServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(InventoryHttpService);
    httpMock = injector.get(HttpTestingController);
    service.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: any) => Observable<never> => {
        return (error: any): Observable<never> => throwError(error);
      });
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should configure a background request', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    service.getBackgroundRequest = jest.fn().mockReturnValue(of(_mockInventoryItem));
    service.errorReporter.handleResolvableCatchError = jest.fn()
      .mockReturnValue(throwError(null));
    const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBackgroundRequest');

    service.configureSyncBackgroundRequest('post', true, _mockInventoryItem)
      .subscribe(
        (item: InventoryItem): void => {
          expect(item).toStrictEqual(_mockInventoryItem);
          expect(getSpy).toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should configure a background request'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should configure a background request that resolves an error without throwing it', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');
    service.getBackgroundRequest = jest.fn()
      .mockReturnValue(throwError(_mockErrorResponse));
    service.errorReporter.handleResolvableCatchError = jest.fn()
      .mockImplementation((): (error: any) => Observable<any> => {
        return (error: any): Observable<any> => {
          expect(error).toStrictEqual(_mockErrorResponse);
          return of(error);
        };
      });
    const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBackgroundRequest');
    const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleResolvableCatchError');

    service.configureSyncBackgroundRequest('post', true, _mockInventoryItem)
      .subscribe(
        (resolvedError: HttpErrorResponse): void => {
          expect(resolvedError.status).toEqual(404);
          expect(resolvedError.statusText).toMatch('not found');
          expect(getSpy).toHaveBeenCalled();
          expect(errorSpy).toHaveBeenCalledWith(true);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should configure a background request that resolves an error without throwing it'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should configure a background request that throws an error', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');
    service.getBackgroundRequest = jest.fn()
      .mockReturnValue(throwError(_mockErrorResponse));
    service.errorReporter.handleResolvableCatchError = jest.fn()
      .mockImplementation((): (error: any) => Observable<never> => {
        return (error: any): Observable<never> => {
          expect(error).toStrictEqual(_mockErrorResponse);
          return throwError(null);
        };
      });
    const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleResolvableCatchError');

    service.configureSyncBackgroundRequest('post', false, _mockInventoryItem)
      .subscribe(
        (results: any): void => {
          console.log('Should not get results', results);
          expect(true).toBe(false);
        },
        (error: any): void => {
          expect(errorSpy).toHaveBeenCalledWith(false);
          expect(error).toBeNull();
          done();
        }
      );
  });

  test('should get a background post request', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockImageRequestMetadata: ImageRequestMetadata = mockImageRequestMetadata();
    service.inventoryImageService.getImageRequest = jest.fn()
      .mockReturnValue(of([_mockImageRequestMetadata]));
    const postSpy: jest.SpyInstance = jest.spyOn(service.http, 'post');
    const mockFormData: FormData = new FormData();
    mockFormData.append('inventoryItem', JSON.stringify(_mockInventoryItem));
    mockFormData.append(
      _mockImageRequestMetadata.name,
      _mockImageRequestMetadata.blob,
      _mockImageRequestMetadata.filename
    );
    const route: string = `${BASE_URL}/${API_VERSION}/inventory`;

    service.getBackgroundRequest('post', _mockInventoryItem)
      .subscribe(
        (): void => {
          expect(postSpy.mock.calls[0][0]).toMatch(route);
          expect(postSpy.mock.calls[0][1]).toStrictEqual(mockFormData);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should get a background post request'`, error);
          expect(true).toBe(false);
        }
      );

    const postReq: TestRequest = httpMock.expectOne(route);
    expect(postReq.request.method).toMatch('POST');
    postReq.flush(_mockInventoryItem);
  });

  test('should get a background patch request', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockImageRequestMetadata: ImageRequestMetadata = mockImageRequestMetadata();
    service.inventoryImageService.getImageRequest = jest.fn()
      .mockReturnValue(of([_mockImageRequestMetadata]));
    const patchSpy: jest.SpyInstance = jest.spyOn(service.http, 'patch');
    const mockFormData: FormData = new FormData();
    mockFormData.append('inventoryItem', JSON.stringify(_mockInventoryItem));
    mockFormData.append(
      _mockImageRequestMetadata.name,
      _mockImageRequestMetadata.blob,
      _mockImageRequestMetadata.filename
    );
    const route: string = `${BASE_URL}/${API_VERSION}/inventory/${_mockInventoryItem._id}`;

    service.getBackgroundRequest('patch', _mockInventoryItem)
      .subscribe(
        (): void => {
          expect(patchSpy.mock.calls[0][0]).toMatch(route);
          expect(patchSpy.mock.calls[0][1]).toStrictEqual(mockFormData);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should get a background patch request'`, error);
          expect(true).toBe(false);
        }
      );

    const patchReq: TestRequest = httpMock.expectOne(route);
    expect(patchReq.request.method).toMatch('PATCH');
    patchReq.flush(_mockInventoryItem);
  });

  test('should get a background delete request', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    forkJoin(
      service.getBackgroundRequest('delete', null, 'delete-id'),
      service.getBackgroundRequest('delete', _mockInventoryItem)
    )
    .subscribe(
      (): void => {
        done();
      },
      (error: any): void => {
        console.log(`Error in 'should get a background delete request'`, error);
        expect(true).toBe(false);
      }
    );

    const delReq1: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/inventory/${_mockInventoryItem._id}`);
    expect(delReq1.request.method).toMatch('DELETE');
    delReq1.flush(_mockInventoryItem);
    const delReq2: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/inventory/delete-id`);
    expect(delReq2.request.method).toMatch('DELETE');
    delReq2.flush(_mockInventoryItem);
  });

  test('should get an error with invalid http method', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    service.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: Error) => Observable<never> => {
        return (error: Error): Observable<never> => {
          expect(error.message).toMatch('Invalid http method: invalid');
          return throwError(null);
        };
      });
    const _mockImageRequestMetadata: ImageRequestMetadata = mockImageRequestMetadata();
    service.inventoryImageService.getImageRequest = jest.fn()
      .mockReturnValue(of([_mockImageRequestMetadata]));

    service.getBackgroundRequest('invalid', _mockInventoryItem)
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

  test('should get inventory from server', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    service.getInventoryFromServer()
      .subscribe(
        (inventoryList: InventoryItem[]): void => {
          expect(inventoryList).toStrictEqual([_mockInventoryItem]);
          done();
        },
        (error: any): void => {
          console.log('Error in: should get inventory from server', error);
          expect(true).toBe(false);
        }
      );

    const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/inventory`);
    expect(getReq.request.method).toMatch('GET');
    getReq.flush([_mockInventoryItem]);
  });

  test('should make a background request', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    service.getBackgroundRequest = jest.fn().mockReturnValue(of(_mockInventoryItem));
    const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBackgroundRequest');

    service.requestInBackground('patch', _mockInventoryItem)
      .subscribe(
        (): void => {
          expect(getSpy).toHaveBeenCalledWith('patch', _mockInventoryItem);
          done();
        },
        (error: any): void => {
          console.log('error in: should make a background request', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get an unknown request type error when requesting in background with invalid method', (done: jest.DoneCallback): void => {
    service.requestInBackground('invalid', null)
      .subscribe(
        (results: any): void => {
          console.log('should not get results', results);
          expect(true).toBe(false);
        },
        (error: CustomError): void => {
          expect(error.name).toMatch('InventoryError');
          expect(error.message).toMatch('Unknown request type: invalid');
          expect(error.severity).toEqual(HIGH_SEVERITY);
          expect(error.userMessage).toMatch('Unknown request type: invalid');
          done();
        }
      );
  });

});
