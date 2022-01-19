/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

/* Constant imports */
import { API_VERSION, BASE_URL, HIGH_SEVERITY } from '@shared/constants';

/* Interface imports*/
import { ImageRequestMetadata, InventoryItem } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ConnectionService } from '@services/connection/connection.service';
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { InventoryImageService } from '@services/inventory/image/inventory-image.service';


@Injectable({
  providedIn: 'root'
})
export class InventoryHttpService {

  constructor(
    public connectionService: ConnectionService,
    public errorReporter: ErrorReportingService,
    public http: HttpClient,
    public inventoryImageService: InventoryImageService
  ) { }

  /**
   * Configure a background request while defining which error handling method to use
   *
   * @param: requestMethod - the http method to apply
   * @param: shouldResolveError - true if error should return the error response as an observable
   * or false if error should be handled as an error
   * @param: item - the InventoryItem to use in request
   * @return: observable of InventoryItem or HttpErrorResponse
   */
  configureSyncBackgroundRequest(
    requestMethod: string,
    shouldResolveError: boolean,
    item: InventoryItem,
    deletionId?: string
  ): Observable<InventoryItem | HttpErrorResponse> {
    return this.getBackgroundRequest(requestMethod, item, deletionId)
      .pipe(
        catchError(this.errorReporter.handleResolvableCatchError<InventoryItem>(shouldResolveError))
      );
  }

  /**
   * Construct a server request
   *
   * @param: requestMethod - the http method to call
   * @param: item - item to use in request
   * @param: [deletionId] - id to delete if item has already been deleted locally
   * @return: observable of server request
   */
  getBackgroundRequest(
    requestMethod: string,
    item: InventoryItem,
    deletionId?: string
  ): Observable<InventoryItem> {
    let route: string = `${BASE_URL}/${API_VERSION}/inventory`;
    if (requestMethod === 'delete') {
      if (deletionId) {
        route += `/${deletionId}`;
      } else {
        route += `/${item._id}`;
      }
      return this.http.delete<InventoryItem>(route);
    }

    return this.inventoryImageService.getImageRequest(item)
      .pipe(
        mergeMap((imageData: ImageRequestMetadata[]): Observable<InventoryItem> => {
          const formData: FormData = new FormData();
          formData.append('inventoryItem', JSON.stringify(item));
          imageData.forEach((imageDatum: ImageRequestMetadata): void => {
            formData.append(imageDatum.name, imageDatum.blob, imageDatum.filename);
          });
          if (requestMethod === 'post') {
            return this.http.post<InventoryItem>(route, formData);
          } else if (requestMethod === 'patch') {
            route += `/${item._id}`;
            return this.http.patch<InventoryItem>(route, formData);
          } else {
            const message: string = `Invalid http method: ${requestMethod}`;
            return throwError(
              new CustomError('InventoryHttpRequestError', message, HIGH_SEVERITY, message)
            );
          }
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Fetch the inventory list from server
   *
   * @param: none
   * @return: observable of inventory list
   */
  getInventoryFromServer(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${BASE_URL}/${API_VERSION}/inventory`);
  }

  /**
   * Send a server request in background
   *
   * @param: requestMethod - http request method
   * @param: item - inventory item request body
   * @return: observable of item response
   */
  requestInBackground(requestMethod: string, item: InventoryItem): Observable<InventoryItem> {
    if (requestMethod === 'post' || requestMethod === 'patch' || requestMethod === 'delete') {
      return this.getBackgroundRequest(requestMethod, item);
    } else {
      const message: string = `Unknown request type: ${requestMethod}`;
      return throwError(new CustomError('InventoryError', message, HIGH_SEVERITY, message));
    }
  }
}
