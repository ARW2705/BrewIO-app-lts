/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { EMPTY, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Interface impots */
import { ErrorReport } from '@shared/interfaces';

/* Constant imports */
import { API_VERSION, BASE_URL } from '@shared/constants';

/* Mock imports */
import { mockErrorReport, mockErrorResponse } from '@test/mock-models';
import { ConnectionServiceStub, StorageServiceStub } from '@test/service-stubs';

/* Service imports */
import { ConnectionService, StorageService } from '@services/public';
import { LoggingService } from './logging.service';

describe('LoggingService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: LoggingService;
  let connection: ConnectionService;
  let httpMock: HttpTestingController;
  let originalSend: any;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        LoggingService,
        { provide: ConnectionService, useClass: ConnectionServiceStub },
        { provide: StorageService, useClass: StorageServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    connection = injector.get(ConnectionService);
    httpMock = injector.get(HttpTestingController);
    connection.listenForConnection = jest.fn().mockReturnValue(EMPTY);
    service = injector.get(LoggingService);
    originalSend = service.sendReportsOnConnection;
    service.sendReportsOnConnection = jest.fn();
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should send reports on connection', (done: jest.DoneCallback): void => {
    const _connection: ConnectionService = new ConnectionServiceStub() as ConnectionService;
    _connection.listenForConnection = jest.fn().mockReturnValue(of(null).pipe(delay(10)));
    const _service: LoggingService = new LoggingService(_connection, null, null);
    _service.sendReportsOnConnection = jest.fn();
    const sendSpy: jest.SpyInstance = jest.spyOn(_service, 'sendReportsOnConnection');

    setTimeout((): void => {
      expect(sendSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should log error reports', (done: jest.DoneCallback): void => {
    const _mockErrorReport: ErrorReport = mockErrorReport();
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    service.logErrorReports([ _mockErrorReport ]);

    setTimeout((): void => {
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('error reports sent');
      done();
    }, 10);
    const req: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/reporting/error`);
    req.flush({});
  });

  test('should store errors on log error reports error response', (done: jest.DoneCallback): void => {
    const _mockErrorReport: ErrorReport = mockErrorReport();
    service.storeErrorReports = jest.fn().mockReturnValue(of(null));
    const storeSpy: jest.SpyInstance = jest.spyOn(service, 'storeErrorReports');

    service.logErrorReports([ _mockErrorReport ]);

    setTimeout((): void => {
      expect(storeSpy).toHaveBeenCalledWith([ _mockErrorReport ]);
      done();
    }, 10);
    const req: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/reporting/error`);
    req.flush(null, mockErrorResponse(404, 'not found'));
  });

  test('should send error reports on connection', (done: jest.DoneCallback): void => {
    service.sendReportsOnConnection = originalSend;
    const _mockErrorReport: ErrorReport = mockErrorReport();
    service.storage.getErrorReports = jest.fn().mockReturnValue(of([_mockErrorReport]));
    service.logErrorReports = jest.fn();
    const logSpy: jest.SpyInstance = jest.spyOn(service, 'logErrorReports');

    service.sendReportsOnConnection();

    setTimeout((): void => {
      expect(logSpy).toHaveBeenCalledWith([_mockErrorReport]);
      done();
    }, 10);
  });

  test('should store error reports', (done: jest.DoneCallback): void => {
    const _mockErrorReport1: ErrorReport = mockErrorReport();
    const _mockErrorReport2: ErrorReport = mockErrorReport();
    service.storage.getErrorReports = jest.fn().mockReturnValue(of([_mockErrorReport1]));
    service.storage.setErrorReports = jest.fn().mockReturnValue(of(null));
    const setSpy: jest.SpyInstance = jest.spyOn(service.storage, 'setErrorReports');

    service.storeErrorReports([_mockErrorReport2])
      .subscribe(
        (): void => {
          expect(setSpy).toHaveBeenCalledWith([ _mockErrorReport1, _mockErrorReport2 ]);
          done();
        },
        (error: any): void => {
          console.log(`Error in: 'should store error reports'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should store reports substituting an error response from get with an empty array', (done: jest.DoneCallback): void => {
    const _mockErrorReport2: ErrorReport = mockErrorReport();
    service.storage.getErrorReports = jest.fn().mockReturnValue(throwError(''));
    service.storage.setErrorReports = jest.fn().mockReturnValue(of(null));
    const setSpy: jest.SpyInstance = jest.spyOn(service.storage, 'setErrorReports');

    service.storeErrorReports([_mockErrorReport2])
      .subscribe(
        (): void => {
          expect(setSpy).toHaveBeenCalledWith([ _mockErrorReport2 ]);
          done();
        },
        (error: any): void => {
          console.log(`Error in: 'should store error reports'`, error);
          expect(true).toBe(false);
        }
      );
  });

});
