/* Module imports */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HttpErrorService {

  constructor() { }

  /**
   * Parse HTTP error message into message string
   *
   * @params: error - HTTP error response
   *
   * @return: observable of error message
   */
  handleError(error: HttpErrorResponse | any): Observable<never> {
    let errMsg: string;
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 && error.error && error.error.error) {
        const drilldownError: object = error.error.error;
        errMsg = drilldownError['message'];
      } else {
        const errStatus: number = error.status ? error.status : 503;
        const errText: string = error.status
          ? error.statusText
          : 'Service unavailable';
        const additionalText: string =
          error.error && error.error.name === 'ValidationError'
            ? `: ${error.error.message}`
            : '';

        errMsg = `<${errStatus}> ${errText || ''}${additionalText}`;
      }
    } else {
      errMsg = (error.message) ? error.message : error.toString();
    }
    return throwError(errMsg);
  }

}
