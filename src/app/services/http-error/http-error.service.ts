/* Module imports */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

/* Service imports */
import { ErrorReportingService } from '../error-reporting/error-reporting.service';


@Injectable({
  providedIn: 'root'
})
export class HttpErrorService {
  readonly BAD_REQUEST_STATUS: number = 400;
  readonly NOT_AUTHORIZED_STATUS: number = 401;
  readonly PAYMENT_REQUIRED_STATUS: number = 402;
  readonly FORBIDDEN_STATUS: number = 403;
  readonly NOT_FOUND_STATUS: number = 404;
  readonly INTERNAL_SERVER_STATUS: number = 500;
  readonly SERVICE_UNAVAILABLE_STATUS: number = 503;

  constructor(public errorReporter: ErrorReportingService) { }

  /**
   * Create an error message based on given http error response
   *
   * @param: error - the thrown http error respnose
   * @return: error message based on error response
   */
  composeErrorMessage(error: HttpErrorResponse): string {
    let errMsg: string;
    if (error instanceof HttpErrorResponse) {
      if (error.status === this.NOT_AUTHORIZED_STATUS && error.error && error.error.error) {
        const drillThroughError: object = error.error.error;
        errMsg = drillThroughError['message'];
      } else {
        const errStatus: number = error.status ? error.status : this.INTERNAL_SERVER_STATUS;
        const errText: string = error.status ? error.statusText : 'Internal Service Error';
        const additionalText: string = error.error && error.error.name === 'ValidationError'
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
   * @param: error - HTTP error response
   * @return: observable of null after handling error
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    const errMsg: string = this.composeErrorMessage(error);
    this.errorReporter.setErrorReport({
      name: 'HttpError',
      message: errMsg,
      severity: this.errorReporter.moderateSeverity,
      timestamp: this.errorReporter.getTimestamp(),
      userMessage: errMsg
    });
    return throwError(null);
  }

}
