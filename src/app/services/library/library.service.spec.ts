/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/* Test bed configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockGrains } from '../../../../test-config/mock-models/mock-grains';
import { mockHops } from '../../../../test-config/mock-models/mock-hops';
import { mockYeast } from '../../../../test-config/mock-models/mock-yeast';
import { mockStyles } from '../../../../test-config/mock-models/mock-styles';
import { mockErrorResponse } from '../../../../test-config/mock-models/mock-response';
import { HttpErrorServiceMock, StorageServiceMock } from '../../../../test-config/mocks-app';

/* Constants imports */
import { API_VERSION } from '../../shared/constants/api-version';
import { BASE_URL } from '../../shared/constants/base-url';

/* Interface imports */
import { Grains, Hops, Style, Yeast } from '../../shared/interfaces/library';

/* Service imports */
import { LibraryService } from './library.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { StorageService } from '../storage/storage.service';


describe('LibraryService', (): void => {
  let injector: TestBed;
  let libraryService: LibraryService;
  let httpMock: HttpTestingController;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        LibraryService,
        { provide: HttpErrorService, useClass: HttpErrorServiceMock },
        { provide: StorageService, useClass: StorageServiceMock }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    libraryService = injector.get(LibraryService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    expect(libraryService).toBeDefined();
  });

  describe('API Methods', (): void => {

    test('should fetch all libraries from server', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      const _mockHops: Hops[] = mockHops();
      const _mockYeast: Yeast[] = mockYeast();
      const _mockStyles: Style[] = mockStyles();

      libraryService.fetchGrainsLibrary = jest
        .fn()
        .mockReturnValue(of(_mockGrains));

      libraryService.fetchHopsLibrary = jest
        .fn()
        .mockReturnValue(of(_mockHops));

      libraryService.fetchYeastLibrary = jest
        .fn()
        .mockReturnValue(of(_mockYeast));

      libraryService.fetchStyleLibrary = jest
        .fn()
        .mockReturnValue(of(_mockStyles));

      libraryService.updateStorage = jest
        .fn();

      libraryService.fetchAllLibrariesFromServer();

      setTimeout((): void => {
        expect(libraryService.grainsLibrary.length).toEqual(_mockGrains.length);
        expect(libraryService.hopsLibrary.length).toEqual(_mockHops.length);
        expect(libraryService.yeastLibrary.length).toEqual(_mockYeast.length);
        expect(libraryService.styleLibrary.length).toEqual(_mockStyles.length);
        done();
      }, 10);
    });

    test('should get an error fetching all libraries from server', (done: jest.DoneCallback): void => {
      libraryService.fetchGrainsLibrary = jest
        .fn()
        .mockReturnValue(throwError('service unavailable'));

      libraryService.fetchHopsLibrary = jest
        .fn()
        .mockReturnValue(of());

      libraryService.fetchYeastLibrary = jest
        .fn()
        .mockReturnValue(of());

      libraryService.fetchStyleLibrary = jest
        .fn()
        .mockReturnValue(of());

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      libraryService.fetchAllLibrariesFromServer();

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Library fetch error: service unavailable');
        done();
      }, 10);
    });

    test('should fetch all libraries', (): void => {
      libraryService.getAllLibrariesFromStorage = jest
        .fn();

      libraryService.fetchAllLibrariesFromServer = jest
        .fn();

      const getSpy: jest.SpyInstance = jest.spyOn(libraryService, 'getAllLibrariesFromStorage');
      const fetchSpy: jest.SpyInstance = jest.spyOn(libraryService, 'fetchAllLibrariesFromServer');

      libraryService.fetchAllLibraries();

      expect(getSpy).toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalled();
    });

    test('should fetch libraries', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      const _mockHops: Hops[] = mockHops();
      const _mockYeast: Yeast[] = mockYeast();
      const _mockStyles: Style[] = mockStyles();

      libraryService.sortAlpha = jest
        .fn()
        .mockImplementation(() => 0);

      libraryService.updateStorage = jest
        .fn();

      forkJoin(
        libraryService.fetchLibrary<Grains>('grains'),
        libraryService.fetchLibrary<Hops>('hops'),
        libraryService.fetchLibrary<Yeast>('yeast'),
        libraryService.fetchLibrary<Style>('style')
      )
      .subscribe(
        ([ grains, hops, yeast, style ]: [ Grains[], Hops[], Yeast[], Style[] ]): void => {
          expect(grains).toStrictEqual(_mockGrains);
          expect(libraryService.grainsLibrary.length).toEqual(_mockGrains.length);
          expect(hops).toStrictEqual(_mockHops);
          expect(libraryService.hopsLibrary.length).toEqual(_mockHops.length);
          expect(yeast).toStrictEqual(_mockYeast);
          expect(libraryService.yeastLibrary.length).toEqual(_mockYeast.length);
          expect(style).toStrictEqual(_mockStyles);
          expect(libraryService.styleLibrary.length).toEqual(_mockStyles.length);
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
      const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');

      libraryService.httpError.handleError = jest
        .fn()
        .mockReturnValue(throwError('<404> not found'));

      libraryService.fetchLibrary<Grains>('grains')
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('<404> not found');
            done();
          }
        );

      const getReq: TestRequest = httpMock.expectOne(`${BASE_URL}/${API_VERSION}/library/grains`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, _mockErrorResponse);
    });

    test('should get an error fetching a library with an invalid name', (done: jest.DoneCallback): void => {
      libraryService.fetchLibrary<Grains>('invalid')
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

    test('should fetch grains library', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();

      libraryService.fetchLibrary = jest
        .fn()
        .mockReturnValue(of(_mockGrains));

      const fetchSpy: jest.SpyInstance = jest.spyOn(libraryService, 'fetchLibrary');

      libraryService.fetchGrainsLibrary()
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

      libraryService.fetchLibrary = jest
        .fn()
        .mockReturnValue(of(_mockHops));

      const fetchSpy: jest.SpyInstance = jest.spyOn(libraryService, 'fetchLibrary');

      libraryService.fetchHopsLibrary()
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

      libraryService.fetchLibrary = jest
        .fn()
        .mockReturnValue(of(_mockYeast));

      const fetchSpy: jest.SpyInstance = jest.spyOn(libraryService, 'fetchLibrary');

      libraryService.fetchYeastLibrary()
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

      libraryService.fetchLibrary = jest
        .fn()
        .mockReturnValue(of(_mockStyle));

      const fetchSpy: jest.SpyInstance = jest.spyOn(libraryService, 'fetchLibrary');

      libraryService.fetchStyleLibrary()
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

      libraryService.getGrainsLibrary = jest
        .fn()
        .mockReturnValue(of(_mockGrains));

      libraryService.getHopsLibrary = jest
        .fn()
        .mockReturnValue(of(_mockHops));

      libraryService.getYeastLibrary = jest
        .fn()
        .mockReturnValue(of(_mockYeast));

      libraryService.getStyleLibrary = jest
        .fn()
        .mockReturnValue(of(_mockStyles));

      libraryService.getAllLibraries()
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

      libraryService.fetchGrainsLibrary = jest
        .fn()
        .mockReturnValue(of(_mockGrains));

      libraryService.getGrainsLibrary()
        .pipe(
          mergeMap((grains: Grains[]): Observable<Grains[]> => {
            expect(grains).toStrictEqual(_mockGrains);
            libraryService.grainsLibrary = _mockGrains;
            return libraryService.getGrainsLibrary();
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

      libraryService.fetchHopsLibrary = jest
        .fn()
        .mockReturnValue(of(_mockHops));

      libraryService.getHopsLibrary()
        .pipe(
          mergeMap((hops: Hops[]): Observable<Hops[]> => {
            expect(hops).toStrictEqual(_mockHops);
            libraryService.hopsLibrary = _mockHops;
            return libraryService.getHopsLibrary();
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

      libraryService.fetchYeastLibrary = jest
        .fn()
        .mockReturnValue(of(_mockYeast));

      libraryService.getYeastLibrary()
        .pipe(
          mergeMap((yeast: Yeast[]): Observable<Yeast[]> => {
            expect(yeast).toStrictEqual(_mockYeast);
            libraryService.yeastLibrary = _mockYeast;
            return libraryService.getYeastLibrary();
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

      libraryService.fetchStyleLibrary = jest
        .fn()
        .mockReturnValue(of(_mockStyles));

      libraryService.getStyleLibrary()
        .pipe(
          mergeMap((styles: Style[]): Observable<Style[]> => {
            expect(styles).toStrictEqual(_mockStyles);
            libraryService.styleLibrary = _mockStyles;
            return libraryService.getStyleLibrary();
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
      libraryService.hopsLibrary = _mockHops;

      libraryService.getIngredientById<Hops>('hops', _mockInstance._id)
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

      libraryService.fetchLibrary = jest
        .fn()
        .mockReturnValue(of(_mockHops));

      libraryService.getIngredientById<Hops>('hops', _mockInstance._id)
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
      libraryService.getIngredientById<Grains>('invalid', 'id')
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

      libraryService.getIngredientById = jest
        .fn()
        .mockReturnValue(of(_mockInstance));

      const getSpy: jest.SpyInstance = jest.spyOn(libraryService, 'getIngredientById');

      libraryService.getGrainsById(_mockInstance._id)
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

      libraryService.getIngredientById = jest
        .fn()
        .mockReturnValue(of(_mockInstance));

      const getSpy: jest.SpyInstance = jest.spyOn(libraryService, 'getIngredientById');

      libraryService.getHopsById(_mockInstance._id)
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

      libraryService.getIngredientById = jest
        .fn()
        .mockReturnValue(of(_mockInstance));

      const getSpy: jest.SpyInstance = jest.spyOn(libraryService, 'getIngredientById');

      libraryService.getYeastById(_mockInstance._id)
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

      libraryService.getIngredientById = jest
        .fn()
        .mockReturnValue(of(_mockInstance));

      const getSpy: jest.SpyInstance = jest.spyOn(libraryService, 'getIngredientById');

      libraryService.getStyleById(_mockInstance._id)
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

      libraryService.storageService.getLibrary = jest
        .fn()
        .mockReturnValue(of({
          grains: _mockGrains,
          hops: _mockHops,
          yeast: _mockYeast,
          style: _mockStyles
        }));

      expect(libraryService.grainsLibrary).toBeNull();
      expect(libraryService.hopsLibrary).toBeNull();
      expect(libraryService.yeastLibrary).toBeNull();
      expect(libraryService.styleLibrary).toBeNull();

      libraryService.getAllLibrariesFromStorage();

      setTimeout((): void => {
        expect(libraryService.grainsLibrary).toStrictEqual(_mockGrains);
        expect(libraryService.hopsLibrary).toStrictEqual(_mockHops);
        expect(libraryService.yeastLibrary).toStrictEqual(_mockYeast);
        expect(libraryService.styleLibrary).toStrictEqual(_mockStyles);
        done();
      });
    });

    test('should get an error getting libraries from storage', (done: jest.DoneCallback): void => {
      libraryService.storageService.getLibrary = jest
        .fn()
        .mockReturnValue(throwError('Libraries not found'));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      libraryService.getAllLibrariesFromStorage();

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Libraries not found: awaiting data from server');
        done();
      }, 10);
    });

    test('should sort alphabetically by name', (): void => {
      expect(libraryService.sortAlpha({ name: 'b' }, { name: 'a' })).toEqual(1);
      expect(libraryService.sortAlpha({ name: 'a' }, { name: 'b' })).toEqual(-1);
      expect(libraryService.sortAlpha({ name: 'b' }, { name: 'b' })).toEqual(0);
      expect(libraryService.sortAlpha({}, {})).toEqual(0);
    });

    test('should update storage with libraries', (done: jest.DoneCallback): void => {
      const _mockGrains: Grains[] = mockGrains();
      const _mockHops: Hops[] = mockHops();
      const _mockYeast: Yeast[] = mockYeast();
      const _mockStyles: Style[] = mockStyles();

      libraryService.grainsLibrary = _mockGrains;
      libraryService.hopsLibrary = _mockHops;
      libraryService.yeastLibrary = _mockYeast;
      libraryService.styleLibrary = _mockStyles;

      libraryService.storageService.setLibrary = jest
        .fn()
        .mockReturnValue(of());

      const storeSpy: jest.SpyInstance = jest.spyOn(libraryService.storageService, 'setLibrary');

      libraryService.updateStorage();

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
      libraryService.storageService.setLibrary = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      libraryService.updateStorage();

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Library store error: test-error');
        done();
      }, 10);
    });

  });

});
