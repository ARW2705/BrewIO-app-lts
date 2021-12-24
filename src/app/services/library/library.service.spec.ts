/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/* Test bed configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockGrains, mockHops, mockYeast, mockStyles, mockErrorResponse } from '@test/mock-models';
import { ErrorReportingServiceStub, TypeGuardServiceStub, StorageServiceStub } from '@test/service-stubs';

/* Constants imports */
import { API_VERSION, BASE_URL } from '@shared/constants';

/* Interface imports */
import { Grains, Hops, Style, Yeast } from '@shared/interfaces';

/* Service imports */
import { ErrorReportingService, StorageService, TypeGuardService } from '@services/public';
import { LibraryService } from './library.service';


describe('LibraryService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: LibraryService;
  let httpMock: HttpTestingController;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        LibraryService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: StorageService, useClass: StorageServiceStub },
        { provide: TypeGuardService, useClass: TypeGuardServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(LibraryService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  describe('API Methods', (): void => {

    test('should fetch all libraries from server', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      const _mockHops: Hops[] = mockHops();
      const _mockYeast: Yeast[] = mockYeast();
      const _mockStyles: Style[] = mockStyles();
      service.fetchGrainsLibrary = jest.fn().mockReturnValue(of(_mockGrains));
      service.fetchHopsLibrary = jest.fn().mockReturnValue(of(_mockHops));
      service.fetchYeastLibrary = jest.fn().mockReturnValue(of(_mockYeast));
      service.fetchStyleLibrary = jest.fn().mockReturnValue(of(_mockStyles));
      service.updateStorage = jest.fn();

      service.fetchAllLibrariesFromServer();

      setTimeout((): void => {
        expect(service.grainsLibrary.length).toEqual(_mockGrains.length);
        expect(service.hopsLibrary.length).toEqual(_mockHops.length);
        expect(service.yeastLibrary.length).toEqual(_mockYeast.length);
        expect(service.styleLibrary.length).toEqual(_mockStyles.length);
        done();
      }, 10);
    });

    test('should get an error fetching all libraries from server', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.fetchGrainsLibrary = jest.fn().mockReturnValue(throwError(_mockError));
      service.fetchHopsLibrary = jest.fn().mockReturnValue(of());
      service.fetchYeastLibrary = jest.fn().mockReturnValue(of());
      service.fetchStyleLibrary = jest.fn().mockReturnValue(of());
      service.errorReporter.handleUnhandledError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.fetchAllLibrariesFromServer();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should fetch all libraries', (): void => {
      service.getAllLibrariesFromStorage = jest.fn();
      service.fetchAllLibrariesFromServer = jest.fn();
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getAllLibrariesFromStorage');
      const fetchSpy: jest.SpyInstance = jest.spyOn(service, 'fetchAllLibrariesFromServer');

      service.fetchAllLibraries();

      expect(getSpy).toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalled();
    });

    test('should fetch libraries', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      const _mockHops: Hops[] = mockHops();
      const _mockYeast: Yeast[] = mockYeast();
      const _mockStyles: Style[] = mockStyles();
      service.sortAlpha = jest.fn().mockImplementation(() => 0);
      service.updateStorage = jest.fn();
      service.errorReporter.handleGenericCatchError = jest.fn();

      forkJoin(
        service.fetchLibrary<Grains>('grains'),
        service.fetchLibrary<Hops>('hops'),
        service.fetchLibrary<Yeast>('yeast'),
        service.fetchLibrary<Style>('style')
      )
      .subscribe(
        ([ grains, hops, yeast, style ]: [ Grains[], Hops[], Yeast[], Style[] ]): void => {
          expect(grains).toStrictEqual(_mockGrains);
          expect(service.grainsLibrary.length).toEqual(_mockGrains.length);
          expect(hops).toStrictEqual(_mockHops);
          expect(service.hopsLibrary.length).toEqual(_mockHops.length);
          expect(yeast).toStrictEqual(_mockYeast);
          expect(service.yeastLibrary.length).toEqual(_mockYeast.length);
          expect(style).toStrictEqual(_mockStyles);
          expect(service.styleLibrary.length).toEqual(_mockStyles.length);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should fetch libraries'`, error);
          expect(true).toBe(false);
        }
      );

      const grainsReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/library/grains`);
      expect(grainsReq.request.method).toMatch('GET');
      grainsReq.flush(_mockGrains);
      const hopsReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/library/hops`);
      expect(hopsReq.request.method).toMatch('GET');
      hopsReq.flush(_mockHops);
      const yeastReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/library/yeast`);
      expect(yeastReq.request.method).toMatch('GET');
      yeastReq.flush(_mockYeast);
      const styleReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/library/style`);
      expect(styleReq.request.method).toMatch('GET');
      styleReq.flush(_mockStyles);
    });

    test('should get an error fetching a library', (done: jest.DoneCallback): void => {
      const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(
        404,
        'not found',
        `${BASE_URL}/${API_VERSION}/library/grains`
      );
      service.errorReporter.handleGenericCatchError = jest.fn()
        .mockImplementation((): (error: HttpErrorResponse) => Observable<never> => {
          return (error: HttpErrorResponse): Observable<never> => {
            expect(error).toStrictEqual(_mockErrorResponse);
            return throwError(null);
          };
        });
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleGenericCatchError');

      service.fetchLibrary<Grains>('grains')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: any): void => {
            expect(error).toBeNull();
            expect(errorSpy).toHaveBeenCalled();
            done();
          }
        );

      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/library/grains`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, _mockErrorResponse);
    });

    test('should get an error fetching a library with an invalid name', (done: jest.DoneCallback): void => {
      service.fetchLibrary<Grains>('invalid')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error.message).toMatch('Invalid library name: invalid');
            done();
          }
        );
    });

    test('should fetch grains library', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      service.fetchLibrary = jest.fn().mockReturnValue(of(_mockGrains));
      const fetchSpy: jest.SpyInstance = jest.spyOn(service, 'fetchLibrary');

      service.fetchGrainsLibrary()
        .subscribe(
          (): void => {
            expect(fetchSpy).toHaveBeenCalledWith('grains');
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should fetch grains library'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should fetch hops library', (done: jest.DoneCallback): void => {
      const _mockHops: Hops[] = mockHops();
      service.fetchLibrary = jest.fn().mockReturnValue(of(_mockHops));
      const fetchSpy: jest.SpyInstance = jest.spyOn(service, 'fetchLibrary');

      service.fetchHopsLibrary()
        .subscribe(
          (): void => {
            expect(fetchSpy).toHaveBeenCalledWith('hops');
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should fetch hops library'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should fetch yeast library', (done: jest.DoneCallback): void => {
      const _mockYeast: Yeast[] = mockYeast();
      service.fetchLibrary = jest.fn().mockReturnValue(of(_mockYeast));
      const fetchSpy: jest.SpyInstance = jest.spyOn(service, 'fetchLibrary');

      service.fetchYeastLibrary()
        .subscribe(
          (): void => {
            expect(fetchSpy).toHaveBeenCalledWith('yeast');
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should fetch yeast library'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should fetch style library', (done: jest.DoneCallback): void => {
      const _mockStyle: Style[] = mockStyles();
      service.fetchLibrary = jest.fn().mockReturnValue(of(_mockStyle));
      const fetchSpy: jest.SpyInstance = jest.spyOn(service, 'fetchLibrary');

      service.fetchStyleLibrary()
        .subscribe(
          (): void => {
            expect(fetchSpy).toHaveBeenCalledWith('style');
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should fetch style library'`, error);
            expect(true).toBe(false);
          }
        );
    });

  });


  describe('Local Get Methods', (): void => {

    test('should get all libraries', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      const _mockHops: Hops[] = mockHops();
      const _mockYeast: Yeast[] = mockYeast();
      const _mockStyles: Style[] = mockStyles();
      service.getGrainsLibrary = jest.fn().mockReturnValue(of(_mockGrains));
      service.getHopsLibrary = jest.fn().mockReturnValue(of(_mockHops));
      service.getYeastLibrary = jest.fn().mockReturnValue(of(_mockYeast));
      service.getStyleLibrary = jest.fn().mockReturnValue(of(_mockStyles));

      service.getAllLibraries()
        .subscribe(
          ([grains, hops, yeast, styles]: [Grains[], Hops[], Yeast[], Style[]]): void => {
            expect(grains).toStrictEqual(_mockGrains);
            expect(hops).toStrictEqual(_mockHops);
            expect(yeast).toStrictEqual(_mockYeast);
            expect(styles).toStrictEqual(_mockStyles);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get all libraries'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get grains library', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      service.fetchGrainsLibrary = jest.fn().mockReturnValue(of(_mockGrains));

      service.getGrainsLibrary()
        .pipe(
          mergeMap((grains: Grains[]): Observable<Grains[]> => {
            expect(grains).toStrictEqual(_mockGrains);
            service.grainsLibrary = _mockGrains;
            return service.getGrainsLibrary();
          })
        )
        .subscribe(
          (grains: Grains[]): void => {
            expect(grains).toStrictEqual(_mockGrains);
            done();
          }
        );
    });

    test('should get hops library', (done: jest.DoneCallback): void => {
      const _mockHops: Hops[] = mockHops();
      service.fetchHopsLibrary = jest.fn().mockReturnValue(of(_mockHops));

      service.getHopsLibrary()
        .pipe(
          mergeMap((hops: Hops[]): Observable<Hops[]> => {
            expect(hops).toStrictEqual(_mockHops);
            service.hopsLibrary = _mockHops;
            return service.getHopsLibrary();
          })
        )
        .subscribe(
          (hops: Hops[]): void => {
            expect(hops).toStrictEqual(_mockHops);
            done();
          }
        );
    });

    test('should get yeast library', (done: jest.DoneCallback): void => {
      const _mockYeast: Yeast[] = mockYeast();
      service.fetchYeastLibrary = jest.fn().mockReturnValue(of(_mockYeast));

      service.getYeastLibrary()
        .pipe(
          mergeMap((yeast: Yeast[]): Observable<Yeast[]> => {
            expect(yeast).toStrictEqual(_mockYeast);
            service.yeastLibrary = _mockYeast;
            return service.getYeastLibrary();
          })
        )
        .subscribe(
          (yeast: Yeast[]): void => {
            expect(yeast).toStrictEqual(_mockYeast);
            done();
          }
        );
    });

    test('should get styles library', (done: jest.DoneCallback): void => {
      const _mockStyles: Style[] = mockStyles();
      service.fetchStyleLibrary = jest.fn().mockReturnValue(of(_mockStyles));

      service.getStyleLibrary()
        .pipe(
          mergeMap((styles: Style[]): Observable<Style[]> => {
            expect(styles).toStrictEqual(_mockStyles);
            service.styleLibrary = _mockStyles;
            return service.getStyleLibrary();
          })
        )
        .subscribe(
          (styles: Style[]): void => {
            expect(styles).toStrictEqual(_mockStyles);
            done();
          }
        );
    });

    test('should get ingredient by id from local library', (done: jest.DoneCallback): void => {
      const _mockHops: Hops[] = mockHops();
      const _mockInstance: Hops = _mockHops[1];
      service.hopsLibrary = _mockHops;

      service.getIngredientById<Hops>('hops', _mockInstance._id)
        .subscribe(
          (hops: Hops): void => {
            expect(hops).toStrictEqual(_mockInstance);
            done();
          },
          (error: any): void => {
            console.log(`Error in `, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get ingredient by id from server', (done: jest.DoneCallback): void => {
      const _mockHops: Hops[] = mockHops();
      const _mockInstance: Hops = _mockHops[1];
      service.fetchLibrary = jest.fn().mockReturnValue(of(_mockHops));

      service.getIngredientById<Hops>('hops', _mockInstance._id)
        .subscribe(
          (hops: Hops): void => {
            expect(hops).toStrictEqual(_mockInstance);
            done();
          },
          (error: any): void => {
            console.log(`Error in `, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error getting an ingredient with invalid name', (done: jest.DoneCallback): void => {
      service.getIngredientById<Grains>('invalid', 'id')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('Invalid library name: invalid');
            done();
          }
        );
    });

    test('should get a grains instance', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      const _mockInstance: Grains = _mockGrains[1];
      service.getIngredientById = jest.fn().mockReturnValue(of(_mockInstance));
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getIngredientById');

      service.getGrainsById(_mockInstance._id)
        .subscribe(
          (): void => {
            expect(getSpy).toHaveBeenCalledWith('grains', _mockInstance._id);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get a grains instance'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get a hops instance', (done: jest.DoneCallback): void => {
      const _mockHops: Hops[] = mockHops();
      const _mockInstance: Hops = _mockHops[1];
      service.getIngredientById = jest.fn().mockReturnValue(of(_mockInstance));
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getIngredientById');

      service.getHopsById(_mockInstance._id)
        .subscribe(
          (): void => {
            expect(getSpy).toHaveBeenCalledWith('hops', _mockInstance._id);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get a hops instance'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get a yeast instance', (done: jest.DoneCallback): void => {
      const _mockYeast: Yeast[] = mockYeast();
      const _mockInstance: Yeast = _mockYeast[1];
      service.getIngredientById = jest.fn().mockReturnValue(of(_mockInstance));
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getIngredientById');

      service.getYeastById(_mockInstance._id)
        .subscribe(
          (): void => {
            expect(getSpy).toHaveBeenCalledWith('yeast', _mockInstance._id);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get a yeast instance'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get a style instance', (done: jest.DoneCallback): void => {
      const _mockStyle: Style[] = mockStyles();
      const _mockInstance: Style = _mockStyle[1];
      service.getIngredientById = jest.fn().mockReturnValue(of(_mockInstance));
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getIngredientById');

      service.getStyleById(_mockInstance._id)
        .subscribe(
          (): void => {
            expect(getSpy).toHaveBeenCalledWith('style', _mockInstance._id);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get a style instance'`, error);
            expect(true).toBe(false);
          }
        );
    });

  });


  describe('Utility Methods', (): void => {

    test('should get libraries from storage', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      const _mockHops: Hops[] = mockHops();
      const _mockYeast: Yeast[] = mockYeast();
      const _mockStyles: Style[] = mockStyles();
      service.storageService.getLibrary = jest.fn()
        .mockReturnValue(of({
          grains: _mockGrains,
          hops: _mockHops,
          yeast: _mockYeast,
          style: _mockStyles
        }));
      expect(service.grainsLibrary).toBeNull();
      expect(service.hopsLibrary).toBeNull();
      expect(service.yeastLibrary).toBeNull();
      expect(service.styleLibrary).toBeNull();

      service.getAllLibrariesFromStorage();

      setTimeout((): void => {
        expect(service.grainsLibrary).toStrictEqual(_mockGrains);
        expect(service.hopsLibrary).toStrictEqual(_mockHops);
        expect(service.yeastLibrary).toStrictEqual(_mockYeast);
        expect(service.styleLibrary).toStrictEqual(_mockStyles);
        done();
      });
    });

    test('should get libraries, but not override if libraries are populated', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      service.grainsLibrary = _mockGrains;
      const _mockHops: Hops[] = mockHops();
      service.hopsLibrary = _mockHops;
      const _mockYeast: Yeast[] = mockYeast();
      service.yeastLibrary = _mockYeast;
      const _mockStyles: Style[] = mockStyles();
      service.styleLibrary = _mockStyles;
      service.storageService.getLibrary = jest.fn().mockReturnValue(of({
        grains: [],
        hops: [],
        yeast: [],
        style: []
      }));
      expect(service.grainsLibrary).not.toBeNull();
      expect(service.hopsLibrary).not.toBeNull();
      expect(service.yeastLibrary).not.toBeNull();
      expect(service.styleLibrary).not.toBeNull();

      service.getAllLibrariesFromStorage();

      setTimeout((): void => {
        expect(service.grainsLibrary).toStrictEqual(_mockGrains);
        expect(service.hopsLibrary).toStrictEqual(_mockHops);
        expect(service.yeastLibrary).toStrictEqual(_mockYeast);
        expect(service.styleLibrary).toStrictEqual(_mockStyles);
        done();
      });
    });

    test('should get an error getting libraries from storage', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.storageService.getLibrary = jest.fn().mockReturnValue(throwError(_mockError));
      service.errorReporter.handleUnhandledError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.getAllLibrariesFromStorage();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should sort alphabetically by name', (): void => {
      expect(service.sortAlpha({ name: 'b' }, { name: 'a' })).toEqual(1);
      expect(service.sortAlpha({ name: 'a' }, { name: 'b' })).toEqual(-1);
      expect(service.sortAlpha({ name: 'b' }, { name: 'b' })).toEqual(0);
      expect(service.sortAlpha({}, {})).toEqual(0);
    });

    test('should update storage with libraries', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      const _mockHops: Hops[] = mockHops();
      const _mockYeast: Yeast[] = mockYeast();
      const _mockStyles: Style[] = mockStyles();
      service.grainsLibrary = _mockGrains;
      service.hopsLibrary = _mockHops;
      service.yeastLibrary = _mockYeast;
      service.styleLibrary = _mockStyles;
      service.storageService.setLibrary = jest.fn().mockReturnValue(of(null));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storageService, 'setLibrary');

      service.updateStorage();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith({
          grains: _mockGrains,
          hops: _mockHops,
          yeast: _mockYeast,
          style: _mockStyles
        });
        done();
      }, 10);
    });

    test('should get an error storing libraries', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.storageService.setLibrary = jest.fn().mockReturnValue(throwError(_mockError));
      service.errorReporter.handleUnhandledError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleUnhandledError');

      service.updateStorage();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Type Guard', (): void => {

    test('should check if grains types are safe', (): void => {
      service.typeGuard.hasValidProperties = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const _mockGrains: Grains = mockGrains()[0];

      expect(service.isSafeGrains(_mockGrains)).toBe(true);
      expect(service.isSafeGrains(_mockGrains)).toBe(false);
    });

    test('should check if hops types are safe', (): void => {
      service.typeGuard.hasValidProperties = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const _mockHops: Hops = mockHops()[0];

      expect(service.isSafeHops(_mockHops)).toBe(true);
      expect(service.isSafeHops(_mockHops)).toBe(false);
    });

    test('should check if yeast types are safe', (): void => {
      service.typeGuard.hasValidProperties = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const _mockYeast: Yeast = mockYeast()[0];

      expect(service.isSafeYeast(_mockYeast)).toBe(true);
      expect(service.isSafeYeast(_mockYeast)).toBe(false);
    });

    test('should check if style types are safe', (): void => {
      service.typeGuard.hasValidProperties = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const _mockStyle: Style = mockStyles()[0];

      expect(service.isSafeStyle(_mockStyle)).toBe(true);
      expect(service.isSafeStyle(_mockStyle)).toBe(false);
    });

  });

});
