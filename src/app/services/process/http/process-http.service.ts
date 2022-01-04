/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/* Constants imports */
import { API_VERSION, BASE_URL, HIGH_SEVERITY } from '@shared/constants';

/* Interface imports */
import { Batch } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { UtilityService } from '@services/utility/utility.service';


@Injectable({
  providedIn: 'root'
})
export class ProcessHttpService {

  constructor(
    public errorReporter: ErrorReportingService,
    public http: HttpClient,
    public utilService: UtilityService
  ) { }

  /**
   * Configure a background request while defining which error handling method to use
   *
   * @param: syncMethod - the http method to apply
   * @param: shouldResolveError - true if error should return the error response as an observable
   * or false if error should be handled as an error
   * @param: batch - the batch to use in request
   * @return: observable of batch or HttpErrorResponse
   */
  configureBackgroundRequest(
    syncMethod: string,
    shouldResolveError: boolean,
    batch: Batch
  ): Observable<Batch | HttpErrorResponse> {
    return this.getBackgroundRequest(syncMethod, batch)
      .pipe(
        catchError(this.errorReporter.handleResolvableCatchError<HttpErrorResponse>(shouldResolveError))
      );
  }

  /**
   * Get active and archived batch lists from server
   *
   * @param: none
   * @return: observable containing active batch list and archived batch list
   */
  getAllBatches(): Observable<{ activeBatches: Batch[], archiveBatches: Batch[] }> {
    return this.http.get<{ activeBatches: Batch[], archiveBatches: Batch[] }>(
      `${BASE_URL}/${API_VERSION}/process/batch`
    );
  }

  /**
   * Construct a server background request
   *
   * @param: syncMethod - the http method: 'post' and 'patch' are valid
   * @param: batch - the batch to base the request body
   * @return: observable of server request
   */
  getBackgroundRequest(syncMethod: string, batch: Batch): Observable<Batch> {
    let route: string = `${BASE_URL}/${API_VERSION}/process/`;
    if (syncMethod === 'post') {
      route += `user/${batch.owner}/master/${batch.recipeMasterId}/variant/${batch.recipeVariantId}`;
      return this.http.post<Batch>(route, batch);
    } else if (syncMethod === 'patch') {
      route += `batch/${batch._id}`;
      return this.http.patch<Batch>(route, batch);
    } else {
      const message: string = `Invalid http method: ${syncMethod}`;
      return throwError(
        new CustomError('HttpRequestError', message, HIGH_SEVERITY, message)
      );
    }
  }

  /**
   * Send a server request in background
   *
   * @param: method - the http method to apply
   * @param: batch - the batch to base the request body
   * @return: obsrevable of batch response
   */
  requestInBackground(method: string, batch: Batch): Observable<Batch> {
    if (method === 'post' || method === 'patch') {
      return this.getBackgroundRequest(method, batch);
    } else {
      const message: string = `Unknown method type: ${method}`;
      return throwError(new CustomError('BatchError', message, HIGH_SEVERITY, message));
    }
  }
}
