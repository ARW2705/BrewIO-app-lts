/* Module imports */
import { HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/* Provider imports */
import { UserService } from '../user/user.service';
import { ToastService } from '../toast/toast.service';


@Injectable({
  providedIn: 'root'
})
export class AuthorizedInterceptor implements HttpInterceptor {

  constructor(public injector: Injector) { }

  /**
   * Add authorization header with json web token
   *
   * @params: req - the outgoing http request
   * @params: next - angular http handler to continue the request
   *
   * @return: observable of http event to pass response back to origin
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const userService: UserService = this.injector.get(UserService);
    const authToken: string = userService.getToken();
    const authRequest: HttpRequest<any> = req.clone(
      {headers: req.headers.set('Authorization', `bearer ${authToken}`)}
    );
    return next.handle(authRequest);
  }

}

@Injectable({
  providedIn: 'root'
})
export class UnauthorizedInterceptor implements HttpInterceptor {

  constructor(
    public injector: Injector,
    public toastService: ToastService
  ) { }

  /**
   * Handle unauthorized response
   *
   * @params: req - the outgoing http request
   * @params: next - angular http handler to continue the request
   *
   * @return: observable of http event to pass response back to origin
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next
      .handle(req)
      .pipe(
        tap(
          (): void => {},
          (error): void => {
            const userService: UserService = this.injector.get(UserService);
            if (error instanceof HttpErrorResponse && error.status === 401) {
              if (userService.isLoggedIn()) {
                this.toastService.presentToast(
                  'Not Authorized. Please log in',
                  3000,
                  'bottom',
                  'toast-error'
                );
              } else {
                this.toastService.presentToast(
                  'Authorization Error',
                  3000,
                  'bottom',
                  'toast-error'
                );
              }
            } else {
              this.toastService.presentToast(
                `An unexpected error occured: <${(<HttpErrorResponse>error).status}> ${(<HttpErrorResponse>error).statusText}`,
                3000,
                'bottom',
                'toast-error'
              );
            }
          }
        )
      );
  }
}
