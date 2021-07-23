/* Module imports */
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable, from, of, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';

/* Interface imports */
import { ErrorReport } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Component imports */
import { ErrorReportPage } from '../../pages/error-report/error-report.page';

/* Service imports */
import { DeviceService } from '../device/device.service';
import { LoggingService } from '../logging/logging.service';
import { ToastService } from '../toast/toast.service';


@Injectable({
  providedIn: 'root'
})
export class ErrorReportingService {
  reports: ErrorReport[] = [];
  isErrorModalOpen: boolean = false;

  constructor(
    public device: DeviceService,
    public logger: LoggingService,
    public modalCtrl: ModalController,
    public router: Router,
    public toastService: ToastService
  ) {}

  /***** Error Report *****/

  /**
   * Clear all error reports
   *
   * @param: none
   * @return: none
   */
  clearErrorReport(): void {
    this.reports = [];
  }

  /**
   * Format an error report
   *
   * @param: name - the error name
   * @param: message - the error message (not to be shown to user, put sensitive error context here)
   * @param: severity - the severity of the error (see ErrorReport interface for details)
   * @param: userMessage - a message to display to the user
   * @param: [dismissFn] - optional cleanup function to call on error report resolution
   *
   * @return: a new error report
   */
  createErrorReport(
    name: string,
    message: string,
    severity: number,
    userMessage: string,
    dismissFn?: () => void
  ): ErrorReport {
    return {
      name: name,
      message: message,
      severity: severity,
      timestamp: this.getTimestamp(),
      userMessage: userMessage,
      dismissFn: dismissFn
    };
  }

  /**
   * Create custom error report from a given Error
   *
   * @param: error - the error to base the report on
   * @param: overrides - object containing any field overrides to apply
   *
   * @return: a new error report
   */
  getCustomReportFromError(error: Error | CustomError, overrides: object = {}): ErrorReport {
    return {
      dismissFn: overrides.hasOwnProperty('dismissFn') ? overrides['dismissFn'] : null,
      name: overrides.hasOwnProperty('name') ? overrides['name'] : error.name,
      message: overrides.hasOwnProperty('message') ? overrides['message'] : error.message,
      severity: overrides.hasOwnProperty('severity')
                ? overrides['severity']
                : this.getReportSeverity(error),
      stackTrace: error.stack,
      timestamp: this.getTimestamp(),
      userMessage:  overrides.hasOwnProperty('userMessage')
                    ? overrides['userMessage']
                    : this.getReportUserMessage(error)
    };
  }

  /**
   * Create custom error report from a given HttpErrorResponseError
   *
   * @param: error - the error to base the report on
   * @param: overrides - object containing any field overrides to apply
   *
   * @return: a new error report
   */
  getCustomReportFromHttpError(error: HttpErrorResponse, overrides: object = {}): ErrorReport {
    return {
      dismissFn: overrides.hasOwnProperty('dismissFn') ? overrides['dismissFn'] : null,
      headers: this.getHeaders(error),
      name: overrides.hasOwnProperty('name') ? overrides['name'] : error.name,
      message: overrides.hasOwnProperty('message') ? overrides['message'] : error.message,
      severity: overrides.hasOwnProperty('severity')
                ? overrides['severity']
                : this.getReportSeverity(error),
      statusCode: error.status,
      timestamp: this.getTimestamp(),
      url: error.url,
      userMessage:  overrides.hasOwnProperty('userMessage')
                    ? overrides['userMessage']
                    : this.getReportUserMessage(error)
    };
  }

  /**
   * Set an error report and trigger the appropriate user notification and logging
   *
   * @param: report - the new report to add
   *
   * @return: none
   */
  setErrorReport(report: ErrorReport): void {
    report.timestamp = this.getTimestamp();
    const consoleMessage: string = `${report.name}: ${report.message}`;
    if (report.severity < 3) {
      this.reports.push(report);
      console.error(consoleMessage);
      if (this.isErrorModalOpen) {
        this.logErrorReports();
      } else {
        this.isErrorModalOpen = true;
        this.openReportModal();
      }
    } else if (report.severity === 3) {
      this.reports.push(report);
      console.warn(consoleMessage);
      this.presentErrorToast(report.userMessage, report.dismissFn);
      this.logErrorReports();
    } else {
      console.log(consoleMessage);
    }
  }

  /***** End Error Report *****/


  /***** Custom Error Handler *****/

  /**
   * Get a generic catch error handler
   *
   * @param: [overrideError] - optional replacement error to handle
   *
   * @return: error handling function
   */
  handleGenericCatchError(
    overrideError?: Error
  ): (error: Error | HttpErrorResponse) => Observable<never> {
    return (error: Error): Observable<never> => {
      if (error) {
        if (error instanceof Error || overrideError) {
          this.setErrorReport(this.getCustomReportFromError(overrideError || error));
        } else {
          this.setErrorReport(this.getCustomReportFromHttpError(error));
        }
      }
      return throwError(null);
    };
  }

  /**
   * Get a generic catch error handler that can optionally resolve the error
   *
   * @param: shouldResolveError - true if error should resolve, false to continue as error
   * @param: [resolvedValue] - optional replacement value to return from handler function
   *
   * @return: optionally resolvable error handling function
   */
  handleResolvableCatchError<T>(
    shouldResolveError: boolean,
    resolvedValue?: T
  ): (error: Error | HttpErrorResponse) => Observable<T | never> {
    return (error: Error | HttpErrorResponse): Observable<null | never> => {
      if (shouldResolveError) {
        return of(resolvedValue as any);
      } else if (error && error instanceof HttpErrorResponse) {
        this.setErrorReport(this.getCustomReportFromHttpError(error));
      } else if (error) {
        this.setErrorReport(this.getCustomReportFromError(error));
      }
      return throwError(null);
    };
  }

  /**
   * Handle an error that should have already been handled; if null, error was previously handled
   *
   * @param: error - the caught error
   *
   * @return: none
   */
  handleUnhandledError(error: any): void {
    if (error) {
      this.setErrorReport(
        this.getCustomReportFromError(
          this.formatUnhandledError(error)
        )
      );
    }
  }

  /***** End Custom Error Handler *****/


  /***** Modal *****/

  /**
   * Handle generic modal error reporting
   *
   * @param: errorMessage - the error message
   * @param: [userMessage] - optional user error message
   *
   * @return: none
   */
  handleModalError(errorMessage: string, userMessage?: string): void {
    this.setErrorReport(this.createErrorReport('ModalError', errorMessage, 4, userMessage || ''));
  }

  /**
   * Open error report modal; Log error report and navigate to home on dismiss
   *
   * @param: none
   * @return: none
   */
  async openReportModal(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: ErrorReportPage,
      componentProps: {
        reports: this.reports,
        shouldHideLoginButton: true
      }
    });

    from(modal.onDidDismiss())
      .pipe(finalize((): void => { this.isErrorModalOpen = false; }))
      .subscribe(
        (data: object): void => {
          const _data: object = data['data'];
          if (_data) {
            this.logErrorReports();
          }
          this.clearErrorReport();
          this.navToHome();
        }
      );

    return await modal.present();
  }

  /***** End Modal ******/


  /***** Message Helpers *****/

  /**
   * Get a string of all headers from an HttpErrorResponse
   *
   * @param: error - an HttpErrorResponse
   *
   * @return: string of comma separated headers
   */
  getHeaders(error: HttpErrorResponse): string {
    const headerKeys: string[] = error.headers.keys();
    return headerKeys
      .reduce(
        (acc: string, curr: string): string => {
          const headers: string[] = error.headers.getAll(curr);
          return acc + curr + ': ' + headers.join(',') + ', ';
        },
        ''
      );
  }

  /**
   * Get error severity for report
   *
   * @param: error - the given error
   *
   * @return: error severity 1 (highest) - 4 (lowest)
   */
  getReportSeverity(error: Error | CustomError | HttpErrorResponse): number {
    return error instanceof CustomError ? error.severity : 2;
  }

  /**
   * Get error user accessible message for report
   *
   * @param: error - the given error
   *
   * @return: message to display to user
   */
  getReportUserMessage(error: Error | CustomError | HttpErrorResponse): string {
    if (error instanceof CustomError) {
      return error.userMessage;
    } else if (error instanceof HttpErrorResponse) {
      return error.statusText;
    } else {
      return 'An internal error occurred';
    }
  }

  /**
   * Get current datetime ISO string
   *
   * @param: none
   *
   * @return: current datetime as ISO string
   */
  getTimestamp(): string {
    return (new Date()).toISOString();
  }

  /**
   * Format an unhandled error
   *
   * @param: error - the caught error
   *
   * @return: a custom error based on given error
   */
  formatUnhandledError(error: any): CustomError {
    const baseMessage: string = 'An unhandled error occurred';
    const messageExtention: string = JSON.stringify(error, null, 2);
    return new CustomError(
      'UncaughtError',
      `${baseMessage}: ${messageExtention}`,
      2,
      baseMessage
    );
  }

  /***** End Message Helpers *****/


  /***** Other *****/

  /**
   * Log error reports
   *
   * @param: none
   * @return: none
   */
  logErrorReports(): void {
    this.reports.forEach((report: ErrorReport): void => { report.device = this.device.getDeviceInfo(); });
    this.logger.logErrorReports(this.reports);
  }

  /**
   * Navigate to home page
   *
   * @param: none
   * @return: none
   */
  navToHome(): void {
    this.router.navigate(['/tabs/home']);
  }

  /**
   * Present and error message toast
   *
   * @param: message - message to display
   * @param: [dismissFn] - optional function to call on toast dismiss
   *
   * @return: none
   */
  presentErrorToast(message: string, dismissFn?: () => void): void {
    this.toastService.presentErrorToast(message, dismissFn);
  }

  /***** End Other *****/

}
