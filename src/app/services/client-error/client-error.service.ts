/* Module imports */
import { Injectable, Injector, ErrorHandler } from '@angular/core';

/* Constant imports */
import { BUILTIN_ERROR_TYPES } from '../../shared/constants';

/* Interface imports */
import { ErrorReport } from '../../shared/interfaces';

/* Service imports */
import { ErrorReportingService } from '../services';


@Injectable({
  providedIn: 'root'
})
export class ClientErrorService implements ErrorHandler {

  constructor(public injector: Injector) {}

  /**
   * Handle a thrown error that has was not previously handled
   *
   * @param: error - the error to handle; expect type Error, but handle any
   *
   * @return: none
   */
  handleError(error: any): void {
    const errorReporter: ErrorReportingService = this.injector.get(ErrorReportingService);
    if (error instanceof Error) {
      errorReporter.setErrorReport(this.createJSErrorReport(error, errorReporter.getTimestamp()));
    } else {
      errorReporter.setErrorReport(this.createUnknownErrorReport(error, errorReporter.getTimestamp()));
    }
  }

  /**
   * Create an error report from an Error
   *
   * @param: error - the caught error
   * @param: timestamp - ISO string timestamp
   *
   * @return: a new error report
   */
  createJSErrorReport(error: Error, timestamp: string): ErrorReport {
    return {
      message: error.message,
      name: error.name,
      severity: error['severity'] || 2,
      stackTrace: error.stack,
      timestamp: timestamp,
      userMessage: this.getUserMessage(error)
    };
  }

  /**
   * Create an error report from an unknown error type
   *
   * @param: error - the caught error
   * @param: timestamp - ISO string timestamp
   *
   * @return: a new error report
   */
  createUnknownErrorReport(error: any, timestamp: string): ErrorReport {
    return {
      name: 'UnknownError',
      message: JSON.stringify(error),
      severity: 2,
      timestamp: timestamp,
      userMessage: this.getUserMessage(error)
    };
  }

  /**
   * Format an error message to present to the user
   *
   * @param: error - the caught error
   *
   * @return: an error message for the user; may be empty string
   */
  getUserMessage(error: any): string {
    if (error && error['name'] && BUILTIN_ERROR_TYPES.includes(error.name)) {
      return 'A system error has occurred';
    } else if (error && error.hasOwnProperty('userMessage')) {
      return error.userMessage;
    } else if (error && error.message) {
      return error.message;
    } else {
      return '';
    }
  }

}
