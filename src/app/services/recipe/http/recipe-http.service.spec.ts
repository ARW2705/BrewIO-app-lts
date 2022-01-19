/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, forkJoin, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockAuthor, mockOtherIngredients, mockGrainBill, mockHopsSchedule, mockImage, mockImageRequestMetadata, mockRecipeMasterActive, mockRecipeMasterInactive, mockRecipeVariantComplete, mockRecipeVariantIncomplete, mockErrorResponse, mockProcessSchedule, mockStyles, mockUser, mockSyncError, mockSyncMetadata, mockSyncResponse, mockYeastBatch } from '@test/mock-models';
import { ErrorReportingServiceStub, EventServiceStub, IdServiceStub, RecipeHttpServiceStub, RecipeImageServiceStub, RecipeStateServiceStub, RecipeTypeGuardServiceStub, UserServiceStub } from '@test/service-stubs';

/* Constants imports */
import { API_VERSION, BASE_URL } from '@shared/constants';

/* Interface imports */
import { Author, GrainBill, HopsSchedule, Image, ImageRequestMetadata, OtherIngredients, Process, RecipeMaster, RecipeVariant, Style, SyncData, SyncError, SyncRequests, SyncResponse, User, YeastBatch, } from '@shared/interfaces';

/* Type guard imports */
import { ProcessGuardMetadata, CalendarProcessGuardMetadata, ManualProcessGuardMetadata, TimerProcessGuardMetadata, GrainBillGuardMetadata, GrainsGuardMetadata, HopsScheduleGuardMetadata, HopsGuardMetadata, YeastBatchGuardMetadata, YeastGuardMetadata, OtherIngredientsGuardMetadata } from '@shared/type-guard-metadata';

/* Type imports */
import { CustomError } from '@shared/types';

/* Default imports */
import { defaultImage } from '@shared/defaults';

/* Service imports */
import { ErrorReportingService, IdService } from '@services/public';
import { RecipeImageService } from '@services/recipe/image/recipe-image.service';
import { RecipeHttpService } from './recipe-http.service';


describe('RecipeHttpService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: RecipeHttpService;
  let httpMock: HttpTestingController;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        RecipeHttpService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: RecipeImageService, useClass: RecipeImageServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(RecipeHttpService);
    httpMock = injector.get(HttpTestingController);
    service.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: Error) => Observable<never> => {
        return (error: Error): Observable<never> => {
          throw error;
        };
      });
    service.errorReporter.handleResolvableCatchError = jest.fn()
      .mockImplementation(
        (shouldResolve: boolean, resolvedValue?: HttpErrorResponse): (error: Error) => Observable<HttpErrorResponse | never> => {
          if (shouldResolve) {
            return (error: HttpErrorResponse): Observable<HttpErrorResponse> => of(resolvedValue ?? error);
          } else {
            return (error: HttpErrorResponse): Observable<never> => {
              throw error;
            };
          }
        }
      );
  });

  afterEach((): void => {
    httpMock.verify();
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  describe('Public API', (): void => {

    test('should fetch public author by id', (done: jest.DoneCallback): void => {
      const _mockAuthor: Author = mockAuthor();

      service.fetchPublicAuthorByRecipeId('0123456789012')
        .subscribe(
          (author: Author): void => {
            expect(author).toStrictEqual(_mockAuthor);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get public author by id'`, error);
            expect(true).toBe(false);
          }
        );

      const getReq: TestRequest = httpMock.expectOne(`${service.publicRoute}/master/0123456789012/author`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(_mockAuthor);
    });

    test('should get return null on fetch author http error', (done: jest.DoneCallback): void => {
      service.fetchPublicAuthorByRecipeId('0123456789012')
        .subscribe(
          (author: Author): void => {
            expect(author).toBeNull();
            done();
          },
          (error: any): void => {
            console.log('Error in: should get return null on fetch author http error', error);
            expect(true).toBe(false);
          }
        );

      const getReq: TestRequest = httpMock.expectOne(`${service.publicRoute}/master/0123456789012/author`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, mockErrorResponse(404, 'not found'));
    });

    test('should fetch recipe', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      service.fetchPublicRecipeById('0123456789012')
        .subscribe(
          (recipe: RecipeMaster): void => {
            expect(recipe).toStrictEqual(_mockRecipeMasterActive);
            done();
          },
          (error: any): void => {
            console.log('Error in: should fetch recipe', error);
            expect(true).toBe(false);
          }
        );

      const getReq: TestRequest = httpMock.expectOne(`${service.publicRoute}/master/0123456789012`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(_mockRecipeMasterActive);
    });

    test('should handle error response fetching recipe', (done: jest.DoneCallback): void => {
      const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');

      service.fetchPublicRecipeById('0123456789012')
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: HttpErrorResponse): void => {
            expect(error.status).toEqual(_mockErrorResponse.status);
            expect(error.statusText).toMatch(_mockErrorResponse.statusText);
            done();
          }
        );

      const getReq: TestRequest = httpMock.expectOne(`${service.publicRoute}/master/0123456789012`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, _mockErrorResponse);
    });

    test('should fetch recipe list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list: RecipeMaster[] = [ _mockRecipeMasterActive, _mockRecipeMasterInactive ];

      service.fetchPublicRecipeListByUser('0123456789012')
        .subscribe(
          (recipes: RecipeMaster[]): void => {
            expect(recipes).toStrictEqual(list);
            done();
          },
          (error: any): void => {
            console.log('Error in: should fetch recipe list', error);
            expect(true).toBe(false);
          }
        );

      const getReq: TestRequest = httpMock.expectOne(`${service.publicRoute}/0123456789012`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(list);
    });

    test('should handle error response fetching recipe list', (done: jest.DoneCallback): void => {
      const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');

      service.fetchPublicRecipeListByUser('0123456789012')
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: HttpErrorResponse): void => {
            expect(error.status).toEqual(_mockErrorResponse.status);
            expect(error.statusText).toMatch(_mockErrorResponse.statusText);
            done();
          }
        );

      const getReq: TestRequest = httpMock.expectOne(`${service.publicRoute}/0123456789012`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, _mockErrorResponse);
    });

    test('should fetch variant', (done: jest.DoneCallback): void => {
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      service.fetchPublicVariantById('0123456789012', '2109876543210')
        .subscribe(
          (recipe: RecipeVariant): void => {
            expect(recipe).toStrictEqual(_mockRecipeVariantComplete);
            done();
          },
          (error: any): void => {
            console.log('Error in: should fetch variant', error);
            expect(true).toBe(false);
          }
        );

      const getReq: TestRequest = httpMock.expectOne(`${service.publicRoute}/master/0123456789012/variant/2109876543210`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(_mockRecipeVariantComplete);
    });

    test('should handle error response fetching variant', (done: jest.DoneCallback): void => {
      const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');

      service.fetchPublicVariantById('0123456789012', '2109876543210')
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: HttpErrorResponse): void => {
            expect(error.status).toEqual(_mockErrorResponse.status);
            expect(error.statusText).toMatch(_mockErrorResponse.statusText);
            done();
          }
        );

      const getReq: TestRequest = httpMock.expectOne(`${service.publicRoute}/master/0123456789012/variant/2109876543210`);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, _mockErrorResponse);
    });

  });


  describe('Private API', (): void => {

    test('should fetch private recipe list', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
      const list: RecipeMaster[] = [ _mockRecipeMasterActive, _mockRecipeMasterInactive ];

      service.fetchPrivateRecipeList()
        .subscribe(
          (recipes: RecipeMaster[]): void => {
            expect(recipes).toStrictEqual(list);
            done();
          },
          (error: any): void => {
            console.log('Error in: should fetch private recipe list', error);
            expect(true).toBe(false);
          }
        );

      const getReq: TestRequest = httpMock.expectOne(service.privateRoute);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(list);
    });

    test('should handle error response fetching private recipe list', (done: jest.DoneCallback): void => {
      const _mockErrorResponse: HttpErrorResponse = mockErrorResponse(404, 'not found');

      service.fetchPrivateRecipeList()
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: HttpErrorResponse): void => {
            expect(error.status).toEqual(_mockErrorResponse.status);
            expect(error.statusText).toMatch(_mockErrorResponse.statusText);
            done();
          }
        );

      const getReq: TestRequest = httpMock.expectOne(service.privateRoute);
      expect(getReq.request.method).toMatch('GET');
      getReq.flush(null, _mockErrorResponse);
    });

  });


  describe('Background Server Update Methods', (): void => {

    test('should configure background request', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.getBackgroundRequest = jest.fn().mockReturnValue(of(_mockRecipeMasterActive));
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBackgroundRequest');

      service.configureBackgroundRequest('post', true, _mockRecipeMasterActive)
        .subscribe(
          (recipe: RecipeMaster): void => {
            expect(recipe).toStrictEqual(_mockRecipeMasterActive);
            expect(getSpy).toHaveBeenCalledWith('post', _mockRecipeMasterActive, null, undefined);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should configure background request', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should handle error as observable when configure background request sets an error', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.getBackgroundRequest = jest.fn().mockReturnValue(throwError(_mockError));
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBackgroundRequest');

      service.configureBackgroundRequest('post', true, _mockRecipeMasterActive)
        .subscribe(
          (error: HttpErrorResponse): void => {
            expect(error).toStrictEqual(_mockError);
            expect(getSpy).toHaveBeenCalledWith('post', _mockRecipeMasterActive, null, undefined);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should handle error as observable when configure background request sets an error', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get background delete request', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.getDeleteRequest = jest.fn().mockReturnValue(of(_mockRecipeMasterActive));
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getDeleteRequest');

      service.getBackgroundRequest('delete', _mockRecipeMasterActive, null, 'delete-id')
        .subscribe(
          (response: RecipeMaster): void => {
            expect(response).toStrictEqual(_mockRecipeMasterActive);
            expect(getSpy).toHaveBeenCalledWith(_mockRecipeMasterActive, null, 'delete-id');
            done();
          },
          (error: Error): void => {
            console.log('Error in: should get background delete request', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get background recipe post request', (done: jest.DoneCallback): void => {
      const _mockImageRequestMetadata: ImageRequestMetadata = mockImageRequestMetadata();
      service.recipeImageService.getImageRequest = jest.fn()
        .mockReturnValue(of([_mockImageRequestMetadata]));
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockFormData: FormData = new FormData();
      _mockFormData.append('recipeMaster', JSON.stringify(_mockRecipeMasterActive));
      _mockFormData.append(
        _mockImageRequestMetadata.name,
        _mockImageRequestMetadata.blob,
        _mockImageRequestMetadata.filename
      );
      service.getPostRequest = jest.fn().mockReturnValue(of(_mockRecipeMasterActive));
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getPostRequest');

      service.getBackgroundRequest('post', _mockRecipeMasterActive)
        .subscribe(
          (recipe: RecipeMaster): void => {
            expect(recipe).toStrictEqual(_mockRecipeMasterActive);
            expect(getSpy).toHaveBeenCalledWith(_mockRecipeMasterActive, _mockFormData, true);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should get background recipe post request', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get background recipe patch request', (done: jest.DoneCallback): void => {
      service.recipeImageService.getImageRequest = jest.fn()
        .mockReturnValue(of([]));
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockFormData: FormData = new FormData();
      _mockFormData.append('recipeVariant', JSON.stringify(_mockRecipeVariantComplete));
      service.getPatchRequest = jest.fn().mockReturnValue(of(_mockRecipeVariantComplete));
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getPatchRequest');

      service.getBackgroundRequest('patch', _mockRecipeMasterActive, _mockRecipeVariantComplete)
        .subscribe(
          (recipe: RecipeVariant): void => {
            expect(recipe).toStrictEqual(_mockRecipeVariantComplete);
            expect(getSpy).toHaveBeenCalledWith(_mockRecipeMasterActive, _mockFormData, _mockRecipeVariantComplete);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should get background recipe patch request', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error for an invalid http method', (done: jest.DoneCallback): void => {
      service.recipeImageService.getImageRequest = jest.fn()
        .mockReturnValue(of([]));
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      service.getBackgroundRequest('invalid', _mockRecipeMasterActive)
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.name).toMatch('HttpRequestError');
            expect(error.message).toMatch('Invalid http method: invalid');
            expect(error.severity).toEqual(2);
            done();
          }
        );
    });

    test('should request in background', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.getBackgroundRequest = jest.fn().mockReturnValue(of(_mockRecipeMasterActive));
      const getSpy: jest.SpyInstance = jest.spyOn(service, 'getBackgroundRequest');

      service.requestInBackground('post', _mockRecipeMasterActive)
        .subscribe(
          (recipe: RecipeMaster): void => {
            expect(recipe).toStrictEqual(_mockRecipeMasterActive);
            expect(getSpy).toHaveBeenCalledWith('post', _mockRecipeMasterActive, undefined);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should request in background', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get error with request in background using an invalid http method', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      service.requestInBackground('invalid', _mockRecipeMasterActive)
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.name).toMatch('RecipeError');
            expect(error.message).toMatch('Unknown request type: invalid');
            expect(error.severity).toEqual(2);
            done();
          }
        );
    });

  });


  describe('Request Helpers', (): void => {

    test('should get a delete request with a recipe', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      service.getDeleteRequest<RecipeMaster>(_mockRecipeMasterActive, null)
        .subscribe(
          (response: RecipeMaster): void => {
            expect(response).toStrictEqual(_mockRecipeMasterActive);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should get a delete request with a recipe', error);
            expect(true).toBe(false);
          }
        );

      const deleteReq: TestRequest = httpMock.expectOne(`${service.privateRoute}/master/${_mockRecipeMasterActive._id}`);
      expect(deleteReq.request.method).toMatch('DELETE');
      deleteReq.flush(_mockRecipeMasterActive);
    });

    test('should get a delete request with a variant', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

      service.getDeleteRequest<RecipeVariant>(_mockRecipeMasterActive, _mockRecipeVariantComplete)
        .subscribe(
          (response: RecipeVariant): void => {
            expect(response).toStrictEqual(_mockRecipeVariantComplete);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should get a delete request with a variant', error);
            expect(true).toBe(false);
          }
        );

      const deleteReq: TestRequest = httpMock.expectOne(`${service.privateRoute}/master/${_mockRecipeMasterActive._id}/variant/${_mockRecipeVariantComplete._id}`);
      expect(deleteReq.request.method).toMatch('DELETE');
      deleteReq.flush(_mockRecipeVariantComplete);
    });

    test('should get a delete request with a deletion id', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      service.getDeleteRequest<RecipeMaster>(null, null, 'delete-id')
        .subscribe(
          (response: RecipeMaster): void => {
            expect(response).toStrictEqual(_mockRecipeMasterActive);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should get a delete request with a deletion id', error);
            expect(true).toBe(false);
          }
        );

      const deleteReq: TestRequest = httpMock.expectOne(`${service.privateRoute}/master/delete-id`);
      expect(deleteReq.request.method).toMatch('DELETE');
      deleteReq.flush(_mockRecipeMasterActive);
    });

    test('should get a recipe patch request', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockFormData: FormData = new FormData();
      _mockFormData.append('test', JSON.stringify(_mockRecipeMasterActive));

      service.getPatchRequest<RecipeVariant>(_mockRecipeMasterActive, _mockFormData)
        .subscribe(
          (response: RecipeVariant): void => {
            expect(response).toStrictEqual(_mockRecipeMasterActive);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should get a recipe patch request', error);
            expect(true).toBe(false);
          }
        );

      const patchReq: TestRequest = httpMock.expectOne(`${service.privateRoute}/master/${_mockRecipeMasterActive._id}`);
      expect(patchReq.request.method).toMatch('PATCH');
      patchReq.flush(_mockRecipeMasterActive);
    });

    test('should get a variant patch request', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockFormData: FormData = new FormData();
      _mockFormData.append('test', JSON.stringify(_mockRecipeVariantComplete));

      service.getPatchRequest<RecipeVariant>(_mockRecipeMasterActive, _mockFormData, _mockRecipeVariantComplete)
        .subscribe(
          (response: RecipeVariant): void => {
            expect(response).toStrictEqual(_mockRecipeVariantComplete);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should get a variant patch request', error);
            expect(true).toBe(false);
          }
        );

      const patchReq: TestRequest = httpMock.expectOne(`${service.privateRoute}/master/${_mockRecipeMasterActive._id}/variant/${_mockRecipeVariantComplete._id}`);
      expect(patchReq.request.method).toMatch('PATCH');
      patchReq.flush(_mockRecipeVariantComplete);
    });

    test('should get a recipe post request', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockFormData: FormData = new FormData();
      _mockFormData.append('test', JSON.stringify(_mockRecipeMasterActive));

      service.getPostRequest<RecipeMaster>(_mockRecipeMasterActive, _mockFormData, true)
        .subscribe(
          (response: RecipeMaster): void => {
            expect(response).toStrictEqual(_mockRecipeMasterActive);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should get a recipe post request', error);
            expect(true).toBe(false);
          }
        );

      const postReq: TestRequest = httpMock.expectOne(service.privateRoute);
      expect(postReq.request.method).toMatch('POST');
      postReq.flush(_mockRecipeMasterActive);
    });

    test('should get a variant post request', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
      const _mockFormData: FormData = new FormData();
      _mockFormData.append('test', JSON.stringify(_mockRecipeVariantComplete));

      service.getPostRequest<RecipeVariant>(_mockRecipeMasterActive, _mockFormData, false)
        .subscribe(
          (response: RecipeVariant): void => {
            expect(response).toStrictEqual(_mockRecipeVariantComplete);
            done();
          },
          (error: Error): void => {
            console.log('Error in: should get a variant post request', error);
            expect(true).toBe(false);
          }
        );

      const postReq: TestRequest = httpMock.expectOne(`${service.privateRoute}/master/${_mockRecipeMasterActive._id}`);
      expect(postReq.request.method).toMatch('POST');
      postReq.flush(_mockRecipeVariantComplete);
    });

  });

});
