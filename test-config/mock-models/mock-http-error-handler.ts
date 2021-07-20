/* Module imports */
import { HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';

export const mockHttpErrorHandler: (error: HttpErrorResponse) => HttpHandler = (error: HttpErrorResponse): HttpHandler => {
  const mock: HttpHandler = {
    handle: (req: HttpRequest<any>) => new Observable<HttpEvent<any>>((observer: Observer<HttpEvent<any>>) => {
      observer.error(error);
    })
  };
  return mock;
};
