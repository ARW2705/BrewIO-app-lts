/* Module imports */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

/* Service imports */
import { ErrorReportingService } from '../services';


@Injectable({
  providedIn: 'root'
})
export class HttpErrorService {

  constructor(public errorReporter: ErrorReportingService) { }

  composeErrorMessage(error: HttpErrorResponse): string {
    let errMsg: string;
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 && error.error && error.error.error) {
        const drilldownError: object = error.error.error;
        errMsg = drilldownError['message'];
      } else {
        const errStatus: number = error.status ? error.status : 500;
        const errText: string = error.status
          ? error.statusText
          : 'Internal Service Error';
        const additionalText: string =
          error.error && error.error.name === 'ValidationError'
            ? `: ${error.error.message}`
            : '';
        errMsg = `<${errStatus}> ${errText || ''}${additionalText}`;
      }
    } else {
      errMsg = 'Unknown http error';
    }
    return errMsg;
  }

  /**
   * Parse HTTP error message into message string
   *
   * @params: error - HTTP error response
   *
   * @return: observable of null after handling error
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    const errMsg: string = this.composeErrorMessage(error);
    this.errorReporter.setErrorReport({
      name: 'HttpError',
      message: errMsg,
      severity: 3,
      timestamp: this.errorReporter.getTimestamp(),
      userMessage: errMsg
    });
    return throwError(null);
  }

}
