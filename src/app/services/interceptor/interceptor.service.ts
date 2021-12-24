/* Module imports */
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { HttpErrorService } from '@services/http-error/http-error.service';
import { UserService } from '@services/user/user.service';


@Injectable({
  providedIn: 'root'
})
export class AuthorizeInterceptor implements HttpInterceptor {

  constructor(public userService: UserService) { }

  /**
   * Add authorization header with json web token
   *
   * @param: req - the outgoing http request
   * @param: next - angular http handler to continue the request
   * @return: observable of http event to pass response back to origin
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken: string = this.userService.getToken();
    const authRequest: HttpRequest<any> = req.clone(
      { headers: req.headers.set('Authorization', `bearer ${authToken}`) }
    );
    return next.handle(authRequest);
  }

}


@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    public errorReporter: ErrorReportingService,
    public httpError: HttpErrorService,
    public userService: UserService
  ) { }

  /**
   * Handle unauthorized response
   *
   * @param: req - the outgoing http request
   * @param: next - angular http handler to continue the request
   * @return: observable of http event to pass response back to origin
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      .pipe(catchError((error: HttpErrorResponse) => this.handleHttpError(error)));
  }

  /**
   * Dispatch and handle caught http error according to status
   *
   * @param: error - the caught HttpErrorResponse
   * @return: throw error of null to continue observable chain
   */
  handleHttpError(error: HttpErrorResponse): Observable<never> {
    if (error && !this.isHandlerExempt(error)) {
      if (error.status === this.httpError.BAD_REQUEST_STATUS) {
        this.reportHttpError(
          error,
          { severity: 2, userMessage: this.httpError.composeErrorMessage(error) }
        );
      } else if (error.status === this.httpError.NOT_AUTHORIZED_STATUS) {
        if (this.userService.isLoggedIn()) {
          this.userService.logOut();
        }
        this.reportHttpError(
          error,
          { severity: 3, userMessage: this.httpError.composeErrorMessage(error) }
        );
      } else if (error.status === this.httpError.FORBIDDEN_STATUS) {
        this.reportHttpError(
          error,
          { severity: 3, userMessage: this.httpError.composeErrorMessage(error) }
        );
      } else if (error.status === this.httpError.NOT_FOUND_STATUS) {
        // 404 may be handled differently by requesters: let requester handle the response
        return throwError(error);
      } else if (error.status > this.httpError.NOT_FOUND_STATUS || error.status === this.httpError.PAYMENT_REQUIRED_STATUS) {
        this.reportHttpError(
          error,
          { severity: 2, userMessage: this.httpError.composeErrorMessage(error) }
        );
      }
    }

    return throwError(null);
  }

  /**
   * Check if caught error should be resolved based on url
   *
   * @param: error - the caught HttpErrorResponse
   * @return: true if url does not contain exempt url string
   */
  isHandlerExempt(error: HttpErrorResponse): boolean {
    return error.url.includes('reporting/error');
  }

  /**
   * Set error report from error response
   *
   * @param: error - the caught HttpErrorResponse
   * @param: [overrides] - optional override fields for error report
   * @return: none
   */
  reportHttpError(error: HttpErrorResponse, overrides?: object): void {
    this.errorReporter.setErrorReport(
      this.errorReporter.getCustomReportFromHttpError(error, overrides)
    );
  }
}
